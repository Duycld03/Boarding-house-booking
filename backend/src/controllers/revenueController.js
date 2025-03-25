import mongoose from "mongoose";
import Revenue from "../models/revenue.js";

class RevenueController {
    async getRevenue(req, res) {
        try {
            const { boardingHouseId, month, year } = req.query;
            if (!boardingHouseId || !month || !year) {
                return res.status(400).json({ message: "Missing required parameters" });
            }

            const revenue = await Revenue.findOne({
                boardingHouseId: new mongoose.Types.ObjectId(boardingHouseId),
                month: parseInt(month),
                year: parseInt(year),
            }).populate("transactions");

            if (!revenue) {
                return res.status(404).json({ message: "Revenue not found" });
            }

            const totalRevenue = revenue.transactions.reduce((sum, transaction) => {
                if (transaction.status === "paid") {
                    return (
                        sum +
                        (transaction.paymentAmount || 0)
                    );
                }
                return sum;
            }, 0);

            if (revenue.totalRevenue !== totalRevenue) {
                revenue.totalRevenue = totalRevenue;
                await revenue.save();
            }

            res.status(200).json(revenue);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async getAvailableYears(req, res) {
        try {
            const years = await Revenue.distinct("year");
            years.sort((a, b) => b - a);

            res.status(200).json({ years });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async getRevenueByYear(req, res) {
        try {
            const { boardingHouseId, year } = req.query;
            if (!boardingHouseId || !year) {
                return res.status(400).json({ message: "Missing required parameters" });
            }

            const revenues = await Revenue.find({
                boardingHouseId: new mongoose.Types.ObjectId(boardingHouseId),
                year: parseInt(year),
            }).populate("transactions");

            if (!revenues.length) {
                return res.status(404).json({ message: "No revenue found for this year" });
            }

            res.status(200).json(revenues);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

export default new RevenueController();
