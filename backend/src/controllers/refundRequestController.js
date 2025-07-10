import moment from "moment";
import RefundRequest from "../models/refundRequest.js";
import DepositRoom from "../models/depositRoom.js";

class RefundRequestController {
  async getRefundRequests(req, res) {
    try {
      const refundRequests = await RefundRequest.find({
        accountId: req.user.userId,
      })
        .populate({
          path: "depositRoomId",
          populate: {
            path: "roomId",
            populate: {
              path: "boardingHouseId", // Populate boardingHouseId để lấy thông tin tên
              select: "name", // Chỉ lấy trường 'name' của boardingHouse
            },
          },
        })
        .sort({ createdAt: -1 });

      const data = refundRequests.map((refundRequest) => {
        return {
          _id: refundRequest._id,
          roomNumber: refundRequest.depositRoomId.roomId.roomNumber,
          endDate: moment(refundRequest.depositRoomId.endDate).format(
            "DD/MM/YYYY"
          ),
          amountRefunded: refundRequest.amountRefunded,
          status: refundRequest.status,
          reason: refundRequest.reason,
          boardingHouseName:
            refundRequest.depositRoomId?.roomId?.boardingHouseId?.name || "N/A", // Thêm tên boardingHouse vào
          createdAt: moment(refundRequest.createdAt).format("DD/MM/YYYY"),
        };
      });

      return res.json(data);
    } catch (error) {
      console.log("Error getting refund requests:", error);
      return res.status(500).json(error);
    }
  }

  async getRefundRequestsForOwner(req, res) {
    try {
      const refundRequests = await RefundRequest.find().populate({
        path: "depositRoomId",
        populate: {
          path: "roomId",
          populate: {
            path: "boardingHouseId",
            match: { ownerId: req.user.userId },
            select: "name",
          },
        },
      });

      const filteredRefundRequests = refundRequests.filter(
        (refundRequest) => refundRequest.depositRoomId?.roomId?.boardingHouseId
      );

      const data = filteredRefundRequests.map((refundRequest) => {
        return {
          _id: refundRequest._id,
          roomNumber: refundRequest.depositRoomId.roomId.roomNumber,
          endDate: moment(refundRequest.depositRoomId.endDate).format(
            "DD/MM/YYYY"
          ),
          amountRefunded: refundRequest.amountRefunded,
          boardingHouseName:
            refundRequest.depositRoomId?.roomId?.boardingHouseId?.name || "N/A", // Lấy tên của boardingHouse
          status: refundRequest.status,
          reason: refundRequest.reason,
          createdAt: moment(refundRequest.createdAt).format("DD/MM/YYYY"),
        };
      });
      return res.json(data);
    } catch (error) {
      console.log("Error getting refund requests:", error);
      return res.status(500).json(error);
    }
  }
  async cancelRefundRequestsForOwner(req, res) {
    const { reasonForCancel } = req.body; // Lý do hủy nhận từ body
    const { refundRequestId } = req.params; // ID yêu cầu hoàn tiền nhận từ params

    try {
      // Tìm refundRequest theo ID và kiểm tra quyền sở hữu của chủ phòng
      const refundRequest = await RefundRequest.findById(
        refundRequestId
      ).populate({
        path: "depositRoomId",
        populate: {
          path: "roomId",
          populate: {
            path: "boardingHouseId",
            match: { ownerId: req.user.userId }, // Kiểm tra xem chủ sở hữu có phải là người yêu cầu không
          },
        },
      });

      // Nếu không tìm thấy yêu cầu hoặc không phải chủ sở hữu
      if (
        !refundRequest ||
        !refundRequest.depositRoomId?.roomId?.boardingHouseId
      ) {
        return res.status(404).json({
          message: "Refund request not found or you are not the owner.",
        });
      }

      // Cập nhật trạng thái và lý do hủy, các trường khác giữ nguyên
      refundRequest.status = "canceled";
      refundRequest.reasonForCancel = reasonForCancel || ""; // Lưu lý do hủy (có thể là chuỗi rỗng nếu không có lý do)

      // Lưu thay đổi vào database
      await refundRequest.save();

      return res.json({ message: "Refund request canceled successfully." });
    } catch (error) {
      console.log("Error canceling refund request:", error);
      return res.status(500).json({
        message: "An error occurred while canceling the refund request.",
        error,
      });
    }
  }

  async createRefundRequest(req, res) {
    try {
      const { depositRoomId, reason } = req.body;

      if (!depositRoomId || !reason) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields.",
        });
      }

      const depositRoom = await DepositRoom.findById(depositRoomId);
      if (!depositRoom) {
        return res.status(404).json({
          success: false,
          message: "Deposit room not found.",
        });
      }

      // Check if deposit belongs to the user
      if (depositRoom.accountId.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to create refund request for this deposit.",
        });
      }

      const currentDate = new Date();
      const endDate = new Date(depositRoom.endDate);
      const daysDiff = Math.ceil(
        (endDate - currentDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff > 7) {
        return res.status(400).json({
          success: false,
          message:
            "Refund request can only be created 7 days before the deposit end date.",
        });
      }

      const existingRequest = await RefundRequest.findOne({
        depositRoomId,
        accountId: req.user.userId,
        status: { $ne: "rejected" },
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: "A refund request already exists for this deposit.",
        });
      }

      const refundRequest = await RefundRequest.create({
        depositRoomId,
        reason,
        status: "pending",
        amountRefunded: depositRoom.amount, // Lấy amount từ depositRoom
        accountId: req.user.userId,
      });

      return res.status(201).json({
        success: true,
        message: "Refund request created successfully.",
        refundRequest,
      });
    } catch (error) {
      console.log("Error creating refund request:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async checkRefundRequestExists(req, res) {
    try {
      const { depositRoomId } = req.params;
      const { userId } = req.user;

      const existingRequest = await RefundRequest.findOne({
        depositRoomId,
        accountId: userId,
        status: { $in: ["pending", "approved"] }, // Chỉ check các request chưa bị reject hoặc cancel
      });

      return res.json({
        exists: !!existingRequest,
        refundRequest: existingRequest
          ? {
              _id: existingRequest._id,
              status: existingRequest.status,
              reason: existingRequest.reason,
              amountRefunded: existingRequest.amountRefunded,
              createdAt: existingRequest.createdAt,
            }
          : null,
      });
    } catch (error) {
      console.log("Error checking refund request:", error);
      return res.status(500).json({
        message: "Error checking refund request",
        error: error.message,
      });
    }
  }

  async getMyRefundRequestsSimple(req, res) {
    try {
      const { userId } = req.user;

      const refundRequests = await RefundRequest.find({
        accountId: userId,
        status: { $in: ["pending", "approved"] },
      }).select("depositRoomId status createdAt");

      // Tạo map để frontend có thể check nhanh
      const refundRequestMap = {};
      refundRequests.forEach((request) => {
        refundRequestMap[request.depositRoomId.toString()] = {
          status: request.status,
          createdAt: request.createdAt,
        };
      });

      return res.json({
        refundRequests: refundRequestMap,
      });
    } catch (error) {
      console.log("Error getting refund requests:", error);
      return res.status(500).json({
        message: "Error getting refund requests",
        error: error.message,
      });
    }
  }
}

export default new RefundRequestController();
