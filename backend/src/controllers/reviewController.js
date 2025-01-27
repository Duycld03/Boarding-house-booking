import Review from '../models/review.js';
class ReviewController {
    async getReviews(req, res) {
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


}
export default new ReviewController();