import {
  authMiddleware,
  ownerMiddleware,
  adminMiddleware,
} from "../middlewares/index.js";
import { commonRouter } from "./commonRouter.js";
import { authRouter } from "./authRouter.js";
import { ownerRouter } from "./ownerRouter.js";
import { adminRouter } from "./adminRouter.js";

function routes(app) {
  app.use("/", commonRouter);
  app.use("/auth", authMiddleware, authRouter);
  app.use("/owner", ownerMiddleware, ownerRouter);
  app.use("/dashboard", adminMiddleware, adminRouter);
}


export default routes