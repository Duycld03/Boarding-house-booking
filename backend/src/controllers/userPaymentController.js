import UserPayment from '../models/userPayment.js';

class UserPaymentController {
    async getUserPaymentByUserId(req, res) {
        const userId = req.user.userId;

        const userPayment = await UserPayment.find({ accountId: userId })
            .populate('accountId')
            .populate({
                path: 'paymentBillId',
                populate: { path: 'roomId' }
            })
            .sort({ createdAt: 'desc' });

        if (!userPayment) {
            return res.status(404).json({ message: 'No user payment found' });
        }
        return res.json(userPayment);
    }

}
export default new UserPaymentController();