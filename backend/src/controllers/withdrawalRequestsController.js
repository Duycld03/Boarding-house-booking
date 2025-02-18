import withdrawRequest from '../models/withdrawRequest.js';

class withdrawalRequestsController {
  async getWithdrawRequests(req, res) {
    try {
      const withdrawRequests = await withdrawRequest
        .find()
        .populate({
          path: 'userId',
          select: 'fullname',
        })
        .populate({
          path: 'processedBy',
          select: 'fullname',
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
    }
  }
}

export default new withdrawalRequestsController();
