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

      // 🔍 Lấy tất cả phòng trong boarding house
      const allRooms = await Room.find({
        boardingHouseId: boardingHouseObjectId,
      }).select('_id roomNumber rentBy');

      // 🔥 Lọc ra phòng chứa tenant này
      const rooms = allRooms.filter((room) =>
        room.rentBy.some((tenantId) => tenantId.equals(accountObjectId))
      );

      if (!rooms.length) {
        return res
          .status(404)
          .json({ message: 'Tenant not found in any rooms.' });
      }

      const roomIds = rooms.map((room) => room._id);

      // 🔍 Tìm deposit record của tenant này
      const depositInfo = await DepositRoom.findOne({
        roomId: { $in: roomIds },
        accountId: accountObjectId,
      });

      if (!depositInfo) {
        return res
          .status(404)
          .json({ message: 'No deposit record found for this tenant.' });
      }

      // 🛠 Cập nhật trạng thái deposit thành "deleted"
      await DepositRoom.updateMany(
        { roomId: { $in: roomIds }, accountId: accountObjectId },
        { $set: { status: 'deleted' } }
      );

      // 🔥 Kiểm tra rentBy trước khi xóa
      const roomCheckBefore = await Room.find({ _id: { $in: roomIds } }).select(
        '_id rentBy'
      );

      // ❌ Xóa tenant khỏi danh sách `rentBy` bằng cách cập nhật toàn bộ mảng (nếu $pull không hoạt động)
      for (const room of rooms) {
        const updatedRentBy = room.rentBy.filter(
          (id) => !id.equals(accountObjectId)
        );
        await Room.updateOne(
          { _id: room._id },
          { $set: { rentBy: updatedRentBy } }
        );
      }

      // 🔥 Kiểm tra lại sau khi xóa
      const roomCheckAfter = await Room.find({ _id: { $in: roomIds } }).select(
        '_id rentBy'
      );

      res.status(200).json({
        message: 'Tenant successfully removed from the boarding house.',
      });
    } catch (error) {
      console.error('❌ Error deleting tenant from boarding house:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default new TenantController();
