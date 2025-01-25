import { Router } from 'express';

import {
  withdrawalRequestsController,
  AccountController,
  BoardingHouseController,
  reportController,
} from '../controllers/index.js';

const adminRouter = Router();

adminRouter.get(
  '/withdrawRequests',
  withdrawalRequestsController.getWithdrawRequests
);
adminRouter.get('/review-reports', reportController.getReviewReports);
adminRouter.delete('/reports/:reportId', reportController.softDeleteReport);
adminRouter.put(
  '/reports/:reportId/send-email',
  reportController.sendReportReplyByEmail
);
adminRouter.get('/reports/filter', reportController.filterReports);

adminRouter.get('/boardinghouse', BoardingHouseController.getAllBHOnDashBoard);

//Account
adminRouter.get('/account', AccountController.getAllAccount);
adminRouter.delete('/account/:accountId', AccountController.softDeleteAccount);
adminRouter.get('/account/filter', AccountController.filterAccounts);

export { adminRouter };
