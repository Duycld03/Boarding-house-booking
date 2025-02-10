import dotenv from "dotenv";
import { verifyToken } from "../utils/functions.js";
dotenv.config();

const authMiddleware = (req, res, next) => {
  // allow access to the following routes without authentication
  // const whiteList = ["/register", "/login", "/"];
  // if (whiteList.find((path) => "/api" + path === req.originalUrl)) {
  //   return next();
  // }

  const authorization = req?.headers["authorization"];
  if (authorization) {
    const token = authorization.split(" ")[1];
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({ message: "Token is invalid" });
    }

    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const ownerMiddleware = (req, res, next) => {
  const authorization = req?.headers["authorization"];
  if (authorization) {
    const token = authorization.split(" ")[1];
    try {
      const decoded = verifyToken(token);
      if (decoded.role !== "owner") {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({ message: "Token is invalid" });
    }

    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const adminMiddleware = (req, res, next) => {
  const authorization = req?.headers["authorization"];
  if (authorization) {
    const token = authorization.split(" ")[1];
    try {
      const decoded = verifyToken(token);
      if (decoded.role !== "admin") {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({ message: "Token is invalid" });
    }

    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export { authMiddleware, ownerMiddleware, adminMiddleware };
