import https from "https";
import moment from "moment";
import querystring from "qs";
import crypto from "crypto";
import axios from "axios";
import { sortObject } from "../utils/algorithms.js";
import DepositRoom from "../models/depositRoom.js";
import dotenv from "dotenv";
dotenv.config();

const config = {
  vnp_TmnCode: "1NH5FYBW",
  vnp_HashSecret: "4RMXXWH9GZAR4QPBVJN8OLADH87F8BQ8",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: "http://localhost:3000/deposit/vnpay-return",
};

class DepositController {
  async deposit(req, res) {
    try {
      const { roomId, rentalTime, timeType, payment, price, boardingHouseId } =
        req.body;
      if (!roomId || !rentalTime || !timeType || !payment || !price) {
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

      let amount = rentalTime * price;

      if (timeType == "year") {
        amount *= 12;
      }

      const data = {
        accountId: req.user.userId,
        roomId,
        amount,
        boardingHouseId,
        time: rentalTime,
      };

      if (payment === "vnpay") {
        createVNPayUrl(req, res, data);
        return;
      } else if (payment === "momo") {
        createMomoUrl(req, res, data);
        return;
      }
    } catch (error) {
      console.error("Error depositing:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }

  async vnpayReturn(req, res) {
    let vnp_Params = req.query;

    let secureHash = vnp_Params["vnp_SecureHash"];
    const orderInfo = vnp_Params["vnp_OrderInfo"];
    const accountId = orderInfo.split("-")[0];
    const roomId = orderInfo.split("-")[1];
    const boardingHouseId = orderInfo.split("-")[2];
    const time = orderInfo.split("-")[3];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = config.vnp_TmnCode;
    let secretKey = config.vnp_HashSecret;

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      if (vnp_Params["vnp_TransactionStatus"] === "00") {
        const amount = vnp_Params["vnp_Amount"] / 100;
        await DepositRoom.create({
          accountId,
          roomId,
          amount,
        });
        const redirectUrl = `${process.env.CLIENT_URL}/boarding-house/${boardingHouseId}?status=success`;
        res.redirect(redirectUrl);
      } else {
        const redirectUrl = `${process.env.CLIENT_URL}/boarding-house/${boardingHouseId}?status=fail`;
        res.redirect(redirectUrl);
      }
    } else {
      const redirectUrl = `${process.env.CLIENT_URL}/boarding-house/${boardingHouseId}?status=fail`;
      res.redirect(redirectUrl);
    }
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

      const accountId = orderInfo.split("-")[0];
      const roomId = orderInfo.split("-")[1];
      const boardingHouseId = orderInfo.split("-")[2];
      const time = orderInfo.split("-")[3];

      if (resultCode === "0") {
        await DepositRoom.create({
          accountId,
          roomId,
          amount,
        });
        const redirectUrl = `${process.env.CLIENT_URL}/boarding-house/${boardingHouseId}?status=success`;
        res.redirect(redirectUrl);
      } else {
        const redirectUrl = `${process.env.CLIENT_URL}/boarding-house/${boardingHouseId}?status=fail`;
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.log("Error momo return:", error);
      const redirectUrl = `${process.env.CLIENT_URL}/boarding-house/${boardingHouseId}?status=fail`;
      res.redirect(redirectUrl);
    }
  }
}
const createVNPayUrl = async (req, res, data) => {
  const { amount, accountId, roomId, boardingHouseId, time } = data;
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
  vnp_Params["vnp_OrderInfo"] =
    accountId + "-" + roomId + "-" + boardingHouseId + "-" + time;
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

const createMomoUrl = async (req, res, data) => {
  const { amount, accountId, roomId, boardingHouseId, time } = data;
  var accessKey = "F8BBA842ECF85";
  var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var orderInfo = accountId + "-" + roomId + "-" + boardingHouseId + "-" + time;
  var partnerCode = "MOMO";
  var redirectUrl = "http://localhost:3000/deposit/momo-return";
  var ipnUrl = "http://localhost:3000/deposit/momo-return";
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
