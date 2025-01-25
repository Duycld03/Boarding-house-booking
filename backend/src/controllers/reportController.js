import Report from '../models/report.js';
import nodemailer from 'nodemailer';
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
  async sendReportReplyByEmail(req, res) {
    try {
      const { reportId } = req.params;
      const { status, detailReport } = req.body; // Assuming this is part of the request body

      // Cập nhật chỉ 2 trường status và detailReport, giữ nguyên các trường còn lại
      const report = await Report.findByIdAndUpdate(
        reportId,
        {
          $set: {
            status: status,
            detailReport: detailReport,
          },
        },
        { new: true } // Đảm bảo trả về document đã được cập nhật
      )
        .populate({
          path: 'reporter', // Populate trường reporter để lấy thông tin chi tiết
          select: 'fullname email', // Chỉ chọn fullname và email
        })
        .populate({
          path: 'processedBy', // Populate trường processedBy để lấy thông tin người xử lý
          select: 'fullname', // Chỉ chọn fullname
        });

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Kiểm tra xem processedBy có tồn tại không
      if (!report.processedBy) {
        return res.status(404).json({ error: 'Processed by user not found' });
      }

      // Log the email of the reporter for debugging
      console.log('Sending email to:', report.reporter.email);

      // Send email with the updated report
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'todohongy@gmail.com',
          pass: 'crdr lghi jfmd gjkv',
        },
      });

      const mailOptions = {
        from: 'support@example.com',
        to: report.reporter.email, // Đảm bảo đây là email đã được định nghĩa
        subject: `Kết quả xử lý báo cáo: #${report._id}`,
        html: `
        <p>Kính gửi Anh/Chị ${report.reporter.fullname},</p>

        <p>Cảm ơn bạn đã gửi báo cáo về vấn đề "${report.reason || 'undefined'}" liên quan đến bình luận trong bài viết trên nền tảng của chúng tôi.</p>

        <p>Chúng tôi xin thông báo rằng báo cáo của bạn đã được xử lý với kết quả như sau:</p>

        <ul>
          <li><strong>Trạng thái báo cáo:</strong> ${report.status}</li>
          <li><strong>Ngày gửi báo cáo:</strong> ${new Date(report.createdAt).toLocaleDateString()}</li>
          <li><strong>Người xử lý:</strong> ${report.processedBy.fullname}</li>
          <li><strong>Ngày xử lý:</strong> ${new Date(report.updatedAt).toLocaleDateString()}</li>
          <li><strong>Kết quả xử lý:</strong>${report.detailReport}</li>
        </ul>

        <p>Nếu bạn có thêm câu hỏi hoặc cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi qua email <a href="mailto:support@example.com">support@example.com</a> hoặc số điện thoại 0123-456-789.</p>

        <p>Trân trọng,<br>
        Đội ngũ Hỗ trợ Nền tảng XYZ<br>
        Email: <a href="mailto:support@example.com">support@example.com</a><br>
        Hotline: 0123-456-789</p>
      `,
      };

      // Log full reporter data for debugging
      console.log('Reporter Data:', report.reporter);

      // Send the email
      await transporter.sendMail(mailOptions);

      // Send the updated report data in response
      return res.status(200).json({
        message: 'Report updated and email sent successfully',
        report,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new reportController();
