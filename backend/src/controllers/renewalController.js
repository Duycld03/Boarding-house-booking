import ExtensionRequest from '../models/extensionRequest.js';
import Room from '../models/room.js';
import BoardingHouse from '../models/boardingHouse.js';
import DepositRoom from '../models/depositRoom.js';
import paginate from '../utils/pagination.js';

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
      const boardingHouseId = req.params.boardingHouseId;

      // Tìm tất cả các phòng thuộc nhà trọ này
      const rooms = await Room.find({ boardingHouseId });

      if (!rooms || rooms.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No rooms found for this boarding house',
        });
      }

      const roomIds = rooms.map((room) => room._id);

      // Tạo filter cho paginate
      const filter = {
        roomId: { $in: roomIds },
      };

      // Cấu hình paginate options
      const paginationOptions = {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100,
        sortField: 'createdAt',
        sortOrder: 'desc',
        filter,
        allowSearchFields: [],
        fields: '',
        populate: [
          {
            path: 'accountId',
            select: 'fullname email',
          },
          {
            path: 'roomId',
            select: 'roomNumber boardingHouseId',
            populate: {
              path: 'boardingHouseId',
              select: 'name',
            },
          },
        ],
        includeTotalData: true,
      };

      // Gọi paginate
      const result = await paginate(ExtensionRequest, paginationOptions, req);

      // Biến đổi kết quả để phù hợp với định dạng bạn mong muốn
      const results = result.data.map((request) => {
        const tenantName = request.accountId?.fullname || 'Unknown';
        const roomNumber = request.roomId?.roomNumber || 'Unknown';
        const boardingHouseName =
          request.roomId?.boardingHouseId?.name || 'Unknown';
        const status = request.status || 'pending';

        return {
          requestId: request._id,
          tenantName,
          roomNumber,
          boardingHouseName,
          currentEndDate: request.currentEndDate,
          requestedEndDate: request.requestedEndDate,
          status,
        };
      });

      // Trả về kết quả có phân trang
      return res.status(200).json({
        success: true,
        data: results,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async handleExtensionRequestAction(req, res, next) {
    const { requestId } = req.params;
    const { action, reasonForCancel } = req.body; // action: "accept" | "reject"

    try {
      // Bước 1: Tìm ExtensionRequest
      const extensionRequest = await ExtensionRequest.findById(requestId)
        .populate('roomId')
        .populate('accountId');

      if (!extensionRequest) {
        return res.status(404).json({ message: 'Extension request not found' });
      }

      if (extensionRequest.status !== 'pending') {
        return res
          .status(400)
          .json({ message: 'Only pending requests can be processed' });
      }

      // Bước 2: Tìm deposit liên quan
      // Fix trong controller
      const deposit = await DepositRoom.findOne({
        accountId: extensionRequest.accountId?._id,
        roomId: extensionRequest.roomId?._id,
      });

      if (!deposit && action === 'accept') {
        return res
          .status(404)
          .json({ message: 'Deposit record not found for the room' });
      }

      // Bước 3: Xử lý theo action
      if (action === 'accept') {
        deposit.endDate = extensionRequest.requestedEndDate;
        await deposit.save();

        extensionRequest.status = 'accepted';
        extensionRequest.depositRoomId = deposit._id;
      } else if (action === 'reject') {
        extensionRequest.status = 'rejected';
        extensionRequest.reasonForCancel = reasonForCancel || '';

        if (deposit) {
          extensionRequest.depositRoomId = deposit._id;
        }
      } else {
        return res.status(400).json({ message: 'Invalid action type' });
      }

      await extensionRequest.save();

      // Bước 4: Trả kết quả
      return res.status(200).json({
        message: `Extension request ${action}ed successfully`,
        data: extensionRequest,
      });
    } catch (error) {
      console.error('Error handling extension request action:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}
export default new renewalController();
