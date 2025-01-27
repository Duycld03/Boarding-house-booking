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
adminRouter.get("/boardinghouse/:id", BoardingHouseController.getBoardingHouseDetails);
adminRouter.put("/boardinghouse/:id", BoardingHouseController.updateBoardingHouseDetails);
adminRouter.get("/types", BoardingHouseController.getAllBoardingHouseTypes);
adminRouter.post("/boardinghouse/:id/images", BoardingHouseController.addBoardingHouseImage);
adminRouter.put("/boardinghouse/:id/images/:imageId", BoardingHouseController.updateBoardingHouseImage);
adminRouter.delete("/boardinghouse/:id/images/:imageId", BoardingHouseController.deleteBoardingHouseImage);
adminRouter.get("/boardinghouse/:id/images", BoardingHouseController.getBoardingHouseImages);

//Account
adminRouter.get('/account', AccountController.getAllAccount)
adminRouter.delete('/account/:accountId', AccountController.softDeleteAccount)
adminRouter.get('/account/filter', AccountController.filterAccounts);
adminRouter.post('/account/create', AccountController.createAccount);
adminRouter.put('/account/:accountId', AccountController.updateAccount)

export { adminRouter };