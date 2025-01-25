import Report from '../models/report.js';
import Review from '../models/review.js';
import BoardingHouse from '../models/boardingHouse.js';
import nodemailer from 'nodemailer';
class reportController {
  async getReviewReports(req, res) {
    try {
      const ReviewReports = await Report.find({
        reportType: { $regex: /^review$/i },
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
      const { reportId } = req.params;

      // Tìm và cập nhật trường "deleted" thành true
      const report = await Report.findByIdAndUpdate(
        reportId,
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
      const { status, detailReport } = req.body;

      // Cập nhật chỉ 2 trường status và detailReport, giữ nguyên các trường còn lại
      const report = await Report.findByIdAndUpdate(
        reportId,
        {
          $set: {
            status: status,
            detailReport: detailReport,
          },
        },
        { new: true }
      )
        .populate({
          path: 'reporter',
          select: 'fullname email',
        })
        .populate({
          path: 'processedBy',
          select: 'fullname',
        });

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      if (!report.processedBy) {
        return res.status(404).json({ error: 'Processed by user not found' });
      }

      // Kiểm tra nếu status là 'Resolved', thực hiện xóa mềm đối tượng liên quan
      if (status.toLowerCase() === 'resolved') {
        // Xóa mềm đối tượng Review hoặc BoardingHouse nếu báo cáo đã được xử lý và có trạng thái 'resolved'
        if (report.reportType === 'Review') {
          await Review.findByIdAndUpdate(
            report.targetId,
            { deleted: true },
            { new: true }
          );
        } else if (report.reportType === 'BoardingHouse') {
          await BoardingHouse.findByIdAndUpdate(
            report.targetId,
            { deleted: true },
            { new: true }
          );
          console.log('BoardingHouse soft deleted');
        }
      }

      // Gửi email thông báo cho người báo cáo
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'todohongy@gmail.com', // Thay bằng email của bạn
          pass: 'crdr lghi jfmd gjkv', // Thay bằng mật khẩu của bạn
        },
      });

      const mailOptions = {
        from: 'support@example.com',
        to: report.reporter.email,
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
        <p>Trân trọng,<br>Đội ngũ Hỗ trợ Nền tảng XYZ<br>Email: <a href="mailto:support@example.com">support@example.com</a><br>Hotline: 0123-456-789</p>
      `,
      };

      // Gửi email
      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        message: 'Report updated, email sent successfully',
        report,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  async filterReports(req, res) {
    try {
      const { startDate, endDate, reason, status } = req.query;
      let filter = {};

      const convertToISODate = (dateString) => {
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}T00:00:00.000Z`); // Đảm bảo ngày có định dạng ISO đầy đủ
      };

      if (startDate && endDate) {
        const startISO = convertToISODate(startDate);
        const endISO = convertToISODate(endDate);

        endISO.setHours(23, 59, 59, 999);

        filter.createdAt = {
          $gte: startISO,
          $lte: endISO,
        };
      }

      if (reason) {
        filter.reason = { $regex: new RegExp(reason, 'i') }; // Case-insensitive
      }

      if (status) {
        filter.status = status;
      }

      const reports = await Report.find(filter).sort({ createdAt: 1 });

      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      console.error('Error filtering reports:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
}

export default new reportController();
