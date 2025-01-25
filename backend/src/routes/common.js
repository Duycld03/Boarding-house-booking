import { Router } from "express";
import { authController } from "../controllers/index.js";

const commonRouter = Router();

commonRouter.get("/", (req, res) => {
  res.send("This is a common router");
});

commonRouter.post("/login", authController.login);
commonRouter.post("/register", authController.register);

export { commonRouter };
