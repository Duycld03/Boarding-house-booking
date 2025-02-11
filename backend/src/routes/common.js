import { Router } from 'express';
import {
  authController,
  boardingHouseController,
} from '../controllers/index.js';

const commonRouter = Router();


//auth
commonRouter.post('/login', authController.login);
commonRouter.post('/login-with-google', authController.loginWithGoogle);
commonRouter.post('/register', authController.register);
commonRouter.post('/forgot-password', authController.forgotPassword);
commonRouter.post('/reset-password', authController.resetPassword);
commonRouter.post('/send-otp-register', authController.sendOTPRegister);
commonRouter.post('/verify-register', authController.verifyRegister);


//boarding house
commonRouter.get('/boardinghouse', boardingHouseController.getAllBHOnHome);
commonRouter.get('/boardinghouse/:id', boardingHouseController.getBoardingHouseDetailInUser);
commonRouter.get('/boardinghouse/room-types/:id', boardingHouseController.getRoomTypeByBhId);

export { commonRouter };
