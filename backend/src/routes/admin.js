import { Router } from 'express';

import {
  withdrawalRequestsController,
  reportController,
} from '../controllers/index.js';

const adminRouter = Router();

adminRouter.get(
  '/withdrawRequests',
  withdrawalRequestsController.getWithdrawRequests
);
adminRouter.get('/reviewreports', reportController.getReviewReports);
adminRouter.delete(
  '/reviewreports/:reviewReportId',
  reportController.softDeleteReport
);

export default adminRouter;
