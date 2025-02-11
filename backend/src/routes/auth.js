import { Router } from "express";
import {
  authController,
  accountController,
  favoriteController,
} from "./../controllers/index.js";
import { upload } from "../config/cloudinary.config.js";

const authRouter = Router();

authRouter.get("/", (req, res) => {
  res.send("This is an auth router");
});

authRouter.get("/user", authController.getAccountFromToken);
authRouter.get("/favorites", favoriteController.getFavorites);
authRouter.post("/favorites/create", favoriteController.createFavorite);
authRouter.post("/change-password", accountController.changePassword);
authRouter.put("/profile", accountController.updateAccountFromProfile);
authRouter.put(
  "/avatar",
  upload.single("avatar"),
  accountController.updateAvatar
);

authRouter.post("/send-otp-change-email", accountController.sendOTPChangeEmail);
authRouter.post("/verify-change-email", accountController.verifyChangeEmail);

export { authRouter };
