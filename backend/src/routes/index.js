import {
  authMiddleware,
  ownerMiddleware,
  adminMiddleware,
} from "../middlewares/index.js";
import { commonRouter } from "./common.js";
import { authRouter } from "./auth.js";
import { ownerRouter } from "./owner.js";
import { adminRouter } from "./admin.js";

function routes(app) {
  app.use("/", commonRouter);
  app.use("/auth", authMiddleware, authRouter);
  app.use("/owner", ownerMiddleware, ownerRouter);
  app.use("/dashboard", adminMiddleware, adminRouter);
}


export default routes