import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import googleAuth from "google-auth-library";
import nodemailer from "nodemailer";

import Account from "../models/account.js";
dotenv.config();

// testing models
import BoardingHouse from "../models/boardingHouse.js";
import Room from "../models/room.js";
import RoomType from "../models/roomType.js";
import ViewRoomRequest from "../models/viewRoomRequest.js";
import WatchLater from "../models/watchLater.js";
import FavoriteBH from "../models/favoriteBH.js";
import Review from "../models/review.js";
import Report from "../models/report.js";
import Revenue from "../models/revenue.js";
import BoardingHouseType from "../models/boardingHouseType .js";
import Facility from "../models/facilities.js";
import UserPayment from "../models/userPayment.js";
import ExtensionRequest from "../models/extensionRequest.js";
import WithdrawRequest from "../models/withdrawRequest.js";
import DepositRoom from "../models/depositRoom.js";
import PaymentBill from "../models/paymentBill.js";

class AuthController {
  async getAccountFromToken(req, res) {
    const user = await Account.findOne({ username: req.user.username }).select(
      "-password"
    );
    res.status(200).json(user);
  }

  async register(req, res) {
    try {
      const user = new Account(req.body);
      user.password = await bcrypt.hash(user.password, 10);
      const createdAccount = await user.save();
      if (!createdAccount) {
        return res.status(422).json({ message: "Account creation failed" });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE,
        }
      );

      delete user.password;
      res.status(201).json({
        token,
        user,
      });
    } catch (error) {
      console.log(error.message);
      if (error.code === 11000) {
        return res.status(409).json({
          message: "Username or Email or Phone Number already exist!",
        });
      }
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }

  async login(req, res) {
    try {
      const { username, password, remember } = req.body;
      const user = await Account.findOne({ username: username });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Username or Password is incorrect" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Username or Password is incorrect" });
      }
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: remember ? "7d" : process.env.JWT_EXPIRE,
        }
      );
      delete user.password;
      res.status(200).json({
        token,
        user,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }

  async loginWithGoogle(req, res) {
    const { credential, clientId, remember } = req.body;
    const client = new googleAuth.OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
    });
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const user = await Account.findOne({ email: payload.email }).select(
        "-password"
      );

      if (!user) {
        return res.status(200).json({
          isRegistered: false,
          message: "User not registered. Please complete registration.",
          user: payload,
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: remember ? "7d" : process.env.JWT_EXPIRE,
        }
      );
      res.status(200).json({
        isRegistered: true,
        token,
        user,
      });
    } catch (error) {
      console.log(error.message);
      res.status(401).json({ message: "Invalid Google Token" });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await Account.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }

      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "todohongy@gmail.com",
          pass: "crdr lghi jfmd gjkv",
        },
      });
      const mailOptions = {
        from: "support@example.com",
        to: email,
        subject: "Đặt lại mật khẩu tài khoản của bạn",
        html: `
  <p>Kính gửi Anh/Chị ${user.fullname},</p>
  <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên nền tảng XYZ.</p>
  <p>Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu:</p>
  <p><a href="${resetLink}" style="color: #2a7ae4; text-decoration: none;">Đặt lại mật khẩu</a></p>
  <p>Lưu ý: Liên kết này chỉ có hiệu lực trong vòng 1 giờ. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
  <p>Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi qua email <a href="mailto:support@example.com">support@example.com</a> hoặc số điện thoại 0123-456-789.</p>
  <p>Trân trọng,<br>
  Đội ngũ Hỗ trợ Nền tảng XYZ<br>
  Email: <a href="mailto:support@example.com">support@example.com</a><br>
  Hotline: 0123-456-789</p>
  `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Reset link sent to email" });
    } catch (error) {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Account.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.password = await bcrypt.hash(password, 10);
      await user.save();
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Token expired" });
      }
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}

export default new AuthController();
