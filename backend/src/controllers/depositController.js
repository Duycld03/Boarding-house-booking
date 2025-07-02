import nodemailer from "nodemailer";
import moment from "moment";
import querystring from "qs";
import crypto from "crypto";
import axios from "axios";
import { sortObject } from "../utils/algorithms.js";
import DepositRoom from "../models/depositRoom.js";
import Room from "../models/room.js";
import PaymentBill from "../models/paymentBill.js";
import dotenv from "dotenv";
import UserPayment from "../models/userPayment.js";
import BoardingHouse from "../models/boardingHouse.js";
import { query } from "express";
import RefundRequest from "../models/refundRequest.js";
import { Account } from "../models/account.js";
import paginate from "../utils/pagination.js";

dotenv.config();

const config = {
  vnp_TmnCode: "1NH5FYBW",
  vnp_HashSecret: "4RMXXWH9GZAR4QPBVJN8OLADH87F8BQ8",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: process.env.NGROK_URL + "/deposit/vnpay-return",
};

class DepositController {
  async deposit(req, res) {
    try {
      const { roomId, rentalTime, timeType, rentalDate, price } = req.body;
      if (!roomId || !rentalTime || !timeType || !price || !rentalDate) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      const existDeposit = await DepositRoom.findOne({
        accountId: req.user.userId,
        roomId,
      });

      if (existDeposit) {
        return res
          .status(400)
          .json({ message: "You have already deposited for this room" });
      }

      const rentalTimeNumber = parseInt(
        rentalTime * (timeType === "month" ? 1 : 12)
      );

      await DepositRoom.create({
        accountId: req.user.userId,
        roomId,
        amount: price,
        rentalTime: rentalTimeNumber,
        startDate: rentalDate[0],
        endDate: rentalDate[1],
      });

      res.status(200).json({ message: "Deposit successfully" });
    } catch (error) {
      console.error("Error depositing:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }

  async getDepositedRooms(req, res) {
    try {
      const { userId } = req.user;

      if (!userId) {
        return res.status(403).json({ message: "User not found" });
      }

      // Get pagination parameters from query
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      // Basic filter by userId
      const filter = { accountId: userId };

      // Count total deposits of the user
      const totalItems = await DepositRoom.countDocuments(filter);

      if (totalItems === 0) {
        return res.status(200).json({
          success: true,
          message: "No deposited rooms found for this user",
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            limit,
            hasNextPage: false,
            hasPrevPage: false,
          },
          data: [],
        });
      }

      // Get deposits list with pagination
      const depositList = await DepositRoom.find(filter)
        .populate({
          path: "roomId",
          populate: {
            path: "boardingHouseId",
            select: "name address",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Format the data for the mobile app
      const formattedDeposits = depositList.map((deposit) => {
        return {
          _id: deposit._id,
          name: deposit.roomId?.boardingHouseId?.name || "Unknown Property",
          roomNumber: deposit.roomId?.roomNumber || "Unknown Room",
          roomId: deposit.roomId?._id,
          amount: deposit.amount || 0,
          status: deposit.status || "pending",
          startDate: deposit.startDate || null,
          endDate: deposit.endDate || null,
          rentalTime: deposit.rentalTime || 1,
          createdAt: deposit.createdAt,
        };
      });

      // Calculate pagination
      const totalPages = Math.ceil(totalItems / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const pagination = {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        hasNextPage,
        hasPrevPage,
      };

      return res.status(200).json({
        success: true,
        pagination,
        data: formattedDeposits,
      });
    } catch (error) {
      console.error("Error in getMyDepositedRooms:", error);
      return res.status(500).json({
        success: false,
        message: "There is something wrong!",
        error: error.message,
      });
    }
  }

  async getDepositRoom(req, res) {
    try {
      const { depositRoomId } = req.params;
      const deposit = await DepositRoom.findOne({
        _id: depositRoomId,
        accountId: req.user.userId,
      })
        .populate({
          path: "roomId",
          select: "roomNumber images",
          populate: [
            {
              path: "boardingHouseId",
              select: "name",
              populate: { path: "boardingHouseType", select: "name" },
            },
            {
              path: "rentBy",
              select: "fullname avatarImage",
            },
            {
              path: "roomTypeId",
              select: "price roomSize",
            },
          ],
        })
        .lean();

      res.status(200).json({
        boardingHouseName: deposit.roomId.boardingHouseId.name,
        boardingHouseType:
          deposit.roomId.boardingHouseId.boardingHouseType.name,
        roomNumber: deposit.roomId.roomNumber,
        images: deposit.roomId.images,
        price: deposit.roomId.roomTypeId.price,
        roomSize: deposit.roomId.roomTypeId.roomSize,
        rentBy: deposit.roomId.rentBy,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

  async vnpayReturn(req, res) {
    let vnp_Params = req.query;

    let secureHash = vnp_Params["vnp_SecureHash"];
    const orderInfo = vnp_Params["vnp_OrderInfo"].split("-");
    const type = orderInfo[0];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = config.vnp_TmnCode;
    let secretKey = config.vnp_HashSecret;

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    if (secureHash === signed && vnp_Params["vnp_ResponseCode"] === "00") {
      if (type == "deposit") {
        const accountId = orderInfo[1];
        const depositRoomId = orderInfo[2];

        const depositRoom = await DepositRoom.findOne({
          _id: depositRoomId,
          accountId,
          status: { $regex: /^accepted$/i },
        });

        if (!depositRoom) {
          throw new Error("Deposit room not found");
        }

        depositRoom.status = "confirmed";

        const room = await Room.findById(depositRoom.roomId);
        room.rentBy.push(accountId);
        await room.save();

        await depositRoom.save();

        const redirectUrl = `${process.env.NGROK_URL}/my-deposited-room?status=success`;
        return res.redirect(redirectUrl);
      } else if (type == "payRent") {
        const userId = orderInfo[1];
        const paymentBillId = orderInfo[2];

        const userPayment = await UserPayment.findOne({
          accountId: userId,
          status: { $regex: /^pending$/i },
          paymentBillId,
        });
        if (!userPayment) {
          throw new Error("Payment not found");
        }

        userPayment.status = "Paid";
        userPayment.paymentMethod = "VNPay";
        await userPayment.save();

        const allUserPayments = await UserPayment.find({
          paymentBillId,
        }).lean();

        const allPaid =
          allUserPayments.length > 0 &&
          allUserPayments.every(
            (payment) => payment.status.toLowerCase() === "paid"
          );

        if (allPaid) {
          await PaymentBill.updateOne(
            { _id: paymentBillId },
            { $set: { status: "Paid" } }
          );
        }

        const redirectUrl = `${process.env.NGROK_URL}/my-deposited-room?status=success`;
        return res.redirect(redirectUrl);
      }
      // refund
      const accountId = orderInfo[1];
      const refundRequestId = orderInfo[2];

      const refundRequest = await RefundRequest.findOne({
        _id: refundRequestId,
        accountId,
        status: { $regex: /^pending$/i },
      }).populate("depositRoomId");

      if (!refundRequest) {
        throw new Error("Refund request not found");
      }

      refundRequest.status = "accepted";

      const depositRoom = await DepositRoom.findById(
        refundRequest.depositRoomId
      );
      depositRoom.status = "refunded";
      await depositRoom.save();

      const room = await Room.findById(depositRoom.roomId);
      room.rentBy = room.rentBy.filter((id) => id.toString() !== accountId);
      await room.save();

      await refundRequest.save();

      const redirectUrl = `${process.env.NGROK_URL}/refund-request-management?status=success`;
      return res.redirect(redirectUrl);
    }
    //failed
    let redirectUrl = `${process.env.NGROK_URL}/my-deposited-room?status=fail`;
    if (type == "refund") {
      redirectUrl = `${process.env.NGROK_URL}/refund-request-management?status=fail`;
    }
    res.redirect(redirectUrl);
  }

  async momoReturn(req, res) {
    const {
      orderId,
      amount,
      orderInfo,
      resultCode,
      message,
      transId,
      responseTime,
    } = req.query;

    const info = orderInfo.split("-");
    const type = info[0];
    try {
      if (resultCode == "7002" || resultCode == "0") {
        if (type == "deposit") {
          const accountId = info[1];
          const depositRoomId = info[2];

          const depositRoom = await DepositRoom.findOne({
            _id: depositRoomId,
            accountId,
            status: { $regex: /^accepted$/i },
          });

          if (!depositRoom) {
            throw new Error("Deposit room not found");
          }

          depositRoom.status = "confirmed";

          const room = await Room.findById(depositRoom.roomId);
          room.rentBy.push(accountId);
          await room.save();

          await depositRoom.save();

          const redirectUrl = `${process.env.NGROK_URL}/my-deposited-room?status=success`;
          return res.redirect(redirectUrl);
        } else if (type == "payRent") {
          const userId = info[1];
          const paymentBillId = info[2];

          const userPayment = await UserPayment.findOne({
            accountId: userId,
            status: { $regex: /^pending$/i },
            paymentBillId,
          });
          if (!userPayment) {
            throw new Error("Payment not found");
          }

          userPayment.status = "Paid";
          userPayment.paymentMethod = "VNPay";
          await userPayment.save();

          const allUserPayments = await UserPayment.find({
            paymentBillId,
          }).lean();

          const allPaid =
            allUserPayments.length > 0 &&
            allUserPayments.every(
              (payment) => payment.status.toLowerCase() === "paid"
            );

          if (allPaid) {
            await PaymentBill.updateOne(
              { _id: paymentBillId },
              { $set: { status: "Paid" } }
            );
          }

          const redirectUrl = `${process.env.NGROK_URL}/my-deposited-room?status=success`;
          return res.redirect(redirectUrl);
        }
        // refund
        const accountId = orderInfo[1];
        const refundRequestId = orderInfo[2];

        const refundRequest = await RefundRequest.findOne({
          _id: refundRequestId,
          accountId,
          status: { $regex: /^pending$/i },
        }).populate("depositRoomId");

        if (!refundRequest) {
          throw new Error("Refund request not found");
        }

        refundRequest.status = "accepted";

        const depositRoom = await DepositRoom.findById(
          refundRequest.depositRoomId
        );
        depositRoom.status = "refunded";
        await depositRoom.save();

        const room = await Room.findById(depositRoom.roomId);
        room.rentBy = room.rentBy.filter((id) => id.toString() !== accountId);
        await room.save();

        await refundRequest.save();

        const redirectUrl = `${process.env.NGROK_URL}/refund-request-management?status=success`;
        return res.redirect(redirectUrl);
      }
    } catch (error) {
      console.log("Error momo return:", error);

      let redirectUrl = `${process.env.NGROK_URL}/my-deposited-room?status=fail`;
      if (type == "refund") {
        redirectUrl = `${process.env.NGROK_URL}/refund-request-management?status=fail`;
      }
      res.redirect(redirectUrl);
    }
  }

  async payRent(req, res) {
    try {
      const { userId, depositRoomId, paymentMethod } = req.body;
      const deposit = await DepositRoom.findOne({
        _id: depositRoomId,
        accountId: userId,
      }).select("roomId");

      if (!deposit) {
        return res.status(400).json({ message: "Deposit room not found" });
      }

      const userPayment = await UserPayment.findOne({
        accountId: userId,
        status: { $regex: /^pending$/i },
      })
        .populate({
          path: "paymentBillId",
          match: { status: { $regex: /^pending$/i }, roomId: deposit.roomId },
        })
        .lean();

      if (!userPayment || !userPayment.paymentBillId) {
        return res.status(400).json({ message: "Payment not found" });
      }

      const orderInfo = `payRent-${userId}-${userPayment.paymentBillId._id}`;
      if (paymentMethod === "vnpay") {
        createVNPayUrl(req, res, userPayment.paymentAmount, orderInfo);
      } else if (paymentMethod == "momo") {
        createMomoUrl(req, res, userPayment.paymentAmount, orderInfo);
      }
    } catch (error) {
      console.error("Error paying rent:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }

  async checkPayRentStatus(req, res) {
    try {
      const { depositRoomId } = req.params;

      if (!depositRoomId) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const deposit = await DepositRoom.findOne({
        _id: depositRoomId,
        accountId: req.user.userId,
      }).select("roomId");

      if (!deposit) {
        return res.status(400).json({ message: "Deposit room not found" });
      }

      // Calculate previous month
      const currentDate = new Date();
      // Go back one month
      currentDate.setMonth(currentDate.getMonth() - 1);

      const currentMonth = (currentDate.getMonth() + 1).toString(); // JavaScript months are 0-based
      const currentYear = currentDate.getFullYear().toString();

      const paymentBills = await PaymentBill.find({
        roomId: deposit.roomId,
        status: { $regex: /^paid$/i },
        month: currentMonth,
        year: currentYear,
      }).select("_id");

      const paymentBillIds = paymentBills.map((bill) => bill._id);

      // Then check if user has paid for any of these bills
      const payment = await UserPayment.findOne({
        accountId: req.user.userId,
        paymentBillId: { $in: paymentBillIds },
        status: { $regex: /^paid$/i },
      }).lean();

      const isPaid = !!payment;
      // Return payment information including previous month/year for debugging
      return res.json({
        isPaid,
        currentMonth,
        currentYear,
        paymentBillsFound: paymentBillIds.length,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getDepositsByOwnerOrStaff(req, res) {
    try {
      const userId = req.user.userId;
      const account = await Account.findById(userId);
      if (!account) {
        return res.status(404).json({
          message: "Account not found",
          success: false,
          error: true,
        });
      }

      const { status, priceRange, roomId, rentalTime } = req.query;

      // 1. Tìm tất cả boarding house mà user là owner hoặc staff
      const boardingHouses = await BoardingHouse.find({
        $or: [{ ownerId: userId }, { staffId: userId }],
      }).lean();

      const bhIds = boardingHouses.map((bh) => bh._id.toString());

      // 2. Tìm tất cả room thuộc các boarding house này
      const rooms = await Room.find({ boardingHouseId: { $in: bhIds } }).lean();
      const roomMap = new Map(
        rooms.map((room) => [
          room._id.toString(),
          {
            roomNumber: room.roomNumber,
            boardingHouseId: room.boardingHouseId.toString(),
          },
        ])
      );
      const roomIds = [...roomMap.keys()];

      // 3. Tạo bộ lọc truy vấn DepositRoom
      let filter = { roomId: { $in: roomIds } };

      if (roomId && roomId !== "" && roomMap.has(roomId)) {
        filter.roomId = roomId;
      }

      if (status && status !== "") {
        filter.status = status;
      }

      if (priceRange) {
        try {
          let [min, max] =
            typeof priceRange === "string"
              ? priceRange.split(",").map(Number)
              : [0, 0];
          if (!isNaN(min) && !isNaN(max)) {
            filter.amount = { $gte: min, $lte: max };
          }
        } catch (e) {
          console.error("Error parsing priceRange:", e);
        }
      }

      if (rentalTime) {
        try {
          let [min, max] =
            typeof rentalTime === "string"
              ? rentalTime.split(",").map(Number)
              : [0, 0];
          if (!isNaN(min) && !isNaN(max)) {
            filter.rentalTime = { $gte: min, $lte: max };
          }
        } catch (e) {
          console.error("Error parsing rentalTime:", e);
        }
      }

      // 4. Cấu hình phân trang
      const paginationOptions = {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100,
        sortField: "createdAt",
        sortOrder: "desc",
        filter,
        populate: [{ path: "accountId", select: "fullname" }],
        includeTotalData: true,
      };

      // 5. Gọi paginate helper
      const paginatedResult = await paginate(
        DepositRoom,
        paginationOptions,
        req
      );

      // 6. Tạo bản đồ boardingHouseId -> name
      const bhMap = new Map(
        boardingHouses.map((bh) => [bh._id.toString(), bh.name])
      );

      // 7. Định dạng dữ liệu trả về
      paginatedResult.data = paginatedResult.data.map((deposit) => {
        const roomInfo = roomMap.get(deposit.roomId.toString()) || {};
        const bhName = bhMap.get(roomInfo.boardingHouseId) || "Unknown";

        return {
          _id: deposit._id,
          name: deposit.accountId?.fullname || "Unknown",
          roomNumber: roomInfo.roomNumber || "N/A",
          boardingHouseName: bhName,
          amount: deposit.amount,
          status: deposit.status,
          startDate: moment(deposit.createdAt).format("DD/MM/YYYY"),
          endDate: moment(deposit.endDate).format("DD/MM/YYYY"),
          rentalTime: deposit.rentalTime,
        };
      });

      return res.status(200).json({
        message: "Fetched successfully",
        success: true,
        error: false,
        ...paginatedResult,
      });
    } catch (error) {
      console.error("Error getting deposits:", error);
      return res.status(500).json({
        message: "Server error",
        success: false,
        error: true,
      });
    }
  }

  async acceptDepositRoom(req, res) {
    try {
      const { depositId } = req.params;

      const deposit = await DepositRoom.findById(depositId)
        .populate({ path: "accountId", select: "fullname email" })
        .populate({
          path: "roomId",
          select: "roomNumber boardingHouseId roomTypeId",
          populate: [
            {
              path: "boardingHouseId",
              select: "name boardingHouseType",
              populate: {
                path: "boardingHouseType",
                select: "codeName",
              },
            },
            {
              path: "roomTypeId",
              select: "typeName peopleNumber",
            },
          ],
        });

      if (!deposit) {
        return res.status(404).json({ error: "Không tìm thấy khoản đặt cọc" });
      }

      const boardingHouse = deposit.roomId.boardingHouseId;
      const boardingHouseName = boardingHouse?.name || "Không có tên nhà trọ";
      const boardingHouseTypeCode =
        boardingHouse?.boardingHouseType?.codeName || "";

      // Tạo transporter gửi email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "todohongy@gmail.com",
          pass: "ersq syrb ihov ilvx",
        },
      });

      const sendEmail = async (to, subject, html) => {
        await transporter.sendMail({
          from: "support@example.com",
          to,
          subject,
          html,
        });
      };

      // Xử lý nếu là ký túc xá
      if (boardingHouseTypeCode === "nha_tro_kien_truc_xa") {
        const currentAcceptedCount = await DepositRoom.countDocuments({
          roomId: deposit.roomId._id,
          status: "accepted",
        });

        const limit = parseInt(
          deposit.roomId.roomTypeId?.peopleNumber || "0",
          10
        );

        if (currentAcceptedCount >= limit) {
          // Từ chối vì quá giới hạn
          deposit.status = "rejected";
          deposit.rejectReason = "Phòng ký túc xá đã đủ số lượng người.";
          await deposit.save();

          await sendEmail(
            deposit.accountId.email,
            "Yêu cầu đặt cọc đã bị từ chối ❌",
            `
          <p>Xin chào <strong>${deposit.accountId.fullname}</strong>,</p>
          <p>Rất tiếc! Phòng <strong>${deposit.roomId.roomNumber}</strong> tại nhà trọ <strong>${boardingHouseName}</strong> đã đủ số người đăng ký.</p>
          <p>Khoản đặt cọc của bạn <strong>không được chấp nhận</strong>.</p>
          <p>Vui lòng chọn phòng khác hoặc liên hệ chủ trọ để được hỗ trợ thêm.</p>
          <p>Trân trọng,<br>Đội ngũ hỗ trợ XYZ</p>
        `
          );

          return res.status(200).json({
            message:
              "Phòng đã đủ người, đơn đã bị từ chối và email đã được gửi.",
            status: "rejected",
            depositId: deposit._id,
          });
        }
      }

      // Nếu không quá giới hạn → chấp nhận
      deposit.status = "accepted";
      await deposit.save();

      await sendEmail(
        deposit.accountId.email,
        "Đặt cọc phòng trọ đã được chấp nhận ✅",
        `
      <p>Xin chào <strong>${deposit.accountId.fullname}</strong>,</p>
      <p>Khoản đặt cọc của bạn cho phòng <strong>${deposit.roomId.roomNumber}</strong> tại nhà trọ <strong>${boardingHouseName}</strong> đã được <span style="color:green;"><strong>chấp nhận</strong></span>.</p>
      <ul>
        <li><strong>Số tiền đặt cọc:</strong> ${deposit.amount.toLocaleString()} VND</li>
        <li><strong>Thời gian thuê:</strong> ${deposit.rentalTime} tháng</li>
        <li><strong>Ngày bắt đầu:</strong> ${moment(deposit.startDate).format("DD/MM/YYYY")}</li>
        <li><strong>Ngày kết thúc:</strong> ${moment(deposit.endDate).format("DD/MM/YYYY")}</li>
      </ul>
      <p>Hãy liên hệ chủ nhà để hoàn tất thủ tục tiếp theo nhé!</p>
      <p>Trân trọng,<br>Đội ngũ hỗ trợ XYZ</p>
    `
      );

      // Nếu là mini_house hoặc nhà trọ truyền thống → từ chối đơn pending khác
      if (
        ["mini_house", "nha_tro_truyen_thong"].includes(boardingHouseTypeCode)
      ) {
        const rejectedDeposits = await DepositRoom.find({
          _id: { $ne: depositId },
          roomId: deposit.roomId._id,
          status: "pending",
        }).populate({ path: "accountId", select: "fullname email" });

        for (const rejected of rejectedDeposits) {
          rejected.status = "rejected";
          rejected.rejectReason = "Phòng đã được đặt cọc bởi người khác.";
          await rejected.save();

          await sendEmail(
            rejected.accountId.email,
            "Yêu cầu đặt cọc đã bị từ chối ❌",
            `
          <p>Xin chào <strong>${rejected.accountId.fullname}</strong>,</p>
          <p>Rất tiếc! Phòng <strong>${deposit.roomId.roomNumber}</strong> tại nhà trọ <strong>${boardingHouseName}</strong> đã được người khác đặt cọc trước.</p>
          <p>Khoản đặt cọc của bạn <strong>không được chấp nhận</strong>.</p>
          <p>Vui lòng chọn phòng khác hoặc liên hệ với chủ trọ để được hỗ trợ thêm.</p>
          <p>Trân trọng,<br>Đội ngũ hỗ trợ XYZ</p>
        `
          );
        }
      }

      return res.status(200).json({
        message:
          "Đã chấp nhận khoản đặt cọc và xử lý các đơn liên quan (nếu có).",
        status: "accepted",
        depositId: deposit._id,
      });
    } catch (error) {
      console.error("Error accepting deposit room:", error);
      return res.status(500).json({
        error: "Đã có lỗi xảy ra",
        detail: error.message,
      });
    }
  }

  async getMaxDeposit(req, res) {
    try {
      const { boardingHouseId } = req.params;

      const rooms = await Room.find({ boardingHouseId }).select("_id");
      const roomIds = rooms.map((room) => room._id);

      if (!roomIds.length) {
        return res.status(200).json(0);
      }

      const maxDeposit = await DepositRoom.findOne({ roomId: { $in: roomIds } })
        .sort({ amount: -1 })
        .select("amount");

      res.status(200).json(maxDeposit?.amount || 0);
    } catch (error) {
      console.error("Error getting max deposit:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }

  async getMaxRentTime(req, res) {
    try {
      const { boardingHouseId } = req.params;

      const rooms = await Room.find({ boardingHouseId }).select("_id");
      const roomIds = rooms.map((room) => room._id);

      if (!roomIds.length) {
        return res.status(200).json(0);
      }

      const maxRentTime = await DepositRoom.findOne({
        roomId: { $in: roomIds },
      })
        .sort({ rentalTime: -1 })
        .select("rentalTime");

      res.status(200).json(maxRentTime?.rentalTime || 0);
    } catch (error) {
      console.error("Error getting max rent time:", error);
    }
  }

  async payDeposit(req, res) {
    try {
      const { depositRoomId, paymentMethod } = req.body;
      const depositRoom = await DepositRoom.findOne({
        _id: depositRoomId,
        accountId: req.user.userId,
        status: { $regex: /^accepted$/i },
      });

      if (!depositRoom) {
        return res.status(400).json({ message: "Deposit room not found" });
      }
      const { amount } = depositRoom;

      const orderInfo = `deposit-${req.user.userId}-${depositRoomId}`;

      if (paymentMethod === "vnpay") {
        createVNPayUrl(req, res, amount, orderInfo);
      } else if (paymentMethod === "momo") {
        createMomoUrl(req, res, amount, orderInfo);
      }
    } catch (error) {
      console.error("Error confirming deposit:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
  async rejectDepositRoom(req, res) {
    try {
      const { depositId } = req.params;
      const { reasonForCancel } = req.body; // Lấy lý do hủy từ request body

      if (!reasonForCancel) {
        return res
          .status(400)
          .json({ error: "Reason for rejection is required" });
      }

      // Lấy thông tin khoản đặt cọc, bao gồm cả boardingHouseName
      const deposit = await DepositRoom.findById(depositId)
        .populate({ path: "accountId", select: "fullname email" })
        .populate({
          path: "roomId",
          select: "roomNumber boardingHouseId", // Lấy boardingHouseId từ roomId
          populate: {
            path: "boardingHouseId", // Populate boardingHouseId trong roomId
            select: "name", // Lấy trường name của boardingHouse
          },
        });

      if (!deposit) {
        return res.status(404).json({ error: "Không tìm thấy khoản đặt cọc" });
      }

      // Lấy tên nhà trọ từ boardingHouseId đã populate
      const boardingHouseName = deposit.roomId.boardingHouseId
        ? deposit.roomId.boardingHouseId.name
        : "Không có tên nhà trọ";

      // Cập nhật status thành 'rejected' và thêm lý do hủy
      deposit.status = "rejected";
      deposit.reasonForCancel = reasonForCancel; // Thêm lý do hủy vào đối tượng deposit
      await deposit.save();

      // Config mail server (nhớ đổi tài khoản của bạn)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "todohongy@gmail.com", // Thay bằng email của bạn
          pass: "ersq syrb ihov ilvx", // Thay bằng App Password
        },
      });

      const mailOptions = {
        from: "support@example.com",
        to: deposit.accountId.email,
        subject: "Đặt cọc phòng trọ đã bị từ chối ❌",
        html: `
        <p>Xin chào <strong>${deposit.accountId.fullname}</strong>,</p>
        <p>Khoản đặt cọc của bạn cho phòng <strong>${deposit.roomId.roomNumber}</strong> tại nhà trọ <strong>${boardingHouseName}</strong> đã bị <span style="color:red;"><strong>từ chối</strong></span>.</p>
        <ul>
          <li><strong>Số tiền đặt cọc:</strong> ${deposit.amount.toLocaleString()} VND</li>
          <li><strong>Thời gian thuê:</strong> ${deposit.rentalTime} tháng</li>
          <li><strong>Ngày bắt đầu:</strong> ${moment(deposit.startDate).format("DD/MM/YYYY")}</li>
          <li><strong>Ngày kết thúc:</strong> ${moment(deposit.endDate).format("DD/MM/YYYY")}</li>
          <li><strong>Lý do từ chối:</strong> ${reasonForCancel}</li>
        </ul>
        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại.</p>
        <p>Trân trọng,<br>Đội ngũ hỗ trợ XYZ</p>
      `,
      };

      // Gửi mail
      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        message: "Đã từ chối khoản đặt cọc và gửi email thành công.",
        depositId: deposit._id,
      });
    } catch (error) {
      console.error("Error rejecting deposit room:", error);
      return res
        .status(500)
        .json({ error: "Đã có lỗi xảy ra", detail: error.message });
    }
  }
  async acceptRefundRequestForOwner(req, res) {
    try {
      const { refundRequestId } = req.params;
      const { paymentMethod } = req.body;
      const existRefundRequest = await RefundRequest.findOne({
        _id: refundRequestId,
        status: { $regex: /^pending$/i },
      });

      if (!existRefundRequest) {
        return res.status(400).json({ message: "Refund request not found" });
      }

      const { amountRefunded, accountId } = existRefundRequest;
      const orderInfo = `refund-${accountId}-${refundRequestId}`;

      if (paymentMethod === "vnpay") {
        createVNPayUrl(req, res, amountRefunded, orderInfo);
      } else if (paymentMethod === "momo") {
        createMomoUrl(req, res, amountRefunded, orderInfo);
      }
    } catch (error) {
      console.error("Error paying deposit refund:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
}

const createVNPayUrl = async (req, res, amount, orderInfo) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = config.vnp_TmnCode;
  let secretKey = config.vnp_HashSecret;
  let vnpUrl = config.vnp_Url;
  let returnUrl = config.vnp_ReturnUrl;
  let orderId = moment(date).format("DDHHmmss");
  // let amount = 100000;

  let locale = "vn";
  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = orderInfo;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  //   vnp_Params["vnp_BankCode"] = "NCB";

  vnp_Params = sortObject(vnp_Params);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  res.status(200).json({ code: "00", payUrl: vnpUrl });
};

const createMomoUrl = async (req, res, amount, orderInfo) => {
  var accessKey = "F8BBA842ECF85";
  var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var partnerCode = "MOMO";
  var redirectUrl = process.env.NGROK_URL + "/deposit/momo-return";
  var ipnUrl = process.env.NGROK_URL + "/deposit/momo-return";
  var requestType = "payWithMethod";
  var orderId = partnerCode + new Date().getTime();
  var requestId = orderId;
  var extraData = "";
  var paymentCode =
    "T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
  var orderGroupId = "";
  var autoCapture = true;
  var lang = "vi";

  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  //signature
  var signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature,
  });

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    url: "https://test-payment.momo.vn/v2/gateway/api/create",
    data: requestBody,
  };

  try {
    const response = await axios(options);
    return res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export default new DepositController();
