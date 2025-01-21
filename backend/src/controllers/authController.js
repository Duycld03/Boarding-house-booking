import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Account from "../models/account.js";
import dotenv from "dotenv";
dotenv.config();

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
      const { username, password } = req.body;
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
          expiresIn: process.env.JWT_EXPIRE,
        }
      );

      res.status(200).json({
        token,
        user: {
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }

  async dashboardLogin(req, res) {
    try {
      const { username, password } = req.body;
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

      if (user.role !== "admin" && user.role !== "staff") {
        return res.status(403).json({ message: "Forbidden" });
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

      res.status(200).json({
        token,
        user: {
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}

export default new AuthController();
