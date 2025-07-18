import mongoose from "mongoose";
import Revenue from "../models/revenue.js";
import BoardingHouse from "../models/boardingHouse.js";

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
        status: { $regex: /^paid$/i },
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
      const role = req.user.role;
      const userId = req.user.userId;

      if (!month || !year) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      let boardingHouses = [];

      // Logic dựa trên role
      if (role === "owner") {
        // Nếu là owner, lấy tất cả boarding houses của owner
        boardingHouses = await BoardingHouse.find({ ownerId: userId }).select(
          "_id"
        );
      } else if (role === "staff") {
        // Nếu là staff, lấy boarding houses mà staff được assign
        boardingHouses = await BoardingHouse.find({ staffId: userId }).select(
          "_id"
        );
      } else {
        return res.status(403).json({ message: "Unauthorized role" });
      }

      if (!boardingHouses.length) {
        const message =
          role === "owner"
            ? "No boarding houses found for this owner"
            : "No boarding houses assigned to this staff";
        return res.status(404).json({ message });
      }

      const boardingHouseIds = boardingHouses.map((house) => house._id);

      // Lấy tất cả các hóa đơn trong tháng/năm cụ thể và đã thanh toán
      const allPaidBills = await PaymentBill.find({
        month: parseInt(month),
        year: parseInt(year),
        status: { $regex: /^paid$/i },
      }).populate({
        path: "roomId",
        select: "boardingHouseId roomNumber floor",
      });

      // Lọc các hóa đơn thuộc về boarding houses của owner
      const paidPaymentBills = allPaidBills.filter(
        (bill) =>
          bill.roomId &&
          bill.roomId.boardingHouseId &&
          boardingHouseIds.some(
            (id) => id.toString() === bill.roomId.boardingHouseId.toString()
          )
      );

      if (!paidPaymentBills.length) {
        return res.status(404).json({
          message: "No payment records found for this month/year",
          totalRevenue: 0,
          transactionCount: 0,
          transactions: [],
          summary: {
            roomRentTotal: 0,
            electricityTotal: 0,
            waterTotal: 0,
            internetTotal: 0,
            servicesTotal: 0,
          },
        });
      }

      // Calculate total revenue from payment bills
      const totalRevenue = paidPaymentBills.reduce((sum, bill) => {
        return sum + (bill.paymentAmount || 0);
      }, 0);

      // Group transactions by categories
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

      // Group by boarding house for detailed breakdown (optional)
      const revenueByBoardingHouse = {};
      paidPaymentBills.forEach((bill) => {
        const boardingHouseId = bill.roomId.boardingHouseId.toString();

        if (!revenueByBoardingHouse[boardingHouseId]) {
          revenueByBoardingHouse[boardingHouseId] = {
            boardingHouseId,
            totalRevenue: 0,
            transactionCount: 0,
            transactions: [],
            summary: {
              roomRentTotal: 0,
              electricityTotal: 0,
              waterTotal: 0,
              internetTotal: 0,
              servicesTotal: 0,
            },
          };
        }

        const houseRevenue = revenueByBoardingHouse[boardingHouseId];
        houseRevenue.totalRevenue += bill.paymentAmount || 0;
        houseRevenue.transactionCount += 1;
        houseRevenue.transactions.push(bill);
        houseRevenue.summary.roomRentTotal += bill.roomRent || 0;
        houseRevenue.summary.electricityTotal +=
          bill.electricalBill?.totalAmount || 0;
        houseRevenue.summary.waterTotal += bill.waterBill?.totalAmount || 0;
        houseRevenue.summary.servicesTotal +=
          bill.additionalFee?.reduce((s, fee) => s + (fee.feeAmount || 0), 0) ||
          0;
      });

      // Construct response object with revenue data
      const revenueData = {
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
        boardingHouses: Object.values(revenueByBoardingHouse), // Breakdown by boarding house
      };

      res.status(200).json(revenueData);
    } catch (error) {
      console.error("Error in getTotalRevenue:", error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
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
      const role = req.user.role; // staff, owner
      const userId = req.user.userId;

      let boardingHouses = [];

      // Logic dựa trên role
      if (role === "owner") {
        // Nếu là owner, lấy tất cả boarding houses của owner
        boardingHouses = await BoardingHouse.find({ ownerId: userId }).select(
          "_id"
        );
      } else if (role === "staff") {
        // Nếu là staff, lấy boarding houses mà staff được assign
        boardingHouses = await BoardingHouse.find({ staffId: userId }).select(
          "_id"
        );
      } else {
        return res.status(403).json({ message: "Unauthorized role" });
      }

      if (!boardingHouses.length) {
        const message =
          role === "owner"
            ? "No boarding houses found for this owner"
            : "No boarding houses assigned to this staff";
        return res.status(404).json({ message });
      }

      const boardingHouseIds = boardingHouses.map((house) => house._id);

      // Lấy tất cả payment bills của owner
      const allBills = await PaymentBill.find({
        status: { $regex: /^paid$/i },
      }).populate({
        path: "roomId",
        select: "boardingHouseId",
      });

      // Lọc bills thuộc về boarding houses của owner
      const ownerBills = allBills.filter(
        (bill) =>
          bill.roomId &&
          bill.roomId.boardingHouseId &&
          boardingHouseIds.some(
            (id) => id.toString() === bill.roomId.boardingHouseId.toString()
          )
      );

      // Lấy danh sách năm unique
      const years = [...new Set(ownerBills.map((bill) => bill.year))];
      years.sort((a, b) => b - a);

      res.status(200).json(years);
    } catch (error) {
      console.error("Error in getTotalAvailableYears:", error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async getTotalRevenueByYear(req, res) {
    try {
      const { year } = req.query;
      const role = req.user.role; // staff, owner
      const userId = req.user.userId;

      if (!year) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      let boardingHouses = [];

      // Logic dựa trên role
      if (role === "owner") {
        // Nếu là owner, lấy tất cả boarding houses của owner
        boardingHouses = await BoardingHouse.find({ ownerId: userId }).select(
          "_id"
        );
      } else if (role === "staff") {
        // Nếu là staff, lấy boarding houses mà staff được assign
        boardingHouses = await BoardingHouse.find({ staffId: userId }).select(
          "_id"
        );
      } else {
        return res.status(403).json({ message: "Unauthorized role" });
      }

      if (!boardingHouses.length) {
        const message =
          role === "owner"
            ? "No boarding houses found for this owner"
            : "No boarding houses assigned to this staff";
        return res.status(404).json({ message });
      }

      const boardingHouseIds = boardingHouses.map((house) => house._id);

      // Lấy tất cả payment bills của năm cụ thể
      const allBills = await PaymentBill.find({
        year: parseInt(year),
        status: { $regex: /^paid$/i },
      }).populate({
        path: "roomId",
        select: "boardingHouseId roomNumber floor",
      });

      // Lọc bills thuộc về boarding houses của owner
      const ownerBills = allBills.filter(
        (bill) =>
          bill.roomId &&
          bill.roomId.boardingHouseId &&
          boardingHouseIds.some(
            (id) => id.toString() === bill.roomId.boardingHouseId.toString()
          )
      );

      if (!ownerBills.length) {
        return res.status(404).json({
          message: "No payment records found for this year",
        });
      }

      // Group by month
      const monthlyRevenue = {};

      ownerBills.forEach((bill) => {
        const month = bill.month;

        if (!monthlyRevenue[month]) {
          monthlyRevenue[month] = {
            month,
            year: parseInt(year),
            totalRevenue: 0,
            transactionCount: 0,
            transactions: [],
            summary: {
              roomRentTotal: 0,
              electricityTotal: 0,
              waterTotal: 0,
              internetTotal: 0,
              servicesTotal: 0,
            },
          };
        }

        const monthData = monthlyRevenue[month];
        monthData.totalRevenue += bill.paymentAmount || 0;
        monthData.transactionCount += 1;
        monthData.transactions.push(bill);
        monthData.summary.roomRentTotal += bill.roomRent || 0;
        monthData.summary.electricityTotal +=
          bill.electricalBill?.totalAmount || 0;
        monthData.summary.waterTotal += bill.waterBill?.totalAmount || 0;
        monthData.summary.servicesTotal +=
          bill.additionalFee?.reduce((s, fee) => s + (fee.feeAmount || 0), 0) ||
          0;
      });

      // Sort by month
      const sortedMonthlyRevenue = Object.values(monthlyRevenue).sort(
        (a, b) => a.month - b.month
      );

      // Calculate total for the year
      const yearlyTotal = sortedMonthlyRevenue.reduce(
        (sum, month) => sum + month.totalRevenue,
        0
      );

      res.status(200).json({
        year: parseInt(year),
        totalRevenue: yearlyTotal,
        monthlyRevenue: sortedMonthlyRevenue,
        transactionCount: ownerBills.length,
      });
    } catch (error) {
      console.error("Error in getTotalRevenueByYear:", error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
}

export default new RevenueController();
