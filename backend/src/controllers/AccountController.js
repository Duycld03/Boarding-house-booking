import Account from "../models/account.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/functions.js";

class AccountController {
  async getAllAccount(req, res, next) {
    try {
      const accountData = await Account.find().sort({ createdAt: 1 });
      if (accountData) {
        return res.status(200).json(accountData);
      } else {
        return res.status(404).json({ message: "No accounts found" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async softDeleteAccount(req, res, next) {
    try {
      const { accountId } = req.params;
      // Sử dụng findById để tìm tài khoản theo ID duy nhất
      const accountData = await Account.findById(accountId);

      if (!accountData) {
        return res.status(404).json({ message: "Account not found" });
      }

      accountData.deleted = true;
      accountData.deletedAt = new Date();

      await accountData.save(); // Lưu lại tài khoản với thay đổi soft delete

      return res
        .status(200)
        .json({ message: "Account successfully soft deleted" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  }

  async filterAccounts(req, res) {
    try {
      let { gender, role, startDate, endDate, status } = req.query;
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
      console.error("Error filtering accounts:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }

  async createAccount(req, res, next) {
    try {
      const { username, password, email, phoneNumber, fullname, gender, role } =
        req.body;

      if (
        !username ||
        !password ||
        !email ||
        !phoneNumber ||
        !fullname ||
        !gender ||
        !role
      ) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      if (!/^[0-9]+$/.test(phoneNumber) || phoneNumber.length < 10) {
        return res.status(400).json({
          error:
            "Phone number must contain only numbers and be at least 10 digits long",
        });
      }

      const trimmedFullName = fullname.trim();
      if (!/^[a-zA-Z\s]+$/.test(trimmedFullName)) {
        return res.status(400).json({
          error: "Full name cannot contain numbers or special characters",
        });
      }

      if (!["male", "female", "other"].includes(gender)) {
        return res.status(400).json({ error: "Invalid gender value" });
      }

      if (!["admin", "user", "owner"].includes(role)) {
        return res.status(400).json({ error: "Invalid role value" });
      }

      const existingUser = await Account.findOne({ username });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Username is already registered" });
      }

      const existingEmail = await Account.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: "Email is already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new Account({
        username,
        password: hashedPassword,
        email,
        phoneNumber,
        fullname: trimmedFullName,
        gender,
        role,
      });
      // // Lưu vào database
      await newUser.save();

      res.status(201).json(newUser);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  }

  async updateAccount(req, res, next) {
    try {
      const { phoneNumber, fullname, gender, role } = req.body;
      const { accountId } = req.params;

      // Kiểm tra các trường bắt buộc có mặt trong yêu cầu
      if (!phoneNumber || !fullname || !gender || !role) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (!/^[0-9]+$/.test(phoneNumber) || phoneNumber.length < 10) {
        return res.status(400).json({
          error:
            "Phone number must contain only numbers and be at least 10 digits long",
        });
      }

      const trimmedFullName = fullname.trim();
      if (!/^[a-zA-Z\s]+$/.test(trimmedFullName)) {
        return res.status(400).json({
          error: "Full name cannot contain numbers or special characters",
        });
      }

      if (!["male", "female", "other"].includes(gender)) {
        return res.status(400).json({ error: "Invalid gender value" });
      }

      if (!["user", "owner"].includes(role)) {
        return res.status(400).json({ error: "Invalid role value" });
      }

      // Kiểm tra xem accountId có tồn tại không
      const existingAccount = await Account.findById(accountId);
      if (!existingAccount) {
        return res.status(404).json({ error: "Account not found" });
      }

      // Chỉ cập nhật các trường có thể thay đổi
      const updatedAccountData = {
        phoneNumber,
        fullname: trimmedFullName,
        gender,
        role,
        ...req.body,
      };

      // Cập nhật dữ liệu
      const updatedAccount = await Account.findByIdAndUpdate(
        accountId,
        updatedAccountData,
        { new: true }
      );

      res.status(200).json(updatedAccount);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const account = await Account.findOne({
        _id: req.user.userId,
      });

      if (!account) {
        return res.status(404).json({ error: "Old password is incorrect" });
      }

      const isPasswordValid = await bcrypt.compare(
        oldPassword,
        account.password
      );

      if (!isPasswordValid) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      account.password = hashedPassword;
      await account.save();

      const token = generateToken({
        userId: account._id,
        username: account.username,
        role: account.role,
      });

      delete account.password;

      res.status(200).json({ message: "Password changed successfully", token });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }

  async updateAccountFromProfile(req, res) {
    try {
      const { fullname, phoneNumber, gender } = req.body;
      const account = await Account.findById(req.user.userId);

      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      if (!/^[0-9]+$/.test(phoneNumber) || phoneNumber.length < 10) {
        return res.status(400).json({
          message:
            "Phone number must contain only numbers and be at least 10 digits long",
        });
      }

      if (!["male", "female", "other"].includes(gender)) {
        return res.status(400).json({ message: "Invalid gender value" });
      }

      account.fullname = fullname.trim();
      account.phoneNumber = phoneNumber;
      account.gender = gender;
      await account.save();

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }

  async updateAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const account = await Account.findById(req.user.userId);

      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      const imgPath =
        req.file.destination.replace("public", "") + "/" + req.file.filename;

      account.avatarImage = imgPath;

      await account.save();

      res.status(200).json({ message: "Avatar updated successfully" });
    } catch (error) {}
  }
}
export default new AccountController();
