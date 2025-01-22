import withdrawRequest from '../models/withdrawRequest.js';

class withdrawalRequestsController {
  async getWithdrawRequests(req, res) {
    try {
      // Populate userId and processedBy to fetch fullname from Account model
      const withdrawRequests = await withdrawRequest
        .find()
        .populate({
          path: 'userId', // Populate userId
          select: 'fullname', // Chỉ lấy trường fullname
        })
        .populate({
          path: 'processedBy', // Populate processedBy
          select: 'fullname', // Chỉ lấy trường fullname
        });

      return res.status(200).json(withdrawRequests);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new withdrawalRequestsController();
