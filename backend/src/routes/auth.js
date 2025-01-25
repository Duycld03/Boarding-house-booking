import { Router } from "express";
import { authController } from "./../controllers/index.js";

const authRouter = Router();

authRouter.get("/", (req, res) => {
  res.send("This is an auth router");
});

authRouter.get("/user", authController.getAccountFromToken);

export { authRouter };
