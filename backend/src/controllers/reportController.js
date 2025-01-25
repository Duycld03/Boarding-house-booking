import Report from '../models/report.js';

class reportController {
  async getReviewReports(req, res) {
    try {
      const ReviewReports = await Report.find({
        reportType: { $regex: /^review report$/i },
      })
        .sort({ createdAt: -1 })
        .populate({
          path: 'reporter',
          select: 'fullname email',
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
  async softDeleteReport(req, res) {
    try {
      const { reviewReportId } = req.params;

      // Tìm và cập nhật trường "deleted" thành true
      const report = await Report.findByIdAndUpdate(
        reviewReportId,
        { deleted: true },
        { new: true } // Để trả về bản ghi đã cập nhật
      );

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      return res
        .status(200)
        .json({ message: 'Report soft deleted successfully', report });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new reportController();
