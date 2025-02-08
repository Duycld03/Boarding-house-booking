import { Router } from "express";
import { authController, AccountController } from "./../controllers/index.js";
import { upload } from "../config/upload.config.js";

const authRouter = Router();

authRouter.get("/", (req, res) => {
  res.send("This is an auth router");
});

authRouter.get("/user", authController.getAccountFromToken);
authRouter.post("/change-password", AccountController.changePassword);
authRouter.put("/profile", AccountController.updateAccountFromProfile);
authRouter.put(
  "/avatar",
  upload.single("avatar"),
  AccountController.updateAvatar
);

authRouter.post("/send-otp-change-email", AccountController.sendOTPChangeEmail);
authRouter.post("/verify-change-email", AccountController.verifyChangeEmail);

export { authRouter };
