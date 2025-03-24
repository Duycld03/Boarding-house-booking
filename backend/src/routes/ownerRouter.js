import { Router } from 'express';
import {
  authController,
  boardingHouseController,
  ReviewController,
  tenantController,
  roomController,
  depositController,
} from '../controllers/index.js';
import { upload } from '../config/cloudinary.config.js';

const ownerRouter = Router();

ownerRouter.get('/', (req, res) => {
  res.send('This is a owner router');
});
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
ownerRouter.post('/reply', ReviewController.replyReview);
ownerRouter.get('/reviews/:reviewId', ReviewController.getReviewContent);
ownerRouter.put('/review/updatereply', ReviewController.updateReplyReview);
ownerRouter.delete('/review/reply', ReviewController.softDeleteReplyReview);
ownerRouter.get(
  '/tenant/:boardingHouseId',
  tenantController.getTenantsByBoardingHouse
);
ownerRouter.delete(
  '/tenant/:boardingHouseId/:accountId',
  tenantController.deleteTenantFromBoardingHouse
);
ownerRouter.get(
  '/boardinghouse/deposit/:boardingHouseId',
  depositController.getAllDepositRooms
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
  '/room/boarding-house/:boardingHouseId',
  roomController.getRoomsByBoardingHouse
);

export { ownerRouter };
