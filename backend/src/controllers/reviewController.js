import ListReview from '../models/review.js';
class ReviewController {
    async getReviews(req, res) {
        try {
            const reviews = await ListReview.find()
                .populate({
                    path: 'accountId',
                    select: 'username',
                })
                .populate({
                    path: 'boardingHouseId',
                    select: 'name',
                });
            console.log(reviews);
            return res.status(200).json(reviews);

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
export default new ReviewController();