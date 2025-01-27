import { Router } from 'express';

import {
  withdrawalRequestsController,
  AccountController,
  BoardingHouseController,
  reportController,
  ReviewController,
} from '../controllers/index.js';
import reviewController from '../controllers/reviewController.js';

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

adminRouter.get('/reports/filter', reportController.filterReviewReports);


//review
adminRouter.get('/reviews', ReviewController.getReviews);
adminRouter.get('/reviews/filter', reviewController.filterReviews);
adminRouter.delete('/reviews/:reviewId', reviewController.softDeleteReview);


//boarding house
adminRouter.get('/boardinghouse', BoardingHouseController.getAllBHOnDashBoard);
adminRouter.get('/boarding-house-reports', reportController.getBHReports);

//Account
adminRouter.get('/account', AccountController.getAllAccount);
adminRouter.delete('/account/:accountId', AccountController.softDeleteAccount);
adminRouter.get('/account/filter', AccountController.filterAccounts);
adminRouter.post('/account/create', AccountController.createAccount);
adminRouter.put('/account/:accountId', AccountController.updateAccount);

export { adminRouter };
