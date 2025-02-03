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

//report
adminRouter.get('/review-reports', reportController.getReviewReports);
adminRouter.delete('/reports/:reportId', reportController.softDeleteReport);
adminRouter.put(
  '/reports/:reportId/send-email',
  reportController.sendReportReplyByEmail
);
adminRouter.get('/reports/filter', reportController.filterReviewReports);
adminRouter.get('/reports/filter/boarding-house', reportController.filterBHReports);


//review
adminRouter.get('/reviews', ReviewController.getReviews);
adminRouter.get('/reviews/filter', reviewController.filterReviews);
adminRouter.delete('/reviews/:reviewId', reviewController.softDeleteReview);
adminRouter.get('/boarding-house-reports', reportController.getBHReports);


//boarding house
adminRouter.get('/boardinghouse', BoardingHouseController.getAllBHOnDashBoard)
adminRouter.get("/boardinghouse/:id", BoardingHouseController.getBoardingHouseDetails);
adminRouter.put("/boardinghouse/:id", BoardingHouseController.updateBoardingHouseDetails);
adminRouter.get("/types", BoardingHouseController.getAllBoardingHouseTypes);
adminRouter.post("/boardinghouse/:id/images", BoardingHouseController.addBoardingHouseImage);
adminRouter.put("/boardinghouse/:id/images/:imageId", BoardingHouseController.updateBoardingHouseImage);
adminRouter.delete("/boardinghouse/:id/images/:imageId", BoardingHouseController.deleteBoardingHouseImage);
adminRouter.get("/boardinghouse/:id/images", BoardingHouseController.getBoardingHouseImages);
adminRouter.get("/boardinghouse/chore/get-max", BoardingHouseController.getMaxPriceBH)
adminRouter.get("/boardinghouse/chore/filter", BoardingHouseController.filterBoardingHouse)


//Account
adminRouter.get('/account', AccountController.getAllAccount);
adminRouter.delete('/account/:accountId', AccountController.softDeleteAccount);
adminRouter.get('/account/filter', AccountController.filterAccounts);
adminRouter.post('/account/create', AccountController.createAccount);
adminRouter.put('/account/:accountId', AccountController.updateAccount);

export { adminRouter };
