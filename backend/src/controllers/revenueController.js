import mongoose from "mongoose";
import Revenue from "../models/revenue.js";
import BoardingHouse from "../models/boardingHouse.js";
import PaymentBill from "../models/paymentBill.js";

class RevenueController {
  async getRevenuePerBoardingHouse(req, res) {
    try {
      const { boardingHouseId, month, year } = req.query;

      if (!boardingHouseId || !month || !year) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Đầu tiên, lấy tất cả các hóa đơn trong tháng/năm cụ thể và đã thanh toán
      const allPaidBills = await PaymentBill.find({
        month: parseInt(month),
        year: parseInt(year),
        status: "paid",
      }).populate({
        path: "roomId",
        select: "boardingHouseId roomNumber floor",
      });

      // Lọc các hóa đơn thuộc về boarding house cụ thể
      const paidPaymentBills = allPaidBills.filter(
        (bill) =>
          bill.roomId &&
          bill.roomId.boardingHouseId &&
          bill.roomId.boardingHouseId.toString() === boardingHouseId
      );


      // Calculate total revenue from payment bills
      const totalRevenue = paidPaymentBills.reduce((sum, bill) => {
        return sum + (bill.paymentAmount || 0);
      }, 0);

      // Group transactions by categories if needed
      const roomRentTotal = paidPaymentBills.reduce((sum, bill) => {
        return sum + (bill.roomRent || 0);
      }, 0);

      const electricityTotal = paidPaymentBills.reduce((sum, bill) => {
        return sum + (bill.electricalBill?.totalAmount || 0);
      }, 0);

      const waterTotal = paidPaymentBills.reduce((sum, bill) => {
        return sum + (bill.waterBill?.totalAmount || 0);
      }, 0);

      // Không thấy internet trong schema, nên bỏ qua
      const internetTotal = 0;

      const servicesTotal = paidPaymentBills.reduce((sum, bill) => {
        return (
          sum +
          (bill.additionalFee?.reduce(
            (s, fee) => s + (fee.feeAmount || 0),
            0
          ) || 0)
        );
      }, 0);

      // Construct response object with revenue data
      const revenueData = {
        boardingHouseId,
        month: parseInt(month),
        year: parseInt(year),
        totalRevenue,
        transactionCount: paidPaymentBills.length,
        transactions: paidPaymentBills,
        summary: {
          roomRentTotal,
          electricityTotal,
          waterTotal,
          internetTotal,
          servicesTotal,
        },
      };

      res.status(200).json(revenueData);
    } catch (error) {
      console.error("Error in getRevenuePerBoardingHouse:", error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
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
      const ownerId = req.user.userId;

      if (!month || !year) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Tìm tất cả boarding houses của owner
      const boardingHouses = await BoardingHouse.find({ ownerId }).select(
        "_id"
      );

      if (!boardingHouses.length) {
        return res
          .status(404)
          .json({ message: "No boarding houses found for this owner" });
      }

      const boardingHouseIds = boardingHouses.map((house) => house._id);

      // Lấy doanh thu có `boardingHouseId` thuộc danh sách trên
      const revenues = await Revenue.find({
        boardingHouseId: { $in: boardingHouseIds },
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

  // async getTotalAvailableYears(req, res) {
  //   try {
  //     const years = await Revenue.distinct("year", {});
  //     years.sort((a, b) => b - a);
  //     res.status(200).json(years);
  //   } catch (error) {
  //     res.status(500).json({ message: "Server error", error: error.message });
  //   }
  // }
  async getTotalAvailableYears(req, res) {
    try {
      const ownerId = req.user.userId;

      // Lấy danh sách boarding houses của owner
      const boardingHouses = await BoardingHouse.find({ ownerId }).select(
        "_id"
      );

      if (!boardingHouses.length) {
        return res
          .status(404)
          .json({ message: "No boarding houses found for this owner" });
      }

      const boardingHouseIds = boardingHouses.map((house) => house._id);

      // Lấy danh sách năm có doanh thu của owner
      const years = await Revenue.distinct("year", {
        boardingHouseId: { $in: boardingHouseIds },
      });
      years.sort((a, b) => b - a);

      res.status(200).json(years);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  async getTotalRevenueByYear(req, res) {
    try {
      const { year } = req.query;
      const ownerId = req.user.userId;

      if (!year) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Lấy danh sách boarding houses của owner
      const boardingHouses = await BoardingHouse.find({ ownerId }).select(
        "_id"
      );

      if (!boardingHouses.length) {
        return res
          .status(404)
          .json({ message: "No boarding houses found for this owner" });
      }

      const boardingHouseIds = boardingHouses.map((house) => house._id);

      // Lấy doanh thu của owner theo năm
      const revenues = await Revenue.find({
        year: parseInt(year),
        boardingHouseId: { $in: boardingHouseIds },
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
