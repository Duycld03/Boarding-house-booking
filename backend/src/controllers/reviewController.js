import Review from '../models/review.js';
import BoardingHouse from '../models/boardingHouse.js';
import { v2 as cloudinary } from 'cloudinary';
import paginate from '../utils/pagination.js';

class ReviewController {
  async getReviews(req, res) {
    try {
      const reviews = await Review.find({ parentId: null }) // Chỉ lấy review không có parentId
        .populate({
          path: 'accountId',
          select: 'username _id fullname avatarImage',
        })
        .populate({
          path: 'boardingHouseId',
          select: 'name',
        })
        .sort({ createdAt: 1 });

      return res.status(200).json(reviews);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async filterReviews(req, res) {
    try {
      const { boardingHouse, startDate, endDate, ratings } = req.query;

      let filter = { parentId: null };

      // Date range filter
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

      // Ratings filter
      if (ratings) {
        if (Array.isArray(ratings)) {
          const ratingArray = ratings.map(Number);
          if (!ratingArray.every((r) => r >= 1 && r <= 5)) {
            return res
              .status(400)
              .json({ message: 'Invalid ratings provided' });
          }
          filter.rating = { $in: ratingArray };
        } else {
          return res
            .status(400)
            .json({ message: 'Ratings must be an array of strings' });
        }
      }

      const paginationOptions = {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 50,
        sortField: 'createdAt',
        sortOrder: 'desc',
        filter,
        allowQueryFilters: ['ratings', 'startDate', 'endDate'],
        allowSearchFields: [], // Nếu cần search theo nội dung review có thể thêm
        fields: '', // Không loại bỏ trường nào
        populate: [
          { path: 'accountId', select: 'username _id fullname avatarImage' },
          { path: 'boardingHouseId', select: 'name' },
        ],
        includeTotalData: true,
      };

      // Gọi paginate
      const result = await paginate(Review, paginationOptions, req);

      // Nếu có tìm kiếm theo tên boardingHouse
      if (boardingHouse) {
        result.docs = result.docs.filter((review) =>
          review?.boardingHouseId?.name
            ?.toLowerCase()
            .includes(boardingHouse.toLowerCase())
        );
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error filtering reviews:', error);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message,
      });
    }
  }

  async softDeleteReview(req, res) {
    try {
      const { reviewId } = req.params;

      // 🔥 Tìm review bằng reviewId
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // 🔥 Lưu boardingHouseId để cập nhật sau khi xóa
      const { boardingHouseId } = review;

      // 🔥 Thực hiện soft delete
      review.deleted = true;
      review.deletedAt = new Date();
      await review.save();

      // 🔥 Lấy danh sách review còn tồn tại sau khi xóa (chưa bị soft delete)
      const reviews = await Review.find({
        boardingHouseId,
        parentId: null, // Chỉ lấy review gốc
        deleted: false, // Chỉ lấy review chưa bị soft delete
      });

      let averageRating = 0;
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
        averageRating = (totalRating / reviews.length).toFixed(1);
      }

      // 🔥 Cập nhật BoardingHouse với rating mới (không cập nhật `updatedAt`)
      await BoardingHouse.findByIdAndUpdate(
        boardingHouseId,
        { rating: averageRating },
        { new: true, timestamps: false } // Ngăn Mongoose cập nhật `updatedAt`
      );

      return res.status(200).json({
        message: 'Review deleted successfully',
        newRating: averageRating, // Trả về rating mới sau khi xóa review
      });
    } catch (error) {
      console.error('Error soft deleting review:', error);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { content, rating, images, boardingHouseId } = req.body;
      const accountId = req.user.userId;

      if (!accountId) {
        return res
          .status(401)
          .json({ success: false, message: 'Account ID not found.' });
      }

      const review = await Review.findOne({ _id: reviewId, accountId });
      if (!review) {
        return res
          .status(403)
          .json({ message: 'You are not authorized to update this review' });
      }

      // Check nếu rating hợp lệ (1-5)
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return res
          .status(400)
          .json({ message: 'Rating must be between 1 and 5.' });
      }

      // Cập nhật review trước để rating mới được tính chính xác
      review.content = content !== undefined ? content : review.content;
      review.rating = rating !== undefined ? rating : review.rating;
      review.images = images !== undefined ? images : review.images; // Cho phép xóa ảnh bằng cách gửi array rỗng
      await review.save();

      // 🔥 Truy vấn lại danh sách review sau khi cập nhật
      const reviews = await Review.find({
        boardingHouseId: review.boardingHouseId,
        parentId: null, // Chỉ lấy review gốc
        deleted: false,
      });

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);

