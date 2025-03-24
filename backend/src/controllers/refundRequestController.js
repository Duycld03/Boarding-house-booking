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
}

export default new RefundRequestController();
