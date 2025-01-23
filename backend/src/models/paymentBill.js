import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
  oldNumber: {
    type: Number,
    required: true,
  },
  newNumber: {
    type: Number,
    required: true,
  },
  quantityConsumed: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

const paymentBillSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    paymentAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    additionalFee: {
      type: Number,
      default: 0,
    },
    electricalBill: BillSchema,
    waterBill: BillSchema,
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const PaymentBill = mongoose.model("PaymentBill", paymentBillSchema);

export default PaymentBill;
