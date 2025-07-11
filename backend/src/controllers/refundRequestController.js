import moment from "moment";
import RefundRequest from "../models/refundRequest.js";
import DepositRoom from "../models/depositRoom.js";
import paginate from "../utils/pagination.js";
import Room from "../models/room.js";

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
      const { userId } = req.user;

      // Parse pagination parameters - SỬA LẠI PHẦN NÀY
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Đảm bảo lấy đúng limit
      const skip = (page - 1) * limit;
      const sortField = req.query.sortField || "createdAt";
      const sortOrder = req.query.sortOrder || "desc";

      console.log("Backend pagination params:", {
        page,
        limit,
        skip,
        sortField,
        sortOrder,
      });

      // Get all refund requests with populate
      const refundRequests = await RefundRequest.find({})
        .populate({
          path: "depositRoomId",
          populate: {
            path: "roomId",
            populate: {
              path: "boardingHouseId",
              match: { ownerId: userId },
            },
          },
        })
        .exec();

      // Filter out null boarding houses
      const filteredRequests = refundRequests.filter(
        (request) => request.depositRoomId?.roomId?.boardingHouseId
      );

      // Sort the filtered requests
      filteredRequests.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle nested fields
        if (sortField === "roomNumber") {
          aValue = a.depositRoomId?.roomId?.roomNumber || "";
          bValue = b.depositRoomId?.roomId?.roomNumber || "";
        } else if (sortField === "endDate") {
          aValue = a.depositRoomId?.endDate || new Date(0);
          bValue = b.depositRoomId?.endDate || new Date(0);
        } else if (sortField === "boardingHouseName") {
          aValue = a.depositRoomId?.roomId?.boardingHouseId?.name || "";
          bValue = b.depositRoomId?.roomId?.boardingHouseId?.name || "";
        }

        // Convert dates to comparable format
        if (aValue instanceof Date && bValue instanceof Date) {
          aValue = aValue.getTime();
          bValue = bValue.getTime();
        }

        // Sort logic
        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });

      // Calculate pagination
      const totalItems = filteredRequests.length;
      const totalPages = Math.ceil(totalItems / limit);
      const paginatedRequests = filteredRequests.slice(skip, skip + limit);

      console.log("Backend pagination result:", {
        totalItems,
        totalPages,
        currentPage: page,
        limit, // Đảm bảo trả về đúng limit
        paginatedItems: paginatedRequests.length,
      });

      // Format data
      const formattedRequests = paginatedRequests.map((request) => ({
        _id: request._id,
        roomNumber: request.depositRoomId?.roomId?.roomNumber || "N/A",
        endDate: request.depositRoomId?.endDate
          ? moment(request.depositRoomId.endDate).format("DD/MM/YYYY")
          : "N/A",
        amountRefunded: request.amountRefunded,
        boardingHouseName:
          request.depositRoomId?.roomId?.boardingHouseId?.name || "N/A",
        status: request.status,
        reason: request.reason,
        reasonForCancel: request.reasonForCancel,
        createdAt: moment(request.createdAt).format("DD/MM/YYYY"),
        depositRoomId: request.depositRoomId?._id,
        accountId: request.accountId,
      }));

      // SỬA LẠI RESPONSE - đảm bảo trả về đúng limit
      return res.status(200).json({
        success: true,
        data: formattedRequests,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit, // Trả về đúng limit từ request
        },
        currentPage: page,
        totalPages,
        limit, // Trả về đúng limit từ request
        totalItems,
      });
    } catch (error) {
      console.error("Error getting refund requests for owner:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }

  // Alternative approach using aggregation for better performance
  async getRefundRequestsForOwnerOptimized(req, res) {
    try {
      const { userId } = req.user;

      // Parse pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      const skip = (page - 1) * limit;
      const sortField = req.query.sortField || "createdAt";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

      // Build match conditions
      const matchConditions = {};
      if (req.query.status) {
        matchConditions.status = req.query.status;
      }

      // Aggregation pipeline to get refund requests for owner
      const pipeline = [
        {
          $lookup: {
            from: "depositrooms",
            localField: "depositRoomId",
            foreignField: "_id",
            as: "depositRoom",
          },
        },
        {
          $unwind: "$depositRoom",
        },
        {
          $lookup: {
            from: "rooms",
            localField: "depositRoom.roomId",
            foreignField: "_id",
            as: "room",
          },
        },
        {
          $unwind: "$room",
        },
        {
          $lookup: {
            from: "boardinghouses",
            localField: "room.boardingHouseId",
            foreignField: "_id",
            as: "boardingHouse",
          },
        },
        {
          $unwind: "$boardingHouse",
        },
        {
          $match: {
            "boardingHouse.ownerId": userId,
            ...matchConditions,
          },
        },
        {
          $project: {
            _id: 1,
            roomNumber: "$room.roomNumber",
            endDate: "$depositRoom.endDate",
            amountRefunded: 1,
            boardingHouseName: "$boardingHouse.name",
            status: 1,
            reason: 1,
            reasonForCancel: 1,
            createdAt: 1,
            depositRoomId: "$depositRoom._id",
            accountId: 1,
          },
        },
        {
          $sort: { [sortField]: sortOrder },
        },
      ];

      // Get total count
      const totalPipeline = [...pipeline, { $count: "total" }];
      const totalResult = await RefundRequest.aggregate(totalPipeline);
      const totalItems = totalResult.length > 0 ? totalResult[0].total : 0;

      // Get paginated data
      const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];
      const refundRequests = await RefundRequest.aggregate(dataPipeline);

      // Format the data
      const formattedRequests = refundRequests.map((refundRequest) => ({
        _id: refundRequest._id,
        roomNumber: refundRequest.roomNumber || "N/A",
        endDate: moment(refundRequest.endDate).format("DD/MM/YYYY"),
        amountRefunded: refundRequest.amountRefunded,
        boardingHouseName: refundRequest.boardingHouseName || "N/A",
        status: refundRequest.status,
        reason: refundRequest.reason,
        reasonForCancel: refundRequest.reasonForCancel,
        createdAt: moment(refundRequest.createdAt).format("DD/MM/YYYY"),
        depositRoomId: refundRequest.depositRoomId,
        accountId: refundRequest.accountId,
      }));

      const totalPages = Math.ceil(totalItems / limit);

      return res.status(200).json({
        success: true,
        data: formattedRequests,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit,
        },
        currentPage: page,
        totalPages,
        limit,
        totalItems,
      });
    } catch (error) {
      console.error("Error getting refund requests for owner:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
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
