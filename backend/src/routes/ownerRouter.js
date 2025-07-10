import { Router } from 'express';
import {
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
} from '../controllers/index.js';
import { upload } from '../config/cloudinary.config.js';

const ownerRouter = Router();

ownerRouter.get('/', (req, res) => {
  res.send('This is a owner router');
});

//boarding house
// ownerRouter.get("/boardinghouseowner", boardingHouseController.getAllBHOwner);
ownerRouter.get(
  '/boardinghouse/:id',
  boardingHouseController.getBoardingHouseDetails
);
ownerRouter.put(
  '/boardinghouse/:id',
  upload.array('boardingHouse'),
  boardingHouseController.updateBoardingHouseDetailsOwner
);

ownerRouter.get('/types', boardingHouseController.getAllBoardingHouseTypes);
ownerRouter.post(
  '/boardinghouse',
  upload.array('boardingHouse'), // Cho phép tối đa 16 ảnh trong 1 lần upload
  boardingHouseController.createBoardingHouseOwner
);
ownerRouter.delete(
  '/boardinghouse/:id/softDelete',
  boardingHouseController.softDeleteBoardingHouse
);

//review
ownerRouter.post('/reply', ReviewController.replyReview);
ownerRouter.get('/reviews/:reviewId', ReviewController.getReviewContent);

// deposit
ownerRouter.put('/review/updatereply', ReviewController.updateReplyReview);
ownerRouter.delete('/review/reply', ReviewController.softDeleteReplyReview);

//tenant
ownerRouter.get(
  '/tenant/:boardingHouseId',
  tenantController.getTenantsByBoardingHouse
);
ownerRouter.delete(
  '/tenant/:boardingHouseId/:accountId',
  tenantController.deleteTenantFromBoardingHouse
);

//facilities
// ownerRouter.get('/facilities', FacilitiesController.getAllFacilities);

//roomtype
ownerRouter.get(
  '/boardinghouse/room-types/:id',
  roomTypeController.getRoomTypeByBhId
);
ownerRouter.post(
  '/boardinghouse/roomtype/:id/create',
  upload.single('roomType'),
  roomTypeController.addRoomTypeToBoardingHouse
);
ownerRouter.put(
  '/boardinghouse/roomtype/:roomTypeId/',
  upload.single('roomType'), // Nếu có ảnh mới, upload lên Cloudinary
  roomTypeController.updateRoomTypeToBoardingHouse
);
ownerRouter.delete(
  '/boardinghouse/roomtype/:roomTypeId/',
  roomTypeController.softDeleteRoomType
);

//deposit
// ownerRouter.get(
//   '/boardinghouse/deposit/:boardingHouseId',
//   depositController.getDepositsByAccount
// );


ownerRouter.get(
  '/boardinghouse/deposit/max-rent-time/:boardingHouseId',
  depositController.getMaxRentTime
);

//renewal
ownerRouter.get(
  '/renewal/boarding-house/:boardingHouseId',
  renewalController.getRenewalRequestByBhID
);
ownerRouter.put(
  '/renewal/:requestId',
  renewalController.acceptExtensionRequest
);
ownerRouter.put(
  '/rejectrenewal/:requestId',
  renewalController.rejectExtensionRequest
);

// refund request
ownerRouter.get(
  '/refund-requests',
  refundRequestController.getRefundRequestsForOwner
);
ownerRouter.put(
  '/refund-request/:refundRequestId',
  refundRequestController.cancelRefundRequestsForOwner
);

ownerRouter.post(
  '/refund-request/:refundRequestId',
  depositController.acceptRefundRequestForOwner
);



//revenue
ownerRouter.get('/revenue', revenueController.getRevenue);
ownerRouter.get('/revenue/years', revenueController.getAvailableYears);
ownerRouter.get('/revenue/year', revenueController.getRevenueByYear);

ownerRouter.get('/total-revenue', revenueController.getTotalRevenue);
ownerRouter.get(
  '/total-revenue/years',
  revenueController.getTotalAvailableYears
);
ownerRouter.get('/total-revenue/year', revenueController.getTotalRevenueByYear);

//rent payment
ownerRouter.get(
  '/rent-payment/:boardingHouseId',
  paymentBillController.getPaymentBillByBoardingHouseId
);

ownerRouter.get(
  '/unpaid-rooms/:boardingHouseId',
  roomController.getUnpaidRoomsByBoardingHouse
);

// get electrical and water price
ownerRouter.get(
  '/electrical-water-price/:boardingHouseId',
  boardingHouseController.getElectricalAndWaterPrice
);

ownerRouter.post(
  '/calculate-monthly-bill',
  paymentBillController.calculateMonthlyRoomRent
);

export { ownerRouter };
