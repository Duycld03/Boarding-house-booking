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
  "/update-avatar",
  upload.single("avatar"),
  AccountController.updateAvatar
);

export { authRouter };
