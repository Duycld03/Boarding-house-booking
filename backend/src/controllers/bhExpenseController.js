import mongoose from "mongoose";
import boardingHouseExpense from "../models/boardingHouseExpense.js";
import BoardingHouse from "../models/boardingHouse.js";

class ExpenseController {
  async getExpensesByTime(req, res) {
    const { boardingHouseId, month, year } = req.query;

    try {
      const data = await boardingHouseExpense.find({ boardingHouseId, month, year });
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server", error });
    }
  }

  async updateExpense(req, res) {
    try {
      let { expenseId } = req.params;
      let expenseData = req.body;


      // Nếu có expenseId, thực hiện cập nhật
      const updatedExpense = await boardingHouseExpense.findByIdAndUpdate(
        expenseId,
        expenseData,
        { new: true, runValidators: true }
      );


      res.status(200).json({ success: true, data: updatedExpense });
    } catch (error) {
      console.error("Lỗi khi cập nhật/tạo mới Expense:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: error.message });
    }
  }

  //add new expense for boarding house
  async addExpense(req, res) {
    try {
      const expenseData = req.body;
      const { boardingHouseId, month, year } = expenseData;
      const userId = req.user.userId;


      // Tạo mới expense
      const newExpense = new boardingHouseExpense(expenseData);
      await newExpense.save();

      res.status(201).json({
        success: true,
        message: "Expense added successfully",
        data: newExpense
      });

    } catch (error) {
      console.error("Error adding expense:", error);


      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  }

  // Thêm phương thức để xóa expense
  async deleteExpense(req, res) {
    try {
      const { expenseId } = req.params;
      const userId = req.user.userId;

      if (!expenseId || !mongoose.Types.ObjectId.isValid(expenseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense ID"
        });
      }

      // Lấy expense để kiểm tra quyền
      const expense = await boardingHouseExpense.findById(expenseId);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found"
        });
      }

      // Kiểm tra quyền của user với boarding house
      const boardingHouse = await BoardingHouse.findOne({
        _id: expense.boardingHouseId,
        $or: [{ ownerId: userId }, { staffId: userId }]
      });

      if (!boardingHouse) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to delete expenses for this boarding house"
        });
      }

      // Xóa expense
      await boardingHouseExpense.findByIdAndDelete(expenseId);

      res.status(200).json({
        success: true,
        message: "Expense deleted successfully"
      });

    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  }

  // Thêm phương thức để lấy expense theo ID
  async getExpenseById(req, res) {
    try {
      const { expenseId } = req.params;
      const userId = req.user.userId;

      if (!expenseId || !mongoose.Types.ObjectId.isValid(expenseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense ID"
        });
      }

      const expense = await boardingHouseExpense.findById(expenseId);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found"
        });
      }

      // Kiểm tra quyền của user với boarding house
      const boardingHouse = await BoardingHouse.findOne({
        _id: expense.boardingHouseId,
        $or: [{ ownerId: userId }, { staffId: userId }]
      });

      if (!boardingHouse) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to view expenses for this boarding house"
        });
      }

      res.status(200).json({
        success: true,
        data: expense
      });

    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  }

  async getTotalExpensesByTime(req, res) {
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

      // Lấy tất cả chi phí có `boardingHouseId` thuộc danh sách trên
      const expenses = await boardingHouseExpense.find({
        boardingHouseId: { $in: boardingHouseIds },
        month,
        year,
      });

      res.status(200).json({ success: true, data: expenses });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
}

export default new ExpenseController();
