import {
  authMiddleware,
  ownerMiddleware,
  adminMiddleware,
  staffMiddleware,
} from "../middlewares/index.js";
import { commonRouter } from "./commonRouter.js";
import { authRouter } from "./authRouter.js";
import { ownerRouter } from "./ownerRouter.js";
import { adminRouter } from "./adminRouter.js";
import { managerRouter } from "./managerRouter.js";

function routes(app) {
  app.use("/", commonRouter);
  app.use("/auth", authMiddleware, authRouter);
  app.use("/manager", staffMiddleware, managerRouter);
  app.use("/owner", ownerMiddleware, ownerRouter);
  app.use("/dashboard", adminMiddleware, adminRouter);
}

export default routes;
