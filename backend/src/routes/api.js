import { Router } from "express";
import { authController } from "../controllers/index.js";

const apiRouter = Router();

apiRouter.get("/", (req, res) => {
  res.send("This is a api router");
});

apiRouter.post("/login", authController.login);
apiRouter.post("/register", authController.register);

export { apiRouter };
