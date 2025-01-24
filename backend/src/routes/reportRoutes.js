import { Router } from 'express';

import { reportController } from '../controllers/index.js';

const adminRouter = Router();

adminRouter.get('/reviewreports', reportController.getReviewReports);

export default adminRouter;
