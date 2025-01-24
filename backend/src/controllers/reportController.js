import Report from '../models/report.js';

class reportController {
  async getReviewReports(req, res) {
    try {
      const ReviewReports = await Report.find()
        .populate({
          path: 'reporter',
          select: 'fullname',
        })
        .populate({
          path: 'processedBy',
          select: 'fullname',
        });

      return res.status(200).json(ReviewReports);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new reportController();
