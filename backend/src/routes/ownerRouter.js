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
  renewalRequestController,
  refundRequestController,
} from '../controllers/index.js';
import { upload } from '../config/cloudinary.config.js';

const ownerRouter = Router();

ownerRouter.get('/', (req, res) => {
  res.send('This is a owner router');
});

//boarding house
ownerRouter.get('/boardinghouseowner', boardingHouseController.getAllBHOwner);
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
  '/boardinghouse/deposit/:boardingHouseId',
  depositController.getAllDepositRooms
);

// room
ownerRouter.get(
  '/room/boarding-house/:boardingHouseId',
  roomController.getRoomsByBoardingHouse
);

//renewal
ownerRouter.get(
  '/renewal/boarding-house/:boardingHouseId',
  renewalRequestController.getRenewalRequestByBhID
);
ownerRouter.put(
  '/renewal/:requestId',
  renewalRequestController.acceptExtensionRequest
);
ownerRouter.put(
  '/rejectrenewal/:requestId',
  renewalRequestController.rejectExtensionRequest
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

export { ownerRouter };
