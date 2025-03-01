import { Router } from 'express';
import {
  authController,
  boardingHouseController,
  ReviewController,
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
ownerRouter.get('/reviews/reply/:parentId', ReviewController.getReplyContent);

export { ownerRouter };
