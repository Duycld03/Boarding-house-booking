import { Router } from "express";

import {
  authController,
  accountController,
  favoriteController,
  appointmentController,
  reportController,
  ReviewController
} from "./../controllers/index.js";
import { upload } from "../config/cloudinary.config.js";

const authRouter = Router();

authRouter.get("/", (req, res) => {
  res.send("This is an auth router");
});

authRouter.get("/user", authController.getAccountFromToken);
authRouter.get("/favorites", favoriteController.getFavorites);
authRouter.post("/favorites/create", favoriteController.createFavorite);
authRouter.post("/change-password", accountController.changePassword);
authRouter.put("/profile", accountController.updateAccountFromProfile);
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

/**
 * @swagger
 * /auth/appointment/create-appointment/:
 *   post:
 *     summary: "Tạo cuộc hẹn mới"
 *     description: "API này cho phép người dùng tạo một cuộc hẹn mới. Người dùng cần đăng nhập trước khi thực hiện yêu cầu."
 *     tags:
 *       - "Appointment"
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             properties:
 *               roomId:
 *                 type: "string"
 *                 description: "ID của phòng cần đặt lịch hẹn."
 *                 example: "650d1b3f5f1b2c3d4e5f6790"
 *               appointmentDate:
 *                 type: "string"
 *                 format: "date-time"
 *                 description: "Ngày và giờ cuộc hẹn theo chuẩn ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)."
 *                 example: "2024-10-01T09:00:00Z"
 *               note:
 *                 type: "string"
 *                 description: "Ghi chú thêm về cuộc hẹn (tùy chọn)."
 *                 example: "Khách muốn xem phòng vào buổi sáng."
 *     responses:
 *       "200":
 *         description: "Cuộc hẹn đã được tạo thành công."
 *       "400":
 *         description: "Yêu cầu không hợp lệ hoặc thiếu thông tin."
 *         content:
 *           application/json:
 *             example:
 *               message: "Trường roomId và appointmentDate là bắt buộc."
 *       "401":
 *         description: "Người dùng chưa xác thực hoặc token không hợp lệ."
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *       "500":
 *         description: "Lỗi máy chủ nội bộ."
 *         content:
 *           application/json:
 *             example:
 *               message: "Đã xảy ra lỗi khi tạo cuộc hẹn."
 */


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
//review
authRouter.put('/reviews/:reviewId', ReviewController.updateReview);
authRouter.get("/reviews", ReviewController.getReviewsUser);

export { authRouter };
