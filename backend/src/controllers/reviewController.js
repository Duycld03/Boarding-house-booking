import Review from '../models/review.js';
import BoardingHouse from '../models/boardingHouse.js';
import { v2 as cloudinary } from "cloudinary";

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
                }).sort({ createdAt: 1 });
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
                    return res.status(400).json({ message: "Invalid start date provided" });
                }

                if (end && isNaN(end)) {
                    return res.status(400).json({ message: "Invalid end date provided" });
                }

                filter.createdAt = {};
                if (start) filter.createdAt.$gte = start;
                if (end) filter.createdAt.$lte = end;
            }

            if (ratings) {
                if (Array.isArray(ratings)) {
                    const ratingArray = ratings.map(Number);

                    if (!ratingArray.every(r => r >= 1 && r <= 5)) {
                        return res.status(400).json({ message: "Invalid ratings provided" });
                    }

                    // Lọc reviews có rating nằm trong ratingArray
                    filter.rating = { $in: ratingArray };
                } else {
                    return res.status(400).json({ message: "Ratings must be an array of strings" });
                }
            }


            const reviews = await Review.find(filter)
                .populate("boardingHouseId", "name")
                .sort({ createdAt: 1 });

            if (boardingHouse) {
                const filteredReviews = reviews.filter(review =>
                    review?.boardingHouseId?.name?.toLowerCase().includes(boardingHouse.toLowerCase())
                );

                res.status(200).json(filteredReviews);

            } else {

                res.status(200).json(reviews);
            }



        } catch (error) {
            console.error("Error filtering reviews:", error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }


    async softDeleteReview(req, res) {
        try {
            const { reviewId } = req.params;

            // Tìm review bằng reviewId
            const review = await Review.findById(reviewId);

            if (!review) {
                return res.status(404).json({ message: "Review not found" });
            }

            review.deleted = true;
            review.deletedAt = new Date();

            await review.save();

            return res.status(200).json({ message: "Review deleted successfully" });
        } catch (error) {
            console.error("Error soft deleting review:", error);
            return res.status(500).json({ message: "Server Error" });
        }
    }
    async updateReview(req, res) {
        try {
            const { reviewId } = req.params;
            const { content, rating, images } = req.body;
            const accountId = req.user.userId;

            if (!accountId) {
                return res.status(401).json({ success: false, message: "Account ID not found." });
            }

            const review = await Review.findOne({ _id: reviewId, accountId });
            if (!review) {
                return res.status(403).json({ message: "You are not authorized to update this review" });
            }

            // Check if images array exists and its length exceeds the limit
            if (images && images.length > 5) {
                return res.status(400).json({ message: "You can't upload more than 5 images." });
            }

            review.content = content !== undefined ? content : review.content;
            review.rating = rating || review.rating;
            review.images = images || review.images; //This will allow to remove images by sending an empty array.
            await review.save();

            return res.status(200).json({ message: "Review updated successfully", review });
        } catch (error) {
            console.error("Error updating review:", error);
            return res.status(500).json({ message: "Server Error" });
        }
    }
    async getReviewsUser(req, res) {
        try {
            const reviews = await Review.find()
                .populate({
                    path: 'accountId',
                    select: 'username',
                })
                .populate({
                    path: 'boardingHouseId',
                    select: 'name',
                }).sort({ createdAt: 1 });
            return res.status(200).json(reviews);

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async addReview(req, res) {
        try {

            const accountId = req.user.userId;
            if (!accountId) {
                return res.status(401).json({
                    success: false,
                    message: "Account ID not found.",
                });
            }
            const { boardingHouseId, content, rating, images } = req.body;
            // console.log("Request Body:", req);

            if (!rating) {
                return res.status(400).json({
                    success: false,
                    message: "Rating is required.",
                });
            }
            // // Kiểm tra boarding house tồn tại
            const boardingHouse = await BoardingHouse.findById(boardingHouseId);
            if (!boardingHouse) {
                return res.status(404).json({
                    success: false,
                    message: "Boarding house not found.",
                });
            }

            // Kiểm tra nếu user đã review boarding house này
            const existingReview = await Review.findOne({
                accountId,
                boardingHouseId,
            });

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    message: "You have already reviewed this boarding house.",
                });
            }

            // Kiểm tra rating hợp lệ
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5 stars.",
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

            // Lưu review vào cơ sở dữ liệu
            await newReview.save();

            return res.status(201).json({
                success: true,
                message: "Review added successfully.",
                review: newReview,
            });
        } catch (error) {
            console.error("Error adding review:", error);
            return res.status(500).json({
                success: false,
                message: "Server error. Please try again later.",
            });
        }
    }
    async updateReviewImage(req, res) {

        try {
            if (!req.file) {
                console.log("No file uploaded");
                return res.status(400).json({ message: "No file uploaded" });
            }
            const result = await cloudinary.uploader.upload(req.file.path);
            // console.log("File uploaded to Cloudinary:", result);
            return res.status(200).json({
                message: "Image uploaded successfully",
                data: {
                    imageUrl: result.secure_url,
                    publicId: result.public_id,
                },
            });
        } catch (error) {
            console.error("Error uploading image:", error);
            res.status(500).json({ message: "Server Error" });
        }
    }
}
export default new ReviewController();