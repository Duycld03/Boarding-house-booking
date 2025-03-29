import moment from "moment";
import RefundRequest from "../models/refundRequest.js";

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
      const { depositRoomId, reason, amountRefunded } = req.body;
      if (!depositRoomId || !reason || !amountRefunded) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      const refundRequest = await RefundRequest.create({
        depositRoomId,
        reason,
        status: "pending",
        amountRefunded,
        accountId: req.user.userId,
      });
      return res
        .status(201)
        .json({ message: "Refund request created successfully." });
    } catch (error) {
      console.log("Error creating refund request:", error);
      return res.status(500).json(error);
    }
  }
}

export default new RefundRequestController();
