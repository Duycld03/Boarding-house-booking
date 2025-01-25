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
adminRouter.delete('/reports/:reportId', reportController.softDeleteReport);
adminRouter.put(
  '/reports/:reportId/send-email',
  reportController.sendReportReplyByEmail
);

adminRouter.get('/boardinghouse', BoardingHouseController.getAllBHOnDashBoard);

export { adminRouter };
