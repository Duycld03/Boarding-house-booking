import { Router } from 'express';
import {
  authController,
  boardingHouseController,
} from '../controllers/index.js';

const commonRouter = Router();


//auth

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string, example: "user123" }
 *               password: { type: string, example: "mypassword" }
 *               remember: { type: boolean, example: true }
 *     responses:
 *       200: { description: "Đăng nhập thành công" }
 *       401: { description: "Sai tài khoản hoặc mật khẩu" }
 */
commonRouter.post("/login", authController.login);

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
commonRouter.get('/boardinghouse/reviews/:id', boardingHouseController.getReviewByBhId);


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
 *         description: "Object chứa thông tin tỉnh, quận, phường để lọc nhà trọ"
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
commonRouter.get('/boardinghouse/home/area', boardingHouseController.getBhByArea);



//review





export { commonRouter };
