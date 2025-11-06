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
  bhExpenseController,
  revenueController,
  refundRequestController,
  renewalController,
  paymentBillController,
  managerController,
  roomAdditionFeeController,
  taskController,
  appointmentController,
} from "../controllers/index.js";
import { upload } from "../config/cloudinary.config.js";

const staffRouter = Router();

staffRouter.get("/", (req, res) => {
  res.send("This is a staff router");
});

//boarding house
staffRouter.get("/boardinghouseowner", boardingHouseController.getAllBHOwner);
staffRouter.get(
  "/boardinghouse/:id",
  boardingHouseController.getBoardingHouseDetails
);
staffRouter.put(
  "/boardinghouse/:id",
  upload.array("boardingHouse"),
  boardingHouseController.updateBoardingHouseDetailsOwner
);

staffRouter.get("/types", boardingHouseController.getAllBoardingHouseTypes);
// staffRouter.post(
//   "/boardinghouse",
//   upload.array("boardingHouse"), // Cho phép tối đa 16 ảnh trong 1 lần upload
//   boardingHouseController.createBoardingHouseOwner
// );
staffRouter.delete(
  "/boardinghouse/:id/softDelete",
  boardingHouseController.softDeleteBoardingHouse
);

//review
staffRouter.post("/reply", ReviewController.replyReview);
staffRouter.get("/reviews/:reviewId", ReviewController.getReviewContent);

// deposit
staffRouter.put("/review/updatereply", ReviewController.updateReplyReview);
staffRouter.delete("/review/reply", ReviewController.softDeleteReplyReview);

//tenant
staffRouter.get(
  "/tenant/:boardingHouseId",
  tenantController.getTenantsByBoardingHouse
);
staffRouter.delete(
  "/tenant/:boardingHouseId/:accountId",
  tenantController.deleteTenantFromBoardingHouse
);

//facilities
staffRouter.get("/facilities", FacilitiesController.getAllFacilities);

//roomtype
staffRouter.get(
  "/boardinghouse/room-types/:id",
  roomTypeController.getRoomTypeByBhId
);
staffRouter.post(
  "/boardinghouse/roomtype/:id/create",
  upload.single("roomType"),
  roomTypeController.addRoomTypeToBoardingHouse
);
staffRouter.put(
  "/boardinghouse/roomtype/:roomTypeId/",
  upload.single("roomType"), // Nếu có ảnh mới, upload lên Cloudinary
  roomTypeController.updateRoomTypeToBoardingHouse
);
staffRouter.delete(
  "/boardinghouse/roomtype/:roomTypeId/",
  roomTypeController.softDeleteRoomType
);

//deposit
staffRouter.get(
  "/bh/deposit-list",
  depositController.getDepositsByOwnerOrStaff
);

staffRouter.get(
  "/boardinghouse/deposit/max-deposit/:boardingHouseId",
  depositController.getMaxDeposit
);
staffRouter.get(
  "/boardinghouse/deposit/max-rent-time/:boardingHouseId",
  depositController.getMaxRentTime
);
staffRouter.put("/deposit/:depositId", depositController.handleDepositDecision);
staffRouter.delete(
  "/deposit-room/:depositRoomId",
  depositController.deleteDepositRoom
);

// room
staffRouter.get(
  "/room/boarding-house/:boardingHouseId",
  roomController.getRoomsByBoardingHouse
);

staffRouter.post(
  "/room/boarding-house",
  upload.single("Room"),
  roomController.addRoom
);
staffRouter.put(
  "/room/boarding-house/:roomId",
  upload.single("Room"),
  roomController.updateRoom
);
staffRouter.delete("/room/boarding-house/:roomId", roomController.deleteRoom);

//renewal
staffRouter.get(
  "/renewal/boarding-house/:boardingHouseId",
  renewalController.getRenewalRequestByBhID
);
staffRouter.put(
  "/renewal/:requestId",
  renewalController.handleExtensionRequestAction
);

// refund request
staffRouter.get(
  "/refund-requests",
  refundRequestController.getRefundRequestsForOwner
);
staffRouter.put(
  "/refund-request/:refundRequestId",
  refundRequestController.cancelRefundRequestsForOwner
);

staffRouter.post(
  "/refund-request/:refundRequestId",
  depositController.acceptRefundRequestForOwner
);

//expense
staffRouter.get("/expense", bhExpenseController.getExpensesByTime);
staffRouter.put("/expense/:expenseId", bhExpenseController.updateExpense);
staffRouter.get("/total-expense", bhExpenseController.getTotalExpensesByTime);
staffRouter.post("/expense", bhExpenseController.addExpense);
staffRouter.delete("/expense/:expenseId", bhExpenseController.deleteExpense);

//revenue
staffRouter.get("/revenue", revenueController.getRevenuePerBoardingHouse);
staffRouter.get("/revenue/years", revenueController.getAvailableYears);
staffRouter.get("/revenue/year", revenueController.getRevenueByYear);

staffRouter.get("/total-revenue", revenueController.getTotalRevenue);
staffRouter.get(
  "/total-revenue/years",
  revenueController.getTotalAvailableYears
);
staffRouter.get("/total-revenue/year", revenueController.getTotalRevenueByYear);

//rent payment
staffRouter.get(
  "/rent-payment/:boardingHouseId",
  paymentBillController.getPaymentBillByBoardingHouseId
);

staffRouter.get(
  "/unpaid-rooms/:boardingHouseId",
  roomController.getRoomsEligibleForBill
);

// get electrical and water price
staffRouter.get(
  "/electrical-water-price/:boardingHouseId",
  boardingHouseController.getElectricalAndWaterPrice
);

staffRouter.post(
  "/calculate-monthly-bill",
  paymentBillController.calculateMonthlyRoomRent
);
staffRouter.post(
  "/calculate-bulk-monthly-bill",
  paymentBillController.calculateBulkMonthlyRent
);
staffRouter.put(
  "/payment-bill/:paymentBillId",
  paymentBillController.updatePaymentBill
);
staffRouter.get(
  "/payment-bill/:paymentBillId",
  paymentBillController.getPaymentBillById
);

//manager
staffRouter.get("/manager-owner", managerController.getManagerOwner);

//room addition fee
staffRouter.post(
  "/room-addition-fee",
  roomAdditionFeeController.createRoomAdditionFee
);
staffRouter.get(
  "/room-addition-fee",
  roomAdditionFeeController.getAllRoomAdditionFees
);
staffRouter.get(
  "/room-addition-fee/calculate-rent/:roomId",
  roomAdditionFeeController.getRoomAdditionFeeForMonthlyCalculate
);
staffRouter.put(
  "/room-addition-fee/:id",
  roomAdditionFeeController.updateRoomAdditionFee
);
staffRouter.delete(
  "/room-addition-fee/:id",
  roomAdditionFeeController.deleteRoomAdditionFee
);

staffRouter.get(
  "/room-addition-fee/:roomId",
  roomAdditionFeeController.getRoomAdditionFeesByRoomId
);

staffRouter.get("/boardinghouse/reviews/:id", ReviewController.getReviewByBhId);

//task
staffRouter.get("/tasks", taskController.getTasks);
staffRouter.put("/tasks/:id", taskController.updateTask);
staffRouter.post(
  "/appointments/update/:appointmentId",
  appointmentController.handleViewingRequest
);
export { staffRouter };
