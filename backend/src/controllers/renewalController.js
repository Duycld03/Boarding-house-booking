import ExtensionRequest from '../models/extensionRequest.js';
import Room from '../models/room.js';
import BoardingHouse from '../models/boardingHouse.js';
import DepositRoom from '../models/depositRoom.js';

class renewalController {
  async getExtensionRequests(req, res) {
    const accountId = req.user.userId;
    try {
      const extensionRequests = await ExtensionRequest.find({ accountId })
        .populate({
          path: 'roomId',
          select: 'roomNumber boardingHouseId',
          populate: {
            path: 'boardingHouseId',
          },
        })
        .sort({ createdAt: -1 });

      res.json(extensionRequests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createExtensionRequest(req, res) {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Unauthorized: No user data' });
      }

      const accountId = req.user.userId;
      const {
        roomId,
        depositRoomId,
        currentEndDate,
        requestedEndDate,
        tenantNote,
      } = req.body;

      // Kiểm tra thiếu trường dữ liệu
      if (!roomId || !depositRoomId || !requestedEndDate) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Tạo yêu cầu gia hạn
      const extensionRequest = await ExtensionRequest.create({
        accountId,
        roomId,
        depositRoomId,
        currentEndDate,
        requestedEndDate,
        tenantNote,
        status: 'pending',
      });

      res.json(extensionRequest);
    } catch (error) {
      console.error('Error creating extension request:', error);
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message });
    }
  }

  async updateExtensionRequest(req, res) {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Unauthorized: No user data' });
      }

      const { requestId } = req.params;
      const { requestedEndDate, tenantNote } = req.body;

      // Kiểm tra nếu requestId không được cung cấp
      if (!requestId) {
        return res.status(400).json({ message: 'Missing requestId parameter' });
      }

      // Tìm yêu cầu gia hạn theo ID
      const extensionRequest = await ExtensionRequest.findById(requestId);
      if (!extensionRequest) {
        return res.status(404).json({ message: 'Extension request not found' });
      }

      // Cập nhật thông tin mới
      extensionRequest.requestedEndDate =
        requestedEndDate || extensionRequest.requestedEndDate;
      extensionRequest.tenantNote = tenantNote || extensionRequest.tenantNote;
      extensionRequest.updatedAt = new Date(); // Ghi nhận thời gian cập nhật

      // Lưu thay đổi
      await extensionRequest.save();

      res.json({
        message: 'Extension request updated successfully',
        extensionRequest,
      });
    } catch (error) {
      console.error('Error updating extension request:', error);
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message });
    }
  }
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
            requestId: request._id,
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
  async acceptExtensionRequest(req, res, next) {
    const { requestId } = req.params; // ExtensionRequest ID

    try {
      // Step 1: Find the extension request by ID
      const extensionRequest = await ExtensionRequest.findById(requestId)
        .populate('roomId')
        .populate('accountId');

      if (!extensionRequest) {
        return res.status(404).json({ message: 'Extension request not found' });
      }

      // Step 2: Check if the request is pending
      if (extensionRequest.status !== 'pending') {
        return res
          .status(400)
          .json({ message: 'Only pending requests can be accepted' });
      }

      // Step 4: Find the corresponding DepositRoom and update the endDate
      const deposit = await DepositRoom.findOne({
        accountId: extensionRequest.accountId,
        roomId: extensionRequest.roomId,
      });

      if (!deposit) {
        return res
          .status(404)
          .json({ message: 'Deposit record not found for the room' });
      }

      // Update the deposit's endDate to the requested end date from ExtensionRequest
      deposit.endDate = extensionRequest.requestedEndDate;
      await deposit.save();
      // Step 3: Update the status of the extension request to 'accepted'
      extensionRequest.status = 'accepted';
      extensionRequest.depositRoomId = deposit._id;
      await extensionRequest.save();

      // Step 5: Respond with success
      res.status(200).json({
        message: 'Extension request accepted and deposit updated successfully',
        data: extensionRequest,
      });
    } catch (error) {
      console.error('Error accepting extension request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  async rejectExtensionRequest(req, res, next) {
    const { requestId } = req.params; // ExtensionRequest ID
    const { reasonForCancel } = req.body; // Reason for cancellation when rejecting

    try {
      // Step 1: Find the extension request by ID
      const extensionRequest = await ExtensionRequest.findById(requestId)
        .populate('roomId')
        .populate('accountId');

      if (!extensionRequest) {
        return res.status(404).json({ message: 'Extension request not found' });
      }
      // Step 3: Reject the request
      extensionRequest.status = 'rejected';
      extensionRequest.reasonForCancel = reasonForCancel;

      // Optional: gán depositRoomId nếu schema yêu cầu
      const deposit = await DepositRoom.findOne({
        accountId: extensionRequest.accountId,
        roomId: extensionRequest.roomId,
      });
      if (deposit) {
        extensionRequest.depositRoomId = deposit._id;
      }

      await extensionRequest.save();

      // Step 4: Respond with success
      res.status(200).json({
        message: 'Extension request rejected successfully',
        data: extensionRequest,
      });
    } catch (error) {
      console.error('Error rejecting extension request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
export default new renewalController();
