import { Router } from 'express';
import {
  authController,
  boardingHouseController,
  ReviewController,
  roomTypeController,
  FacilitiesController,
  tenantController,
  roomController,
  depositController,
  bhExpenseController,
  revenueController,
  refundRequestController,
  renewalController,
  paymentBillController,
  managerController,
} from '../controllers/index.js';
import { upload } from '../config/cloudinary.config.js';

const managerRouter = Router();

managerRouter.get('/', (req, res) => {
  res.send('This is a manager router');
});

//boarding house
managerRouter.get('/boardinghouseowner', boardingHouseController.getAllBHOwner);
managerRouter.get(
  '/boardinghouse/:id',
  boardingHouseController.getBoardingHouseDetails
);
managerRouter.put(
  '/boardinghouse/:id',
  upload.array('boardingHouse'),
  boardingHouseController.updateBoardingHouseDetailsOwner
);

managerRouter.get('/types', boardingHouseController.getAllBoardingHouseTypes);
// managerRouter.post(
//   "/boardinghouse",
//   upload.array("boardingHouse"), // Cho phép tối đa 16 ảnh trong 1 lần upload
//   boardingHouseController.createBoardingHouseOwner
// );
managerRouter.delete(
  '/boardinghouse/:id/softDelete',
  boardingHouseController.softDeleteBoardingHouse
);

//review
managerRouter.post('/reply', ReviewController.replyReview);
managerRouter.get('/reviews/:reviewId', ReviewController.getReviewContent);

// deposit
managerRouter.put('/review/updatereply', ReviewController.updateReplyReview);
managerRouter.delete('/review/reply', ReviewController.softDeleteReplyReview);

//tenant
managerRouter.get(
  '/tenant/:boardingHouseId',
  tenantController.getTenantsByBoardingHouse
);
managerRouter.delete(
  '/tenant/:boardingHouseId/:accountId',
  tenantController.deleteTenantFromBoardingHouse
);

//facilities
managerRouter.get('/facilities', FacilitiesController.getAllFacilities);

//roomtype
managerRouter.get(
  '/boardinghouse/room-types/:id',
  roomTypeController.getRoomTypeByBhId
);
managerRouter.post(
  '/boardinghouse/roomtype/:id/create',
  upload.single('roomType'),
  roomTypeController.addRoomTypeToBoardingHouse
);
managerRouter.put(
  '/boardinghouse/roomtype/:roomTypeId/',
  upload.single('roomType'), // Nếu có ảnh mới, upload lên Cloudinary
  roomTypeController.updateRoomTypeToBoardingHouse
);
managerRouter.delete(
  '/boardinghouse/roomtype/:roomTypeId/',
  roomTypeController.softDeleteRoomType
);

//deposit
managerRouter.get(
  '/boardinghouse/deposit/:boardingHouseId',
  depositController.getDepositByBhId
);

managerRouter.get(
  '/boardinghouse/deposit/max-deposit/:boardingHouseId',
  depositController.getMaxDeposit
);
managerRouter.get(
  '/boardinghouse/deposit/max-rent-time/:boardingHouseId',
  depositController.getMaxRentTime
);
managerRouter.put(
  '/acceptdeposit/:depositId',
  depositController.acceptDepositRoom
);
managerRouter.put(
  '/rejectdeposit/:depositId',
  depositController.rejectDepositRoom
);

// room


//renewal
managerRouter.get(
  '/renewal/boarding-house/:boardingHouseId',
  renewalController.getRenewalRequestByBhID
);
managerRouter.put(
  '/renewal/:requestId',
  renewalController.acceptExtensionRequest
);
managerRouter.put(
  '/rejectrenewal/:requestId',
  renewalController.rejectExtensionRequest
);

// refund request
managerRouter.get(
  '/refund-requests',
  refundRequestController.getRefundRequestsForOwner
);
managerRouter.put(
  '/refund-request/:refundRequestId',
  refundRequestController.cancelRefundRequestsForOwner
);

managerRouter.post(
  '/refund-request/:refundRequestId',
  depositController.acceptRefundRequestForOwner
);

//expense
managerRouter.get('/expense', bhExpenseController.getExpensesByTime);
managerRouter.put('/expense/:expenseId', bhExpenseController.updateExpense);
managerRouter.get('/total-expense', bhExpenseController.getTotalExpensesByTime);

//revenue
managerRouter.get('/revenue', revenueController.getRevenue);
managerRouter.get('/revenue/years', revenueController.getAvailableYears);
managerRouter.get('/revenue/year', revenueController.getRevenueByYear);

managerRouter.get('/total-revenue', revenueController.getTotalRevenue);
managerRouter.get(
  '/total-revenue/years',
  revenueController.getTotalAvailableYears
);
managerRouter.get(
  '/total-revenue/year',
  revenueController.getTotalRevenueByYear
);

//rent payment
managerRouter.get(
  '/rent-payment/:boardingHouseId',
  paymentBillController.getPaymentBillByBoardingHouseId
);

managerRouter.get(
  '/unpaid-rooms/:boardingHouseId',
  roomController.getUnpaidRoomsByBoardingHouse
);

// get electrical and water price
managerRouter.get(
  '/electrical-water-price/:boardingHouseId',
  boardingHouseController.getElectricalAndWaterPrice
);

managerRouter.post(
  '/calculate-monthly-bill',
  paymentBillController.calculateMonthlyRoomRent
);

//manager
managerRouter.get('/manager-owner', managerController.getManagerOwner);

export { managerRouter };
