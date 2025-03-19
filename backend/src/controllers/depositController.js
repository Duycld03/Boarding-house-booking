import moment from 'moment';
import querystring from 'qs';
import crypto from 'crypto';
import axios from 'axios';
import { sortObject } from '../utils/algorithms.js';
import DepositRoom from '../models/depositRoom.js';
import Room from '../models/room.js';
import PaymentBill from '../models/paymentBill.js';
import dotenv from 'dotenv';
import UserPayment from '../models/userPayment.js';
dotenv.config();

const config = {
  vnp_TmnCode: '1NH5FYBW',
  vnp_HashSecret: '4RMXXWH9GZAR4QPBVJN8OLADH87F8BQ8',
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_Api: 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
  vnp_ReturnUrl: 'http://localhost:3000/deposit/vnpay-return',
};

class DepositController {
  async deposit(req, res) {
    try {
      const { roomId, rentalTime, timeType, payment, price, boardingHouseId } =
        req.body;
      if (!roomId || !rentalTime || !timeType || !payment || !price) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      const existDeposit = await DepositRoom.findOne({
        accountId: req.user.userId,
        roomId,
      });

      if (existDeposit) {
        return res
          .status(400)
          .json({ message: 'You have already deposited for this room' });
      }

      let amount = rentalTime * price;

      if (timeType == 'year') {
        amount *= 12;
      }

      const orderInfo = `deposit-${req.user.userId}-${roomId}-${boardingHouseId}-${rentalTime}`;

      if (payment === 'vnpay') {
        createVNPayUrl(req, res, amount, orderInfo);
      } else if (payment === 'momo') {
        createMomoUrl(req, res, amount, orderInfo);
      }
    } catch (error) {
      console.error('Error depositing:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  async getDepositedRooms(req, res) {
    try {
      const { userId } = req.user;
      const deposits = await DepositRoom.find({ accountId: userId })
        .populate({
          path: 'roomId',
          populate: {
            path: 'boardingHouseId',
          },
        })
        .sort({ createdAt: -1 })
        .lean();
      const result = deposits.map((deposit) => {
        const { roomId } = deposit;
        const { boardingHouseId } = roomId;
        return {
          _id: deposit._id,
          name: boardingHouseId.name,
          roomNumber: roomId.roomNumber,
          amount: deposit.amount,
          status: deposit.status,
          startDate: moment(deposit.createdAt).format('DD/MM/YYYY'),
          endDate: moment(deposit.endDate).format('DD/MM/YYYY'),
          rentalTime: deposit.rentalTime,
        };
      });
      res.status(200).json(result);
    } catch (error) {
      console.error('Error getting deposited room:', error);
      res.status(500).json({ message: 'Server error', error });
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
          path: 'roomId',
          select: 'roomNumber images',
          populate: [
            {
              path: 'boardingHouseId',
              select: 'name',
              populate: { path: 'boardingHouseType', select: 'name' },
            },
            {
              path: 'rentBy',
              select: 'fullname avatarImage',
            },
            {
              path: 'roomTypeId',
              select: 'price roomSize',
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
      res.status(500).json({ message: 'Server error', error });
    }
  }

  async vnpayReturn(req, res) {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];
    const orderInfo = vnp_Params['vnp_OrderInfo'].split('-');
    const type = orderInfo[0];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = config.vnp_TmnCode;
    let secretKey = config.vnp_HashSecret;

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    if (secureHash === signed && vnp_Params['vnp_ResponseCode'] === '00') {
      if (type == 'deposit') {
        const accountId = orderInfo[1];
        const roomId = orderInfo[2];
        const boardingHouseId = orderInfo[3];
        const rentalTime = orderInfo[4];
        const amount = vnp_Params['vnp_Amount'] / 100;
        await DepositRoom.create({
          accountId,
          roomId,
          amount,
          rentalTime,
          endDate: moment().add(rentalTime, 'months').toDate(),
        });

        const redirectUrl = `${process.env.CLIENT_URL}/boarding-house/${boardingHouseId}?status=success`;
        return res.redirect(redirectUrl);
      }
      // pay rent
      const userId = orderInfo[1];
      const paymentBillId = orderInfo[2];

      const userPayment = await UserPayment.findOne({
        accountId: userId,
        status: { $regex: /^pending$/i },
        paymentBillId,
      });
      if (!userPayment) {
        throw new Error('Payment not found');
      }

      userPayment.status = 'Paid';
      userPayment.paymentMethod = 'VNPay';
      await userPayment.save();

      const allUserPayments = await UserPayment.find({
        paymentBillId,
      }).lean();

      const allPaid =
        allUserPayments.length > 0 &&
        allUserPayments.every(
          (payment) => payment.status.toLowerCase() === 'paid'
        );

      if (allPaid) {
        await PaymentBill.updateOne(
          { _id: paymentBillId },
          { $set: { status: 'Paid' } }
        );
      }

      const redirectUrl = `${process.env.CLIENT_URL}/my-deposited-room?status=success`;
      return res.redirect(redirectUrl);
    }
    //failed
    if (type == 'deposit') {
      const boardingHouseId = orderInfo.split('-')[3];
      const redirectUrl = `${process.env.CLIENT_URL}/boarding-house/${boardingHouseId}?status=fail`;
      return res.redirect(redirectUrl);
    }
    // pay rent
    const redirectUrl = `${process.env.CLIENT_URL}/my-deposited-room?status=fail`;
    res.redirect(redirectUrl);
  }

  async momoReturn(req, res) {
    try {
      const {
        orderId,
        amount,
        orderInfo,
        resultCode,
        message,
        transId,
        responseTime,
      } = req.query;

      const type = orderInfo[0];

      if (resultCode == '0') {
        if (type == 'deposit') {
          const accountId = orderInfo[1];
          const roomId = orderInfo[2];
          const boardingHouseId = orderInfo[3];
          const rentalTime = orderInfo[4];
          await DepositRoom.create({
            accountId,
            roomId,
            amount,
            rentalTime,
            endDate: moment().add(rentalTime, 'months').toDate(),
          });

          const redirectUrl = `${process.env.CLIENT_URL}/boarding-house/${boardingHouseId}?status=success`;
          return res.redirect(redirectUrl);
        }
        // pay rent
        const userId = orderInfo[1];
        const paymentBillId = orderInfo[2];

        const userPayment = await UserPayment.findOne({
          accountId: userId,
          status: { $regex: /^pending$/i },
          paymentBillId,
        });
        if (!userPayment) {
          throw new Error('Payment not found');
        }

        userPayment.status = 'Paid';
        userPayment.paymentMethod = 'Momo';
        await userPayment.save();

        const allUserPayments = await UserPayment.find({
          paymentBillId,
        }).lean();

        const allPaid =
          allUserPayments.length > 0 &&
          allUserPayments.every(
            (payment) => payment.status.toLowerCase() === 'paid'
          );

        if (allPaid) {
          await PaymentBill.updateOne(
            { _id: paymentBillId },
            { $set: { status: 'Paid' } }
          );
        }
        const redirectUrl = `${process.env.CLIENT_URL}/my-deposited-room?status=success`;
        return res.redirect(redirectUrl);
      }
      //failed
      if (type == 'deposit') {
        const boardingHouseId = orderInfo[3];
        const redirectUrl = `${process.env.CLIENT_URL}/boarding-house/${boardingHouseId}?status=fail`;
        return res.redirect(redirectUrl);
      }
      // pay rent
      const redirectUrl = `${process.env.CLIENT_URL}/my-deposited-room?status=fail`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.log('Error momo return:', error);
      if (type == 'deposit') {
        // const redirectUrl = `${process.env.CLIENT_URL}/boarding-house/${boardingHouseId}?status=fail`;
        // res.redirect(redirectUrl);
        return res.status(500).json({ message: 'Server error', error });
      }
      // pay rent
      const redirectUrl = `${process.env.CLIENT_URL}/my-deposited-room?status=fail`;
      res.redirect(redirectUrl);
    }
  }

  async payRent(req, res) {
    try {
      const { userId, depositRoomId, paymentMethod } = req.body;
      const deposit = await DepositRoom.findOne({
        _id: depositRoomId,
        accountId: userId,
      }).select('roomId');

      if (!deposit) {
        return res.status(400).json({ message: 'Deposit room not found' });
      }

      const userPayment = await UserPayment.findOne({
        accountId: userId,
        status: { $regex: /^pending$/i },
      })
        .populate({
          path: 'paymentBillId',
          match: { status: { $regex: /^pending$/i }, roomId: deposit.roomId },
        })
        .lean();

      if (!userPayment || !userPayment.paymentBillId) {
        return res.status(400).json({ message: 'Payment not found' });
      }

      const orderInfo = `payRent-${userId}-${userPayment.paymentBillId._id}`;
      if (paymentMethod === 'vnpay') {
        createVNPayUrl(req, res, userPayment.paymentAmount, orderInfo);
      } else if (paymentMethod == 'momo') {
        createMomoUrl(req, res, userPayment.paymentAmount, orderInfo);
      }
    } catch (error) {
      console.error('Error paying rent:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  async checkPayRentStatus(req, res) {
    try {
      const { depositRoomId } = req.params;

      if (!depositRoomId) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }

      const deposit = await DepositRoom.findOne({
        _id: depositRoomId,
        accountId: req.user.userId,
      }).select('roomId');

      if (!deposit) {
        return res.status(400).json({ message: 'Deposit room not found' });
      }

      const payment = await UserPayment.findOne({
        accountId: req.user.userId,
        status: { $regex: /^paid$/i },
      })
        .populate({
          path: 'paymentBillId',
          match: { roomId: deposit.roomId },
        })
        .lean();

      const isPaid = !!payment;

      return res.json({ isPaid });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }


  async getDepositByBhId(req, res) {
    try {
      const { boardingHouseId } = req.params;
      const { status, roomNumber, minAmount, maxAmount, rentalTime, startDate, endDate } = req.query;

      const rooms = await Room.find({ boardingHouseId }).select("_id roomNumber");
      const roomMap = new Map(rooms.map(room => [room._id.toString(), room.roomNumber]));

      let filter = { roomId: { $in: [...roomMap.keys()] } };

      if (status) filter.status = status;
      if (minAmount || maxAmount) filter.amount = { ...(minAmount && { $gte: minAmount }), ...(maxAmount && { $lte: maxAmount }) };
      if (rentalTime) filter.rentalTime = { $gte: Number(rentalTime) };
      if (startDate) filter.createdAt = { $gte: new Date(startDate) };
      if (endDate) filter.endDate = { $lte: new Date(endDate) };

      if (roomNumber) {
        const selectedRoomIds = [...roomMap.entries()]
          .filter(([id, num]) => roomNumber.split(",").includes(num.toString()))
          .map(([id]) => id);
        filter.roomId = { $in: selectedRoomIds };
      }

      const deposits = await DepositRoom.find(filter)
        .populate({ path: "accountId", select: "fullname" })
        .sort({ createdAt: -1 })
        .lean();

      const result = deposits.map(deposit => ({
        _id: deposit._id,
        name: deposit.accountId?.fullname || "Unknown",
        roomNumber: roomMap.get(deposit.roomId.toString()) || "N/A",
        amount: deposit.amount,
        status: deposit.status,
        startDate: moment(deposit.createdAt).format("DD/MM/YYYY"),
        endDate: moment(deposit.endDate).format("DD/MM/YYYY"),
        rentalTime: deposit.rentalTime,
      }));

      res.status(200).json(result);
    } catch (error) {
      console.error("Error getting deposits:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
  async getMaxDeposit(req, res) {
    try {
      const { boardingHouseId } = req.params;

      // Lấy danh sách các phòng thuộc boardingHouseId
      const rooms = await Room.find({ boardingHouseId }).select("_id");
      const roomIds = rooms.map(room => room._id);

      if (!roomIds.length) {
        return res.status(200).json(0);
      }

      const maxDeposit = await DepositRoom.findOne({ roomId: { $in: roomIds } })
        .sort({ amount: -1 }) // Sắp xếp giảm dần theo số tiền đặt cọc
        .select("amount"); // Chỉ lấy trường amount

      res.status(200).json(maxDeposit?.amount || 0);
    } catch (error) {
      console.error("Error getting max deposit:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }



}

const createVNPayUrl = async (req, res, amount, orderInfo) => {
  process.env.TZ = 'Asia/Ho_Chi_Minh';

  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss');

  let ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = config.vnp_TmnCode;
  let secretKey = config.vnp_HashSecret;
  let vnpUrl = config.vnp_Url;
  let returnUrl = config.vnp_ReturnUrl;
  let orderId = moment(date).format('DDHHmmss');
  // let amount = 100000;

  let locale = 'vn';
  let currCode = 'VND';
  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  //   vnp_Params["vnp_BankCode"] = "NCB";

  vnp_Params = sortObject(vnp_Params);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac('sha512', secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  res.status(200).json({ code: '00', payUrl: vnpUrl });
};

const createMomoUrl = async (req, res, amount, orderInfo) => {
  var accessKey = 'F8BBA842ECF85';
  var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
  var partnerCode = 'MOMO';
  var redirectUrl = 'http://localhost:3000/deposit/momo-return';
  var ipnUrl = 'http://localhost:3000/deposit/momo-return';
  var requestType = 'payWithMethod';
  var orderId = partnerCode + new Date().getTime();
  var requestId = orderId;
  var extraData = '';
  var paymentCode =
    'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
  var orderGroupId = '';
  var autoCapture = true;
  var lang = 'vi';

  var rawSignature =
    'accessKey=' +
    accessKey +
    '&amount=' +
    amount +
    '&extraData=' +
    extraData +
    '&ipnUrl=' +
    ipnUrl +
    '&orderId=' +
    orderId +
    '&orderInfo=' +
    orderInfo +
    '&partnerCode=' +
    partnerCode +
    '&redirectUrl=' +
    redirectUrl +
    '&requestId=' +
    requestId +
    '&requestType=' +
    requestType;
  //signature
  var signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: 'Test',
    storeId: 'MomoTestStore',
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
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody),
    },
    url: 'https://test-payment.momo.vn/v2/gateway/api/create',
    data: requestBody,
  };

  try {
    const response = await axios(options);
    return res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export default new DepositController();