        // 🔥 Cập nhật BoardingHouse nhưng không cập nhật `updatedAt`
        await BoardingHouse.findByIdAndUpdate(
          review.boardingHouseId,
          { rating: averageRating },
          { new: true, timestamps: false } // 🔥 Ngăn Mongoose cập nhật `updatedAt`
        );
      }

      return res
        .status(200)
        .json({ message: 'Review updated successfully', review });
    } catch (error) {
      console.error('Error updating review:', error);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  async getReviewsUser(req, res) {
    try {
      // 🔥 Lấy toàn bộ review gốc (không có parentId)
      const allReviews = await Review.find({ parentId: null }) // Chỉ lấy review gốc
        .populate({ path: 'accountId', select: 'username' })
        .populate({ path: 'boardingHouseId', select: 'name' }) // Chỉ lấy tên nhà trọ
        .sort({ createdAt: -1 });

      // 🔥 Tạo một object để lưu review gốc và reply
      const reviewMap = {};
      const reviews = [];

      allReviews.forEach((review) => {
        reviewMap[review._id.toString()] = {
          ...review.toObject(),
          replies: [], // Mảng chứa reply
          rating: review.rating, // Chỉ lấy rating của review gốc
        };
        reviews.push(reviewMap[review._id.toString()]);
      });

      // 🔥 Lấy tất cả reply (có parentId)
      const replies = await Review.find({ parentId: { $ne: null } }) // Chỉ lấy reply
        .populate({ path: 'accountId', select: 'username' })
        .populate({ path: 'boardingHouseId', select: 'name' }) // Chỉ lấy tên nhà trọ
        .sort({ createdAt: 1 });

      // 🔥 Gán reply vào review gốc tương ứng
      replies.forEach((reply) => {
        const parentId = reply.parentId.toString();
        if (reviewMap[parentId]) {
          reviewMap[parentId].replies.push(reply.toObject());
        }
      });

      return res.status(200).json({
        success: true,
        reviews,
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
        error: error.message,
      });
    }
  }

  async addReview(req, res) {
    try {
      const accountId = req.user.userId;
      if (!accountId) {
        return res.status(401).json({
          success: false,
          message: 'Account ID not found.',
        });
      }

      const { boardingHouseId, content, rating, images } = req.body;

      if (!rating) {
        return res.status(400).json({
          success: false,
          message: 'Rating is required.',
        });
      }

      const boardingHouse = await BoardingHouse.findById(boardingHouseId);
      if (!boardingHouse) {
        return res.status(404).json({
          success: false,
          message: 'Boarding house not found.',
        });
      }

      // Kiểm tra nếu user đã review boarding house này
      const existingReview = await Review.findOne({
        accountId,
        boardingHouseId,
        parentId: null, // Chỉ kiểm tra với review gốc
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this boarding house.',
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5 stars.',
        });
      }

      // Tạo review mới
      const newReview = new Review({
        accountId,
        boardingHouseId,
        content,
        rating,
        images,
      });

      await newReview.save();

      // 🔥 Chỉ lấy review gốc (không có parentId) và chưa bị xóa
      const reviews = await Review.find({
        boardingHouseId,
        parentId: null, // Chỉ lấy review gốc
        deleted: false,
      });

      if (reviews.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Error calculating average rating.',
        });
      }

      // 🔥 Tính trung bình rating từ review gốc
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = (totalRating / reviews.length).toFixed(1);

      // 🔥 Cập nhật BoardingHouse nhưng không cập nhật `updatedAt`
      await BoardingHouse.findByIdAndUpdate(
        boardingHouseId,
        {
          rating: averageRating,
        },
        { new: true, timestamps: false } // 🔥 Ngăn Mongoose cập nhật `updatedAt`
      );

      return res.status(201).json({
        success: true,
        message: 'Review added successfully.',
        review: newReview,
        newRating: averageRating,
      });
    } catch (error) {
      console.error('Error adding review:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
      });
    }
  }

  async updateReviewImage(req, res) {
    try {
      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const result = await cloudinary.uploader.upload(req.file.path);
      // console.log("File uploaded to Cloudinary:", result);
      return res.status(200).json({
        message: 'Image uploaded successfully',
        data: {
          imageUrl: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  }

  async replyReview(req, res) {
    try {
      const accountId = req.user?.userId;
      if (!accountId) {
        return res.status(401).json({
          success: false,
          message: 'Account ID not found.',
        });
      }

      const { parentId, content } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Reply content is required.',
        });
      }

      // Kiểm tra review gốc có tồn tại không
      const parentReview = await Review.findById(parentId);
      if (!parentReview) {
        return res.status(404).json({
          success: false,
          message: 'Original review not found.',
        });
      }

      // Đảm bảo không thể reply vào một reply khác
      if (parentReview.parentId) {
        return res.status(400).json({
          success: false,
          message:
            'Cannot reply to another reply. Only original reviews can be replied to.',
        });
      }

      // Kiểm tra xem review gốc đã có reply chưa
      const existingReply = await Review.findOne({ parentId });

      if (existingReply) {
        return res.status(400).json({
          success: false,
          message:
            'This review already has a reply. You cannot add another reply.',
        });
      }

      // Tạo reply mới
      const reply = new Review({
        accountId,
        boardingHouseId: parentReview.boardingHouseId, // Cùng boarding house với review gốc
        content,
        parentId, // Gán review gốc
      });

      await reply.save();

      return res.status(201).json({
        success: true,
        message: 'Reply added successfully.',
        reply,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
        error: error.message, // Trả về lỗi cụ thể nếu cần
      });
    }
  }
  async getReviewContent(req, res) {
    try {
      const { reviewId } = req.params; // Lấy ID review từ request

      // Tìm review gốc
      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      // Tìm phản hồi của review đó (nếu có)
      const reply = await Review.findOne({ parentId: reviewId }).select(
        'content'
      );

      return res.status(200).json({
        review, // Trả về toàn bộ review gốc
        replyContent: reply ? reply.content : null, // Nội dung reply (nếu có)
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  async getReviewDetail(req, res) {
    try {
      const { reviewId } = req.params;

      // Tìm review theo ID và đảm bảo review tồn tại
      const review = await Review.findById(reviewId)
        .populate({
          path: 'accountId',
          select: 'username _id fullname avatarImage',
        })
        .populate({
          path: 'boardingHouseId',
          select: 'name',
        });

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // Lấy danh sách phản hồi (replies) của review này
      const replies = await Review.find({ parentId: reviewId })
        .populate({
          path: 'accountId',
          select: 'username _id fullname avatarImage',
        })
        .sort({ createdAt: 1 });

      return res.status(200).json({ ...review.toObject(), replies });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getReviewByBhId(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'bhId is required' });
      }

      // ✅ Lấy danh sách review gốc
      const allReviews = await Review.find({
        boardingHouseId: id,
        parentId: null, // Chỉ lấy review gốc
      })
        .populate({
          path: 'accountId',
          select: 'fullname avatarImage',
        })
        .sort({ updatedAt: -1 });

      if (!allReviews.length) {
        return res.status(404).json({ message: 'No reviews found' });
      }

      // ✅ Duyệt qua từng review để lấy nội dung của reply (nếu có)
      const reviewsWithReply = await Promise.all(
        allReviews.map(async (review) => {
          const reply = await Review.findOne({ parentId: review._id }).select(
            '_id content'
          );

          return {
            ...review.toObject(),
            replyId: reply ? reply._id : null,
            replyContent: reply ? reply.content : null, // Lưu nội dung phản hồi vào object
          };
        })
      );

      res.status(200).json(reviewsWithReply);
    } catch (error) {
      console.error('🔥 Server Error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  async updateReplyReview(req, res) {
    try {
      const accountId = req.user?.userId;
      if (!accountId) {
        return res.status(401).json({
          success: false,
          message: 'Account ID not found.',
        });
      }

      const { replyId, content } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Reply content is required.',
        });
      }

      // Kiểm tra reply có tồn tại không
      const reply = await Review.findById(replyId);
      if (!reply) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found.',
        });
      }

      // Đảm bảo chỉ chủ sở hữu hoặc admin mới có thể chỉnh sửa
      if (reply.accountId.toString() !== accountId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this reply.',
        });
      }

      // Cập nhật nội dung reply
      reply.content = content.trim();
      await reply.save();

      return res.status(200).json({
        success: true,
        message: 'Reply updated successfully.',
        reply,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
        error: error.message, // Trả về lỗi cụ thể nếu cần
      });
    }
  }
  async softDeleteReplyReview(req, res) {
    try {
      const accountId = req.user?.userId;
      if (!accountId) {
        return res.status(401).json({
          success: false,
          message: 'Account ID not found.',
        });
      }

      const { replyId } = req.body; // Lấy replyId từ params

      if (!replyId) {
        return res.status(400).json({
          success: false,
          message: 'Reply ID is required.',
        });
      }

      // Kiểm tra xem reply có tồn tại không
      const reply = await Review.findById(replyId);
      if (!reply) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found.',
        });
      }

      // Đảm bảo chỉ chủ sở hữu hoặc admin mới có thể xóa
      if (reply.accountId.toString() !== accountId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this reply.',
        });
      }

      // Đánh dấu reply là "đã xóa"
      reply.deleted = true;
      await reply.save();

      return res.status(200).json({
        success: true,
        message: 'Reply deleted successfully (soft delete).',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
        error: error.message,
      });
    }
  }
}

export default new ReviewController();
