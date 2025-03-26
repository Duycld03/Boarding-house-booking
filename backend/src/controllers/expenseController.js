import mongoose from "mongoose";
import expense from "../models/expense.js";
import Expense from "../models/expense.js";

class ExpenseController {
  async getExpensesByTime(req, res) {
    const { boardingHouseId, month, year } = req.query;

    try {
      const data = await expense.find({ boardingHouseId, month, year });
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server", error });
    }
  }

  async updateExpense(req, res) {
    try {
      let { expenseId } = req.params;
      let expenseData = req.body;

      // Nếu không có expenseId hoặc expenseId không hợp lệ => Tạo mới
      if (!expenseId || !mongoose.Types.ObjectId.isValid(expenseId)) {
        const newExpense = new Expense(expenseData);
        await newExpense.save();
        return res.status(201).json({ success: true, data: newExpense });
      }

      // Nếu có expenseId, thực hiện cập nhật
      const updatedExpense = await Expense.findByIdAndUpdate(
        expenseId,
        expenseData,
        { new: true, runValidators: true }
      );

      if (!updatedExpense) {
        return res
          .status(404)
          .json({ success: false, message: "Expense không tồn tại" });
      }

      res.status(200).json({ success: true, data: updatedExpense });
    } catch (error) {
      console.error("Lỗi khi cập nhật/tạo mới Expense:", error);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: error.message });
    }
  }

  async getTotalExpensesByTime(req, res) {
    const { month, year } = req.query;

    try {
      const data = await expense.find({ month, year });
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server", error });
    }
  }
}

export default new ExpenseController();
