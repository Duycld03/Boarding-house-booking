import { Router } from 'express';

import {
  withdrawalRequestsController,
  accountController,
  boardingHouseController,
  reportController,
  ReviewController,
  depositController,
} from '../controllers/index.js';
import reviewController from '../controllers/reviewController.js';
import facilitiesController from '../controllers/facilitiesController.js';
import { upload } from "../config/cloudinary.config.js";

const adminRouter = Router();

// Withdrawal Requests
adminRouter.get(
  '/withdrawRequests',
  withdrawalRequestsController.getWithdrawRequests
);

adminRouter.get(
  '/withdrawRequests/status',
  withdrawalRequestsController.getAllWithdrawalRequestStatus
);

adminRouter.get(
  '/withdrawRequests/maxAmount',
  withdrawalRequestsController.getMaxAmountWithdrawRequest
);
adminRouter.post(
  '/withdrawRequests/filter',
  withdrawalRequestsController.filterWithdrawRequests
);
adminRouter.get(
  '/withdrawRequests/:id',
  withdrawalRequestsController.getWithdrawRequestDetail
);
adminRouter.put(
  '/withdrawRequests/:id',
  withdrawalRequestsController.updateWithdrawStatus
);
//report
adminRouter.get('/review-reports', reportController.getReviewReports);
adminRouter.delete('/reports/:reportId', reportController.softDeleteReport);
adminRouter.put(
  '/reports/:reportId/send-email',
  reportController.sendReportReplyByEmail
);
adminRouter.get('/reports/filter', reportController.filterReviewReports);
adminRouter.get(
  '/reports/filter/boarding-house',
  reportController.filterBHReports
);
adminRouter.get(
  '/reportReview/:reportId',
  reportController.getReportReviewDetail
);
adminRouter.get('/reportBH/:reportId', reportController.getReportReviewDetail);

//review
adminRouter.get('/reviews', ReviewController.getReviews);
adminRouter.get('/reviews/filter', reviewController.filterReviews);
adminRouter.delete('/reviews/:reviewId', reviewController.softDeleteReview);
adminRouter.get('/boarding-house-reports', reportController.getBHReports);
adminRouter.get('/review/:reviewId', ReviewController.getReviewDetail);

//boarding house
adminRouter.get('/boardinghouse', boardingHouseController.getAllBHOnDashBoard);
adminRouter.get(
  '/boardinghouse/:id',
  boardingHouseController.getBoardingHouseDetails
);
adminRouter.put(
  '/boardinghouse/:id',
  upload.array("boardingHouse"),
  boardingHouseController.updateBoardingHouseDetails
);
adminRouter.get('/types', boardingHouseController.getAllBoardingHouseTypes);
adminRouter.post(
  '/boardinghouse/:id/images',
  boardingHouseController.addBoardingHouseImage
);
adminRouter.put(
  '/boardinghouse/:id/images/:imageId',
  boardingHouseController.updateBoardingHouseImage
);
adminRouter.delete(
  '/boardinghouse/:id/images/:imageId',
  boardingHouseController.deleteBoardingHouseImage
);
adminRouter.get(
  '/boardinghouse/:id/images',
  boardingHouseController.getBoardingHouseImages
);
adminRouter.post(
  '/boardinghouse/create',
  upload.array("boardingHouse"),
  boardingHouseController.createBoardingHouse
);
adminRouter.post(
  '/boardinghouse/uploadFile',
  upload.array("boardingHouse"),
  boardingHouseController.uploadFile
);
adminRouter.get(
  '/boardinghouse/chore/get-max',
  boardingHouseController.getMaxPriceBH
);
adminRouter.get(
  '/boardinghouse/chore/filter',
  boardingHouseController.filterBoardingHouse
);
adminRouter.delete(
  '/boardinghouse/:id/softDelete',
  boardingHouseController.softDeleteBoardingHouse
);
adminRouter.post(
  '/boardinghouse/uploadFile',
  boardingHouseController.uploadFile
);
adminRouter.post(
  '/boardinghousetype/create',
  boardingHouseController.createBoardingHouseType
);
adminRouter.get(
  '/boardinghousetype/filter',
  boardingHouseController.filterBoardingHouseType
);
adminRouter.get(
  '/boardinghousetype/:id',
  boardingHouseController.getBoardingHouseTypeDetails
);
adminRouter.put(
  '/boardinghousetype/:id',
  boardingHouseController.updateBoardingHouseType
);
adminRouter.delete(
  '/boardinghousetype/:id',
  boardingHouseController.softDeleteBoardingHouseType
);

//Account
adminRouter.get('/account', accountController.getAllAccount);
adminRouter.delete('/account/:accountId', accountController.softDeleteAccount);
adminRouter.get('/account/filter', accountController.filterAccounts);
adminRouter.post('/account/create', accountController.createAccount);
adminRouter.put('/account/:accountId', accountController.updateAccount);

//Facilities
adminRouter.get('/facilities', facilitiesController.getAllFacilities);
adminRouter.delete('/facilities/:id', facilitiesController.deleteFacilities); //delete
adminRouter.put('/facilities/:id', facilitiesController.updateFacilities); //update
adminRouter.get('/facilities/filter', facilitiesController.filterFacilities); //filter
adminRouter.post('/facilities', facilitiesController.addFacilities); //add

export { adminRouter };
