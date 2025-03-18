import mongoose from 'mongoose';
import Room from '../models/room.js';
import DepositRoom from '../models/depositRoom.js';
import Account from '../models/account.js';

class TenantController {
  async getTenantsByBoardingHouse(req, res) {
    try {
      const { boardingHouseId } = req.params;

      if (
        !boardingHouseId ||
        !mongoose.Types.ObjectId.isValid(boardingHouseId)
      ) {
        return res
          .status(400)
          .json({ message: 'Invalid or missing boardingHouseId' });
      }

      // 🔍 Lấy tất cả phòng trong boarding house
      const rooms = await Room.find({ boardingHouseId })
        .populate('rentBy', 'fullname email phoneNumber') // Thêm email, phone nếu cần
        .select('_id roomNumber rentBy');

      if (!rooms.length) {
        return res
          .status(404)
          .json({ message: 'No rooms found for this boarding house.' });
      }

      // 🔥 Lấy danh sách tenantId từ phòng
      const tenants = [];
      for (const room of rooms) {
        for (const tenantAccount of room.rentBy) {
          // Kiểm tra thông tin đặt cọc có **status: "accept"**
          const depositInfo = await DepositRoom.findOne({
            roomId: room._id,
            accountId: tenantAccount._id,
            status: 'accepted', // 🎯 Chỉ lấy những deposit đã được accept
          });

          if (depositInfo) {
            tenants.push({
              accountId: tenantAccount._id, // ⚡️ Thêm accountId để dùng khi xóa
              tenantName: tenantAccount.fullname,
              roomNumber: room.roomNumber,
              totalDepositTime: depositInfo.rentalTime,
              startDepositDate: depositInfo.createdAt,
              endDepositDate: depositInfo.endDate,
            });
          }
        }
      }

      res.status(200).json(tenants);
    } catch (error) {
      console.error('Error fetching tenants by boarding house:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  async deleteTenantFromBoardingHouse(req, res) {
    try {
      const { boardingHouseId, accountId } = req.params;

      // Kiểm tra ID hợp lệ
      if (
        !mongoose.Types.ObjectId.isValid(boardingHouseId) ||
        !mongoose.Types.ObjectId.isValid(accountId)
      ) {
        return res
          .status(400)
          .json({ message: 'Invalid or missing parameters.' });
      }

      const accountObjectId = new mongoose.Types.ObjectId(accountId);
      const boardingHouseObjectId = new mongoose.Types.ObjectId(
        boardingHouseId
      );

      // 🔍 Debug: In ra danh sách phòng của tenant
      const tenantRooms = await Room.find({
        boardingHouseId: boardingHouseObjectId,
        rentBy: { $elemMatch: { $eq: accountObjectId } }, // Kiểm tra nếu tenant thực sự ở đây
      }).select('_id roomNumber rentBy');

      console.log('🔍 Tenant is in these rooms:', tenantRooms);

      if (!tenantRooms.length) {
        return res.status(404).json({
          message: 'Tenant is not renting any rooms in this boarding house.',
        });
      }

      const roomIdsTenantRenting = tenantRooms.map((room) => room._id);

      // 🔍 Kiểm tra xem tenant có deposit nào trùng với phòng họ thuê không
      const deposit = await DepositRoom.findOne({
        roomId: { $in: roomIdsTenantRenting },
        accountId: accountObjectId,
        status: { $ne: 'deleted' }, // Chỉ lấy deposit còn hiệu lực
      });

      console.log('🔍 Deposit found:', deposit);

      if (!deposit) {
        return res.status(404).json({
          message:
            'No valid deposit record found for this tenant in this boarding house.',
        });
      }

      const roomIdToDelete = deposit.roomId; // Lấy đúng `roomId` cần xóa

      // 🛠 Cập nhật trạng thái deposit thành "deleted"
      await DepositRoom.updateOne(
        { roomId: roomIdToDelete, accountId: accountObjectId },
        { $set: { status: 'deleted' } }
      );

      // ❌ Xóa tenant khỏi `rentBy` của đúng phòng có `roomId` trùng với deposit
      await Room.updateOne(
        { _id: roomIdToDelete },
        { $pull: { rentBy: accountObjectId } }
      );

      res.status(200).json({
        message:
          'Tenant successfully removed from the specified room in the boarding house.',
      });
    } catch (error) {
      console.error('❌ Error deleting tenant from boarding house:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default new TenantController();
