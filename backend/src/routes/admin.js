import { Router } from "express";

import {
  withdrawalRequestsController,
  reportController,
  AccountController,
  BoardingHouseController,
} from "../controllers/index.js";

const adminRouter = Router();

adminRouter.get(
  "/withdrawRequests",
  withdrawalRequestsController.getWithdrawRequests
);
adminRouter.get("/review-reports", reportController.getReviewReports);
adminRouter.delete(
  "/review-reports/:reviewReportId",
  reportController.softDeleteReport
);

adminRouter.get("/boardinghouse", BoardingHouseController.getAllBHOnDashBoard);

//Account
adminRouter.get('/account', AccountController.getAllAccount)
adminRouter.delete('/account/:accountId', AccountController.softDeleteAccount)
adminRouter.get('/account/filter', AccountController.filterAccounts);

export { adminRouter };
