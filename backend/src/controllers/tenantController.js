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

      const rooms = await Room.find({ boardingHouseId })
        .populate('rentBy', 'fullname')
        .select('_id roomNumber rentBy');

      if (!rooms.length) {
        return res
          .status(404)
          .json({ message: 'No rooms found for this boarding house.' });
      }

      const tenants = [];

      for (const room of rooms) {
        // Lấy thông tin đặt cọc của phòng
        const depositInfo = await DepositRoom.findOne({ roomId: room._id });

        if (room.rentBy.length > 0 && depositInfo) {
          room.rentBy.forEach((tenantAccount) => {
            tenants.push({
              tenantName: tenantAccount.fullname,
              roomNumber: room.roomNumber,
              totalDepositTime: depositInfo.rentalTime,
              startDepositDate: depositInfo.createdAt,
              endDepositDate: depositInfo.endDate,
            });
          });
        }
      }

      res.status(200).json(tenants);
    } catch (error) {
      console.error('Error fetching tenants by boarding house:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }
}

export default new TenantController();
