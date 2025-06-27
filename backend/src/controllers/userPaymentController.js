import UserPayment from '../models/userPayment.js';
import paginate from '../utils/pagination.js';

class UserPaymentController {
    async getUserPaymentByUserId(req, res) {
        try {
            const userId = req.user.userId;
            const paginationOptions = {
                defaultPage: 1,
                defaultLimit: 10,
                filter: { accountId: userId },
                sortField: 'createdAt',
                populate: [
                    'accountId',
                    {
                        path: 'paymentBillId',
                        populate: {
                            path: 'roomId',
                            populate: { path: 'boardingHouseId' }
                        }
                    }
                ],
                allowQueryFilters: [
                    'status',
                    'paymentMethod',
                    'amount'
                ]
            };

            const result = await paginate(UserPayment, paginationOptions, req);

            return res.json(result);

        } catch (error) {
            console.error("Error fetching user payments:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }


}
export default new UserPaymentController();