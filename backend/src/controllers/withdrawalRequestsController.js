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
}

export default new withdrawalRequestsController();
