import WithdrawRequest from "../models/withdrawRequest.js";

class withdrawalRequestsController {
  async getWithdrawRequests(req, res) {
    try {
      const withdrawRequests = await WithdrawRequest.find()
        .populate({
          path: "userId",
          select: "fullname",
        })
        .populate({
          path: "processedBy",
          select: "fullname",
        });

      return res.status(200).json(withdrawRequests);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getWithdrawRequestDetail(req, res) {
    try {
      const { id } = req.params;
      const withdrawRequestDetail = await withdrawRequest
        .findById(id)
        .populate({
          path: "userId",
          select: "fullname email username",
        })
        .populate({
          path: "processedBy",
          select: "fullname email",
        });
      return res.status(200).json(withdrawRequestDetail);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  async updateWithdrawStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, reasonForCancel } = req.body;

      // Kiểm tra trạng thái có hợp lệ hay không
      const validStatuses = ["pending", "processed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      // Kiểm tra nếu trạng thái là cancel mà không có lý do hủy
      if (status === "cancel" && !reasonForCancel) {
        return res.status(400).json({ message: "Reason for cancellation is required" });
      }
      const updatedWithdrawRequest = await withdrawRequest.findByIdAndUpdate(id,
        {
          status,
          reasonForCancel: status === "cancel" ? reasonForCancel : undefined,
        },
        { new: true }).populate({
          path: "userId",
          select: "fullname email",
        });
      return res.status(200).json({
        message: "Withdrawal request updated successfully",
        data: updatedWithdrawRequest,
      });
    } catch (error) {
      console.error("Update Error:", error.message);
      return res.status(500).json({ error: error.message });


  async getAllWithdrawalRequestStatus(req, res) {
    try {
      const withdrawRequests = await WithdrawRequest.distinct("status");
      const uniqueStatus = new Set(
        withdrawRequests.map((status) => status.toLowerCase())
      );
      res.status(200).json([...uniqueStatus]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMaxAmountWithdrawRequest(req, res) {
    try {
      const maxPrice = await WithdrawRequest.findOne().sort({ amount: -1 });
      res.status(200).json(maxPrice);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async filterWithdrawRequests(req, res) {
    try {
      const {
        status,
        startDate,
        endDate,
        amountRange: [minAmount, maxAmount],
      } = req.body;
      let filter = {};

      if (status) {
        filter.status = { $regex: new RegExp(`^${status}$`, "i") };
      }
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);

        filter.createdAt = {
          $gte: start,
          $lte: end,
        };
      }

      if (maxAmount) {
        filter.amount = {
          $gte: minAmount,
          $lte: maxAmount,
        };
      }

      const withdrawRequests = await WithdrawRequest.find(filter)
        .populate({
          path: "userId",
          select: "fullname",
        })
        .populate({
          path: "processedBy",
          select: "fullname",
        })
        .sort({ createdAt: -1 });

      res.status(200).json(withdrawRequests);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new withdrawalRequestsController();
