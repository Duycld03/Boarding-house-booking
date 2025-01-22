import mongoose from "mongoose";
const PaymentBillSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    payBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    paymentAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PaymentBill = mongoose.model("PaymentBill", PaymentBillSchema);
export default PaymentBill;
