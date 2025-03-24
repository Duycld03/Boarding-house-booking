import mongoose from 'mongoose';
import Room from '../models/room.js';
import ExtensionRequest from '../models/extensionRequest.js';
import BoardingHouse from '../models/boardingHouse.js';
import Account from '../models/account.js'; // import model Account

class RenewalRequestController {
  async getRenewalRequestByBhID(req, res, next) {
    try {
      // Lấy boardingHouseId từ tham số URL
      const boardingHouseId = req.params.boardingHouseId;

      // Lấy danh sách các phòng thuộc nhà trọ này
      const rooms = await Room.find({ boardingHouseId });

      if (!rooms || rooms.length === 0) {
        // Nếu không có phòng nào trong nhà trọ, trả về lỗi
        return res.status(404).json({
          success: false,
          message: 'No rooms found for this boarding house',
        });
      }

      // Lấy danh sách các yêu cầu gia hạn phòng trọ liên quan đến các phòng này
      const extensionRequests = await ExtensionRequest.find({
        roomId: { $in: rooms.map((room) => room._id) },
      }).populate('accountId roomId'); // Populating accountId và roomId

      if (!extensionRequests || extensionRequests.length === 0) {
        // Nếu không có yêu cầu gia hạn nào, trả về thông báo
        return res.status(404).json({
          success: false,
          message: 'No extension requests found for this boarding house',
        });
      }

      // Tạo mảng kết quả với thông tin chi tiết
      const results = await Promise.all(
        extensionRequests.map(async (request) => {
          // Lấy thông tin tên người tạo yêu cầu (tenant) từ accountId (sau khi populate)
          const tenant = request.accountId
            ? request.accountId.fullname
            : 'Unknown';

          // Lấy thông tin phòng từ request.roomId
          const room = await Room.findById(request.roomId);
          const roomNumber = room ? room.roomNumber : 'Unknown';

          // Lấy thông tin nhà trọ
          const boardingHouse = await BoardingHouse.findById(
            room.boardingHouseId
          );

          // Lấy status của yêu cầu gia hạn
          const status = request.status || 'pending'; // Default to 'pending' if no status

          return {
            tenantName: tenant, // Tên người tạo yêu cầu
            roomNumber: roomNumber, // Số phòng
            boardingHouseName: boardingHouse ? boardingHouse.name : 'Unknown',
            currentEndDate: request.currentEndDate,
            requestedEndDate: request.requestedEndDate,
            status: status, // Trả về trạng thái của yêu cầu
          };
        })
      );

      // Trả kết quả về cho người dùng
      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      // Nếu có lỗi, chuyển qua middleware error handling
      next(error);
    }
  }
}

export default new RenewalRequestController();
