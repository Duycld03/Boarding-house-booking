import Report from '../models/report.js';
import Review from '../models/review.js';
import BoardingHouse from '../models/boardingHouse.js';
import Account from '../models/account.js';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';
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

      // Lấy thông tin báo cáo ban đầu
      const report = await Report.findById(reportId)
        .populate({ path: 'reporter', select: 'fullname email' })
        .populate({ path: 'processedBy', select: 'fullname' });

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Tìm tất cả các báo cáo có cùng targetId và reason
      const relatedReports = await Report.find({
        targetId: report.targetId,
        reason: report.reason,
      }).populate({ path: 'reporter', select: 'fullname email' });

      if (relatedReports.length === 0) {
        return res.status(404).json({ error: 'No related reports found' });
      }
      // Nếu processedBy chưa có, lấy từ token
      if (!report.processedBy) {
        const account = await Account.findById(req.user.userId).select(
          'fullname'
        );
        if (!account) {
          return res.status(404).json({ error: 'User not found in token' });
        }
        report.processedBy = account._id;
        await report.save();

        // Populate lại processedBy để có fullname
        report = await Report.findById(reportId).populate({
          path: 'processedBy',
          select: 'fullname',
        });
      }

      // Kiểm tra nếu vẫn chưa có fullname
      const processedByName = report.processedBy
        ? report.processedBy.fullname
        : 'Không xác định';

      // Cập nhật trạng thái và chi tiết xử lý cho tất cả các báo cáo liên quan
      await Report.updateMany(
        { targetId: report.targetId, reason: report.reason },
        { $set: { status: status, detailReport: detailReport } }
      );

      // Nếu status là 'Resolved', thực hiện xóa mềm đối tượng liên quan
      if (status.toLowerCase() === 'resolved') {
        if (report.reportType === 'review') {
          await Review.findByIdAndUpdate(
            report.targetId,
            { deleted: true },
            { new: true }
          );
        } else if (report.reportType === 'boardingHouse') {
          await BoardingHouse.findByIdAndUpdate(
            report.targetId,
            { deleted: true },
            { new: true }
          );
          console.log('BoardingHouse soft deleted');
        }
      }

      // Populate thêm thông tin về nhà trọ nếu reportType là boardingHouse
      let boardingHouseName = '';
      if (report.reportType === 'boardingHouse') {
        await report.populate({
          path: 'targetId',
          select: 'name',
          model: 'BoardingHouse',
          options: { withDeleted: true },
        });

        boardingHouseName = report.targetId
          ? report.targetId.name
          : 'Không xác định';
      }

      // Cấu hình email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'todohongy@gmail.com', // Thay bằng email của bạn
          pass: 'ersq syrb ihov ilvx', // Thay bằng App Password
        },
      });

      // Gửi email cho tất cả những người tố cáo liên quan
      for (const relatedReport of relatedReports) {
        // Kiểm tra loại báo cáo và thay đổi nội dung email phù hợp
        const reportSubject =
          relatedReport.reportType === 'boardingHouse'
            ? `liên quan đến nhà trọ <strong>${boardingHouseName}</strong>`
            : 'liên quan đến bình luận trong bài viết';

        const mailOptions = {
          from: 'support@example.com',
          to: relatedReport.reporter.email,
          subject: `Kết quả xử lý báo cáo: #${relatedReport._id}`,
          html: `
            <p>Kính gửi Anh/Chị ${relatedReport.reporter.fullname},</p>
            <p>Cảm ơn bạn đã gửi báo cáo về vấn đề <strong>"${
              relatedReport.reason || 'undefined'
            }"</strong> ${reportSubject} trên nền tảng của chúng tôi.</p>
            <p>Chúng tôi xin thông báo rằng báo cáo của bạn đã được xử lý với kết quả như sau:</p>
            <ul>
                <li><strong>Trạng thái báo cáo:</strong> ${status}</li>
                <li><strong>Ngày gửi báo cáo:</strong> ${new Date(
                  relatedReport.createdAt
                ).toLocaleDateString()}</li>
                <li><strong>Người xử lý:</strong> ${report.processedBy.fullname}</li>
                <li><strong>Ngày xử lý:</strong> ${new Date().toLocaleDateString()}</li>
                <li><strong>Kết quả xử lý:</strong> ${detailReport}</li>
            </ul>
            <p>Nếu bạn có thêm câu hỏi hoặc cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi qua email <a href="mailto:support@example.com">support@example.com</a> hoặc số điện thoại 0123-456-789.</p>
            <p>Trân trọng,<br>Đội ngũ Hỗ trợ Nền tảng XYZ<br>Email: <a href="mailto:support@example.com">support@example.com</a><br>Hotline: 0123-456-789</p>
        `,
        };

        await transporter.sendMail(mailOptions);
      }

      return res.status(200).json({
        message: 'All related reports updated, emails sent successfully',
        updatedReports: relatedReports.length,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async filterReviewReports(req, res) {
    try {
      const { startDate, endDate, reason, status } = req.query;
      let filter = { reportType: { $regex: /^review$/i } };

      const convertToISODate = (dateString) => {
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
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

      const reports = await Report.find(filter)
        .sort({ createdAt: -1 })
        .populate({
          path: 'reporter', // Populate reporter details
          select: 'fullname email', // Select only these fields
        });

      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      console.error('Error filtering reports:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }

  async filterBHReports(req, res) {
    try {
      const { boardingHouse, startDate, endDate, reason, status } = req.query;

      let filter = { reportType: { $regex: /^boardinghouse$/i } };

      if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && isNaN(start)) {
          return res
            .status(400)
            .json({ message: 'Invalid start date provided' });
        }

        if (end && isNaN(end)) {
          return res.status(400).json({ message: 'Invalid end date provided' });
        }

        filter.createdAt = {};
        if (start) filter.createdAt.$gte = start;
        if (end) filter.createdAt.$lte = end;
      }

      if (reason) {
        filter.reason = { $regex: new RegExp(reason, 'i') };
      }
      if (status) {
        filter.status = status;
      }

      const reportsQuery = await Report.find(filter)
        .populate({
          path: 'targetId',
          select: 'name',
          model: 'BoardingHouse',
          options: { withDeleted: true },
        })
        .populate('reporter')
        .sort({ createdAt: 1 });

      if (boardingHouse) {
        const filterBHReportData = reportsQuery.filter((report) =>
          report?.targetId?.name
            ?.toLowerCase()
            .includes(boardingHouse.toLowerCase())
        );

        console.log(filterBHReportData);

        res.status(200).json(filterBHReportData);
      } else {
        res.status(200).json(reportsQuery);
      }
    } catch (error) {
      console.error('Error filtering boarding house reports:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }

  async getBHReports(req, res) {
    try {
      const BHReports = await Report.find({
        reportType: { $regex: /^boardinghouse$/i },
      })
        .populate({
          path: 'targetId',
          select: 'name',
          model: 'BoardingHouse',
          options: { withDeleted: true },
        })
        .populate('reporter')
        .sort({ createdAt: 1 });

      return res.status(200).json(BHReports);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createReport(req, res) {
    try {
      const { reason, details, boardingHouseId, reviewId } = req.body;

      const reporter = req.user.userId;
      const reportType = reviewId ? 'review' : 'boardingHouse';

      if (!reason || !details || !reportType || !boardingHouseId) {
        return res.status(400).json({
          message: 'Missing required fields',
        });
      }

      const existingReport = await Report.findOne({
        reporter,
        targetId: reviewId || boardingHouseId,
        status: 'pending',
      });

      if (existingReport) {
        if (req.files && req.files.length > 0) {
          for (const file of req.files) {
            cloudinary.uploader.destroy(file.filename);
          }
        }

        return res.status(400).json({
          message: `You already reported this ${reviewId ? 'review' : 'boarding house'}. Please wait for the admin to process your report.`,
        });
      }

      const newReport = new Report({
        reason,
        details,
        reporter,
        targetId: reviewId || boardingHouseId,
        reportType,
        reportTypeRef: reportType === 'review' ? 'Review' : 'BoardingHouse',
      });

      if (req.files && req.files.length > 0) {
        newReport.images = req.files.map((file) => ({
          imageUrl: file.path,
          publicId: file.filename,
        }));
      }

      await newReport.save();
      res.status(201).json({ message: 'Report created successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async checkReportExist(req, res) {
    try {
      const { reviewIds, boardingHouseId } = req.query;
      const reporter = req.user.userId;

      let reportedReviews = [];
      let boardingHouseReported = false;

      let targetIds = [];

      if (reviewIds) {
        const reviewIdArray = Array.isArray(reviewIds)
          ? reviewIds
          : reviewIds.split(',');
        targetIds = [...reviewIdArray];
      }

      if (boardingHouseId) {
        targetIds.push(boardingHouseId);
      }

      const existingReports = await Report.find({
        reporter,
        targetId: { $in: targetIds },
        status: 'pending',
      }).select('targetId');

      existingReports.forEach((report) => {
        if (report.targetId == boardingHouseId) {
          boardingHouseReported = true;
        } else {
          reportedReviews.push(report.targetId);
        }
      });

      return res.status(200).json({
        reportedReviews,
        boardingHouseReported,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  async getReportReviewDetail(req, res) {
    try {
      const { reportId } = req.params;

      // Tìm báo cáo trước
      const report = await Report.findById(reportId)
        .populate({ path: 'reporter', select: 'fullname email avatarImage' })
        .populate({ path: 'processedBy', select: 'fullname' });

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      let populatedTarget = null;

      // Populate dựa trên loại report
      if (report.reportTypeRef === 'Review') {
        populatedTarget = await Review.findById(report.targetId).populate({
          path: 'accountId', // Sửa 'author' thành 'accountId'
          select: 'fullname email avatarImage',
        });
      } else if (report.reportTypeRef === 'BoardingHouse') {
        populatedTarget = await BoardingHouse.findById(report.targetId);
      }

      return res.status(200).json({
        ...report.toObject(),
        target: populatedTarget, // Thêm thông tin của Review hoặc BoardingHouse vào response
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new reportController();
