import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const managementMiddleware = (req, res, next) => {
  const whiteList = ["/", "/login"];
  if (whiteList.find((path) => "/dashboard" + path === req.originalUrl)) {
    return next();
  }
  const authorization = req?.headers["authorization"];
  if (authorization) {
    const token = authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "staff" && decoded.role !== "admin") {
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

export { managementMiddleware, adminMiddleware };
