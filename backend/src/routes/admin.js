import { Router } from 'express';

import {
  withdrawalRequestsController,
  reportController,
  BoardingHouseController,
} from '../controllers/index.js';

const adminRouter = Router();

adminRouter.get(
  '/withdrawRequests',
  withdrawalRequestsController.getWithdrawRequests
);
adminRouter.get('/review-reports', reportController.getReviewReports);
adminRouter.delete(
  '/review-reports/:reviewReportId',
  reportController.softDeleteReport
);
adminRouter.put(
  '/review-reports/:reportId/send-email',
  reportController.sendReportReplyByEmail
);

adminRouter.get('/boardinghouse', BoardingHouseController.getAllBHOnDashBoard);

export { adminRouter };
