import { Router } from 'express';

import { reportController } from '../controllers/index.js';

const adminRouter = Router();

adminRouter.get('/reviewreports', reportController.getReviewReports);
adminRouter.delete(
  '/reviewreports/:reviewReportId',
  reportController.softDeleteReport
);

export default adminRouter;
