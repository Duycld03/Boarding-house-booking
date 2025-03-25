import { Router } from "express";
import {
  authController,
  boardingHouseController,
  ReviewController,
  roomTypeController,
  FacilitiesController,
  tenantController,
  roomController,
  depositController,
  expenseController,
  revenueController,
  renewalRequestController,
  refundRequestController,
} from "../controllers/index.js";
import { upload } from "../config/cloudinary.config.js";

const ownerRouter = Router();

ownerRouter.get("/", (req, res) => {
  res.send("This is a owner router");
});

//boarding house
ownerRouter.get('/boardinghouseowner', boardingHouseController.getAllBHOwner);
ownerRouter.get(
  "/boardinghouse/:id",
  boardingHouseController.getBoardingHouseDetails
);
ownerRouter.put(
  "/boardinghouse/:id",
  upload.array("boardingHouse"),
  boardingHouseController.updateBoardingHouseDetailsOwner
);

ownerRouter.get("/types", boardingHouseController.getAllBoardingHouseTypes);
ownerRouter.post(
  "/boardinghouse",
  upload.array("boardingHouse"), // Cho phép tối đa 16 ảnh trong 1 lần upload
  boardingHouseController.createBoardingHouseOwner
);
ownerRouter.delete(
  "/boardinghouse/:id/softDelete",
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
  "/tenant/:boardingHouseId",
  tenantController.getTenantsByBoardingHouse
);
ownerRouter.delete(
  "/tenant/:boardingHouseId/:accountId",
  tenantController.deleteTenantFromBoardingHouse
);

//facilities
ownerRouter.get('/facilities', FacilitiesController.getAllFacilities);

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
ownerRouter.get(
  "/boardinghouse/deposit/:boardingHouseId",
  depositController.getAllDepositRooms
);

ownerRouter.get(
  '/boardinghouse/deposit/:boardingHouseId',
  depositController.getDepositByBhId
);

ownerRouter.get(
  '/boardinghouse/deposit/max-deposit/:boardingHouseId',
  depositController.getMaxDeposit
);
ownerRouter.get(
  '/boardinghouse/deposit/max-rent-time/:boardingHouseId',
  depositController.getMaxRentTime
);
ownerRouter.put(
  '/acceptdeposit/:depositId',
  depositController.acceptDepositRoom
);
ownerRouter.put(
  '/rejectdeposit/:depositId',
  depositController.rejectDepositRoom
);


// room
ownerRouter.get(
  "/room/boarding-house/:boardingHouseId",
  roomController.getRoomsByBoardingHouse
);

ownerRouter.post(
  "/room/boarding-house",
  upload.single("Room"),
  roomController.addRoom
);
ownerRouter.put(
  "/room/boarding-house/:roomId",
  upload.single("Room"),
  roomController.updateRoom
);
ownerRouter.delete("/room/boarding-house/:roomId", roomController.deleteRoom);


//renewal
ownerRouter.get(
  "/renewal/boarding-house/:boardingHouseId",
  renewalRequestController.getRenewalRequestByBhID
);
ownerRouter.put(
  "/renewal/:requestId",
  renewalRequestController.acceptExtensionRequest
);
ownerRouter.put(
  "/rejectrenewal/:requestId",
  renewalRequestController.rejectExtensionRequest
);

// refund request
ownerRouter.get(
  "/refund-requests",
  refundRequestController.getRefundRequestsForOwner
);
ownerRouter.put(
  "/refund-request/:refundRequestId",
  refundRequestController.cancelRefundRequestsForOwner
);


//expense
ownerRouter.get('/expense', expenseController.getExpensesByTime);
ownerRouter.put('/expense/:expenseId', expenseController.updateExpense);


//revenue
ownerRouter.get('/revenue', revenueController.getRevenue);
ownerRouter.get('/revenue/years', revenueController.getAvailableYears);
ownerRouter.get('/revenue/year', revenueController.getRevenueByYear);



export { ownerRouter };
