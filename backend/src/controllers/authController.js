import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Account from "../models/account.js";
import dotenv from "dotenv";
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

      res.status(201).json(user);
    } catch (error) {
      console.log(error.message);
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

      res.status(200).json({
        token,
        user,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}

export default new AuthController();
