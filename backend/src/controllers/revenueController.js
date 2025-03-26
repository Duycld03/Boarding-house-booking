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
          return sum + (transaction.paymentAmount || 0);
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
    const { boardingHouseId } = req.query;

    try {
      if (!boardingHouseId) {
        return res
          .status(400)
          .json({ message: "Missing required parameter: boardingHouseId" });
      }
      const years = await Revenue.distinct("year", {
        boardingHouseId: new mongoose.Types.ObjectId(boardingHouseId),
      });
      years.sort((a, b) => b - a);
      res.status(200).json(years);
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
        return res
          .status(404)
          .json({ message: "No revenue found for this year" });
      }

      res.status(200).json(revenues);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  async getTotalRevenue(req, res) {
    try {
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const revenues = await Revenue.find({
        month: parseInt(month),
        year: parseInt(year),
      }).populate("transactions");

      if (!revenues.length) {
        return res.status(404).json({ message: "No revenue records found" });
      }

      let totalRevenue = 0;
      let allTransactions = [];

      revenues.forEach((revenue) => {
        const revenueTotal = revenue.transactions.reduce((sum, transaction) => {
          return transaction.status === "paid"
            ? sum + (transaction.paymentAmount || 0)
            : sum;
        }, 0);

        if (revenue.totalRevenue !== revenueTotal) {
          revenue.totalRevenue = revenueTotal;
          revenue.save();
        }

        totalRevenue += revenueTotal;
        allTransactions.push(...revenue.transactions);
      });

      res.status(200).json({
        totalRevenue,
        transactions: allTransactions,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  async getTotalAvailableYears(req, res) {
    try {
      const years = await Revenue.distinct("year", {});
      years.sort((a, b) => b - a);
      res.status(200).json(years);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  async getTotalRevenueByYear(req, res) {
    try {
      const { year } = req.query;
      if (!year) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const revenues = await Revenue.find({
        year: parseInt(year),
      }).populate("transactions");

      if (!revenues.length) {
        return res
          .status(404)
          .json({ message: "No revenue found for this year" });
      }

      res.status(200).json(revenues);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

export default new RevenueController();
