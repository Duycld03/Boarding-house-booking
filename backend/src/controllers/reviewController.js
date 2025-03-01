import Review from '../models/review.js';
import BoardingHouse from '../models/boardingHouse.js';
import { v2 as cloudinary } from 'cloudinary';

class ReviewController {
  async getReviews(req, res) {
    try {
      const reviews = await Review.find()
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

      let filter = {};

      // Validate and add date range filter
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

      if (ratings) {
        if (Array.isArray(ratings)) {
          const ratingArray = ratings.map(Number);

          if (!ratingArray.every((r) => r >= 1 && r <= 5)) {
            return res
              .status(400)
              .json({ message: 'Invalid ratings provided' });
          }

          // Lọc reviews có rating nằm trong ratingArray
          filter.rating = { $in: ratingArray };
        } else {
          return res
            .status(400)
            .json({ message: 'Ratings must be an array of strings' });
        }
      }

      const reviews = await Review.find(filter)
        .populate('boardingHouseId', 'name')
        .sort({ createdAt: 1 });

      if (boardingHouse) {
        const filteredReviews = reviews.filter((review) =>
          review?.boardingHouseId?.name
            ?.toLowerCase()
            .includes(boardingHouse.toLowerCase())
        );

        res.status(200).json(filteredReviews);
      } else {
        res.status(200).json(reviews);
      }
    } catch (error) {
      console.error('Error filtering reviews:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }

  async softDeleteReview(req, res) {
    try {
      const { reviewId } = req.params;

      // Tìm review bằng reviewId
      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      review.deleted = true;
      review.deletedAt = new Date();

      await review.save();

      return res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error soft deleting review:', error);
      return res.status(500).json({ message: 'Server Error' });
    }
  }
  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { content, rating, images } = req.body;
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

      // Check if images array exists and its length exceeds the limit
      if (images && images.length > 5) {
        return res
          .status(400)
          .json({ message: "You can't upload more than 5 images." });
      }

      review.content = content !== undefined ? content : review.content;
      review.rating = rating || review.rating;
      review.images = images || review.images; //This will allow to remove images by sending an empty array.
      await review.save();

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
}

export default new ReviewController();
