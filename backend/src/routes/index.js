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
  app.use("/", commonRouter); // common routes for all users not protected by auth
  app.use("/auth", authMiddleware, authRouter); // routes for authentication
  app.use("/owner", ownerMiddleware, ownerRouter); // routes for owner
  app.use("/dashboard", adminMiddleware, adminRouter); // routes for admin
}

export default routes;
