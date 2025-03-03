import { Router } from "express";

import {
  authController,
  accountController,
  favoriteController,
  appointmentController,
  reportController,
  ReviewController,
  watchLaterController,
  depositController,
} from "./../controllers/index.js";
import { upload } from "../config/cloudinary.config.js";

const authRouter = Router();

authRouter.get("/", (req, res) => {
  res.send("This is an auth router");
});

authRouter.get('/user', authController.getAccountFromToken);
authRouter.get('/favorites', favoriteController.getFavorites);
authRouter.post('/favorites/create', favoriteController.createFavorite);
authRouter.delete('/favorites/:boardingHouseId', favoriteController.deleteFavorite);
authRouter.post('/change-password', accountController.changePassword);
authRouter.put('/profile', accountController.updateAccountFromProfile);

authRouter.put(
  "/avatar",
  upload.single("avatar"),
  accountController.updateAvatar
);
authRouter.put(
  "/review",
  upload.single("review"),
  ReviewController.updateReviewImage
);

authRouter.post("/send-otp-change-email", accountController.sendOTPChangeEmail);
authRouter.post("/verify-change-email", accountController.verifyChangeEmail);

//appointment
authRouter.get(
  "/appointment/user",
  appointmentController.getAppointmentByUserId
);
authRouter.put(
  "/appointment/update-status/:id",
  appointmentController.updateAppointmentStatus
);


authRouter.post(
  "/appointment/create-appointment/",
  appointmentController.createAppointment
);
authRouter.post("/reviews", ReviewController.addReview);

// report
authRouter.get("/reports/exist", reportController.checkReportExist);
authRouter.post(
  "/reports",
  upload.array("report"),
  reportController.createReport
);
authRouter.get("/reports", reportController.getReportByUserId);


//review
authRouter.put('/reviews/:reviewId', ReviewController.updateReview);
authRouter.get("/reviews", ReviewController.getReviewsUser);
authRouter.delete("/reviews/:reviewId", ReviewController.softDeleteReview);

authRouter.get("/watchlater", watchLaterController.getWatchLater);
authRouter.get("/watchlater/all", watchLaterController.getAllWatchLater);
authRouter.post("/watchlater/create", watchLaterController.createWatchLater);
authRouter.delete(
  "/watchlater/:watchLaterId",
  watchLaterController.deleteWatchLater
);

// deposit
authRouter.post("/deposit", depositController.deposit);





export { authRouter };
