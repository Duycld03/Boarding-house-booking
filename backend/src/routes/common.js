import { Router } from "express";
import { authController } from "../controllers/index.js";

const commonRouter = Router();

commonRouter.get("/", (req, res) => {
  res.send("This is a common router");
});

commonRouter.post("/login", authController.login);
commonRouter.post("/login-with-google", authController.loginWithGoogle);
commonRouter.post("/register", authController.register);
commonRouter.post("/forgot-password", authController.forgotPassword);
commonRouter.post("/reset-password", authController.resetPassword);
commonRouter.post("/send-otp-register", authController.sendOTPRegister);
commonRouter.post("/verify-register", authController.verifyRegister);

export { commonRouter };
