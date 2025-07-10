import mongoose from 'mongoose';
import { Account } from '../models/account.js';
import paginate from '../utils/pagination.js';
import bcrypt from 'bcrypt';
import { Staff } from '../models/account.js';

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
          'username fullname email phoneNumber avatarImage accountBalance gender createdAt',
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
  async addStaff(req, res, next) {
    try {
      const { username, password, email, fullname, gender, hireDate } =
        req.body;
      console.log(req.body);

      if (!username || !password || !email || !fullname) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: username, password, email, fullname',
        });
      }

      const creator = await Account.findById(req.user.userId);
      if (!creator || creator.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to create staff.',
        });
      }

      const existing = await Account.findOne({
        $or: [{ username }, { email }],
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists.',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newStaff = new Staff({
        username,
        password: hashedPassword,
        email,
        fullname,
        gender,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        role: 'staff',
        createdBy: req.user.userId,
      });

      await newStaff.save();

      return res.status(201).json({
        success: true,
        message: 'Staff created successfully.',
        data: {
          _id: newStaff._id,
          username: newStaff.username,
          email: newStaff.email,
          fullname: newStaff.fullname,
          gender: newStaff.gender,
          hireDate: newStaff.hireDate,
          role: newStaff.role,
        },
      });
    } catch (error) {
      console.error('Error creating staff:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error.',
        error: error.message,
      });
    }
  }
  // DELETE /owner/staff/:id
  async deleteStaff(req, res) {
    try {
      const staffId = req.params.id;

      const staff = await Account.findById(staffId);
      if (!staff || staff.role !== 'staff') {
        return res
          .status(404)
          .json({ success: false, message: 'Staff not found' });
      }

      await Account.findByIdAndDelete(staffId);

      return res.status(200).json({
        success: true,
        message: 'Staff deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting staff:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
  // PUT /owner/staff/:id
  async updateStaff(req, res) {
    try {
      const staffId = req.params.id;
      const { email, fullname, gender } = req.body;

      const staff = await Account.findById(staffId);
      if (!staff || staff.role !== 'staff') {
        return res
          .status(404)
          .json({ success: false, message: 'Staff not found' });
      }

      // Cập nhật các trường
      if (email) staff.email = email;
      if (fullname) staff.fullname = fullname;
      if (gender) staff.gender = gender;

      await staff.save();

      return res.status(200).json({
        success: true,
        message: 'Staff updated successfully',
        data: staff,
      });
    } catch (error) {
      console.error('Error updating staff:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
}

export default new ManagerController();
