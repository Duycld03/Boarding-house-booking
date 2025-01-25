import Account from '../models/account.js'

class AccountController {
    async getAllAccount(req, res, next) {
        try {
            const accountData = await Account.find().sort({
                createdAt: 1
            })
            if (accountData) {
                return res.status(200).json(accountData)
            }

        } catch (error) {

        }
    }


    async softDeleteAccount(req, res, next) {
        try {
            const { accountId } = req.params;
            const accountData = await Account.findById(accountId);

            if (!accountData) {
                return res.status(404).json({ message: "Account not found" });
            }

            accountData.deletedBy = req.user?.id;

            await accountData.delete();

            return res.status(200).json({ message: "Account successfully soft deleted" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred", error: error.message });
        }
    }



    async filterAccounts(req, res) {
        try {
            let { gender, role, startDate, endDate, status } = req.body;

            let filter = {};

            if (gender) filter.gender = gender;
            if (role) filter.role = role;
            if (status) filter.status = status;

            if (startDate && endDate) {
                filter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                };
            }

            const accounts = await Account.find(filter).sort({ createdAt: 1 });

            res.status(200).json(accounts);
        } catch (error) {
            console.error('Error filtering accounts:', error);
            res.status(500).json({ message: 'Server Error' });
        }
    }





}

export default new AccountController();

