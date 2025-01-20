import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

class AuthController {
  async getUserFromToken(req, res) {
    const user = await User.findOne({ username: req.user.username }).select(
      "-password"
    );
    res.status(200).json(user);
  }

  async register(req, res) {
    try {
      const user = new User(req.body);
      user.password = await bcrypt.hash(data.password, 10);
      const createdUser = await user.save();
      if (!createdUser) {
        return res.status(422).json({ message: "User creation failed" });
      }

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username: username });

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
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }

  async dashboardLogin(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username: username });

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
