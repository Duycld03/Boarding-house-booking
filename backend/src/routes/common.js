import { Router } from "express";
import {
  appointmentController,
  authController,
  boardingHouseController,
  roomController,
  depositController,
} from "../controllers/index.js";
import ViewRoomRequest from "../models/viewRoomRequest.js";

const commonRouter = Router();

//auth

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Đăng nhập
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               remember:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Sai tài khoản hoặc mật khẩu
 */
commonRouter.post("/login", authController.login);

commonRouter.post("/login", authController.login);
commonRouter.post("/login-with-google", authController.loginWithGoogle);
commonRouter.post("/register", authController.register);
commonRouter.post("/forgot-password", authController.forgotPassword);
commonRouter.post("/reset-password", authController.resetPassword);
commonRouter.post("/send-otp-register", authController.sendOTPRegister);
commonRouter.post("/verify-register", authController.verifyRegister);

//boarding house
commonRouter.get("/boardinghouse", boardingHouseController.getAllBHOnHome);
commonRouter.get(
  "/boardinghouse/:id",
  boardingHouseController.getBoardingHouseDetailInUser
);
/**
 * @swagger
 * /boardinghouse/room-types/{id}:
 *   get:
 *     summary: Lấy danh sách loại phòng theo ID nhà trọ
 *     tags:
 *       - Boarding House
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nhà trọ
 *     responses:
 *       200:
 *         description: Trả về danh sách các loại phòng của nhà trọ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID của loại phòng
 *                   name:
 *                     type: string
 *                     description: Tên loại phòng
 *                   price:
 *                     type: number
 *                     description: Giá loại phòng
 *       400:
 *         description: ID không hợp lệ
 *       404:
 *         description: Không tìm thấy nhà trọ hoặc loại phòng
 *       500:
 *         description: Lỗi máy chủ nội bộ
 */
commonRouter.get(
  "/boardinghouse/room-types/:id",
  boardingHouseController.getRoomTypeByBhId
);

commonRouter.get(
  "/boardinghouse/reviews/:id",
  boardingHouseController.getReviewByBhId
);

/**
 * @swagger
 * /boardinghouse/home/area:
 *   get:
 *     summary: Lấy danh sách nhà trọ theo khu vực
 *     description: API này trả về danh sách nhà trọ có số phòng lớn hơn 0, có thể lọc theo một object chứa tỉnh, quận, phường.
 *     tags:
 *       - Boarding Houses
 *     parameters:
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: object
 *           properties:
 *             province:
 *               type: string
 *               example: "Hà Nội"
 *             district:
 *               type: string
 *               example: "Ba Đình"
 *             ward:
 *               type: string
 *               example: "Liễu Giai"
 *     responses:
 *       200:
 *         description: "Danh sách nhà trọ được trả về thành công"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "650e4b7f5d3c9a1a3e0f1234"
 *                   name:
 *                     type: string
 *                     example: "Nhà trọ Bình An"
 *                   address:
 *                     type: object
 *                     properties:
 *                       province:
 *                         type: string
 *                         example: "Hà Nội"
 *                       district:
 *                         type: string
 *                         example: "Ba Đình"
 *                       ward:
 *                         type: string
 *                         example: "Liễu Giai"
 *                   totalRooms:
 *                     type: integer
 *                     example: 5
 *       500:
 *         description: "Lỗi server"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
commonRouter.get(
  "/boardinghouse/home/area",
  boardingHouseController.getBhByArea
);

//review

/**
 * @swagger
 * /room/{roomTypeId}:
 *   get:
 *     summary: Lấy danh sách phòng theo loại phòng
 *     description: Trả về danh sách các phòng dựa trên roomTypeId.
 *     tags:
 *       - Room
 *     parameters:
 *       - in: path
 *         name: roomTypeId
 *         required: true
 *         description: ID của loại phòng
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách phòng theo loại phòng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "67927313c1040fb2069082a8"
 *                   roomNumber:
 *                     type: string
 *                     example: "101"
 *                   isAvailable:
 *                     type: boolean
 *                     example: true
 *                   description:
 *                     type: string
 *                     example: "Single Room with basic amenities."
 *       400:
 *         description: Thiếu tham số bắt buộc
 *       500:
 *         description: Lỗi server
 */
commonRouter.get(
  "/room/room-type/:roomTypeId",
  roomController.getRoomsByRoomType
);

/**
 * @swagger
 * /auth/appointment/owner/{ownerId}:
 *   get:
 *     summary: Lấy danh sách lịch hẹn của chủ trọ
 *     tags:
 *       - Appointment
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID chủ trọ
 *     responses:
 *       200:
 *         description: Trả về danh sách lịch hẹn
 *       400:
 *         description: Lỗi yêu cầu
 *       500:
 *         description: Lỗi server
 */
commonRouter.get(
  "/appointment/owner/:ownerId",
  appointmentController.getAppointmentsByOwnerId
);

// deposit
commonRouter.get("/deposit/vnpay-return", depositController.vnpayReturn);
commonRouter.get("/deposit/momo-return", depositController.momoReturn);

export { commonRouter };
