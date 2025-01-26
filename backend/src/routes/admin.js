import { Router } from 'express';

import {

  withdrawalRequestsController,
  AccountController,
  BoardingHouseController,
  reportController,
  ReviewController
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
adminRouter.get('/reviews', ReviewController.getReviews);

adminRouter.get('/boardinghouse', BoardingHouseController.getAllBHOnDashBoard)

//Account
adminRouter.get('/account', AccountController.getAllAccount)
adminRouter.delete('/account/:accountId', AccountController.softDeleteAccount)
adminRouter.get('/account/filter', AccountController.filterAccounts);
adminRouter.post('/account/create', AccountController.createAccount);
adminRouter.put('/account/:accountId', AccountController.updateAccount)

export { adminRouter };