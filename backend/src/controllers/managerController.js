import mongoose from 'mongoose';
import { Account } from '../models/account.js';
import paginate from '../utils/pagination.js';

class ManagerController {
  // Function to get managers associated with a specific Owner (logged-in user)
  async getManagerOwner(req, res, next) {
    try {
      // Get the logged-in user's account (the owner)
      const account = await Account.findById(req.user.userId);

      // If the account is not found or not an owner
      if (!account || account.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to access this resource.',
        });
      }

      // Retrieve managers associated with this owner's userId
      const managers = await Account.find({
        role: 'staff',
        createdBy: req.user.userId,
      })
        .select(
          'username fullname email phoneNumber avatarImage accountBalance status'
        ) // Optional: specify fields to return
        .exec();

      // If no managers are found
      if (managers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No managers found for this owner.',
        });
      }

      // Return the list of managers for the given owner
      return res.status(200).json({
        success: true,
        data: managers,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Server error.',
      });
    }
  }
  async getStaff(req, res, next) {
    try {
      const account = await Account.findById(req.user.userId);

      if (!account || account.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to access this resource.',
        });
      }

      // Xây dựng bộ lọc và cấu hình phân trang
      const filter = {
        role: 'staff',
        createdBy: req.user.userId,
      };

      const paginationOptions = {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100,
        sortField: 'createdAt',
        sortOrder: 'asc',
        filter,
        fields:
          'username fullname email phoneNumber avatarImage accountBalance status createdAt',
        includeTotalData: true,
      };

      // Gọi helper paginate
      const result = await paginate(Account, paginationOptions, req);

      return res.status(200).json({
        success: true,
        ...result, // Bao gồm data + pagination
      });
    } catch (error) {
      console.error('Error getting managers:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error.',
        error: error.message,
      });
    }
  }
}

export default new ManagerController();
