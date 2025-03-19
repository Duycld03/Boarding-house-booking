import UserPayment from '../models/userPayment.js';

class UserPaymentController {
    async getUserPaymentByUserId(req, res) {
        try {
            const userId = req.user.userId;

            const userPayment = await UserPayment.find({ accountId: userId })
                .populate('accountId')
                .populate({
                    path: 'paymentBillId',
                    populate: {
                        path: 'roomId',
                        populate: { path: 'boardingHouseId' }
                    }
                })
                .sort({ createdAt: 'desc' });

            if (!userPayment || userPayment.length === 0) {
                return res.status(404).json({ message: 'No user payment found' });
            }

            return res.json(userPayment);
        } catch (error) {
            console.error("Error fetching user payments:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }


}
export default new UserPaymentController();