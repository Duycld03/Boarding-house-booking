import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authMiddleware = (req, res, next) => {
  // allow access to the following routes without authentication
  const whiteList = ["/register", "/login", "/"];
  if (whiteList.find((path) => "/api" + path === req.originalUrl)) {
    return next();
  }

  console.log("authMiddleware");
  const authorization = req?.headers["authorization"];
  if (authorization) {
    const token = authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log(decoded);
    } catch (error) {
      return res.status(401).json({ message: "Token is invalid" });
    }

    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};


export { authMiddleware };
