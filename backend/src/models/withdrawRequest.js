import mongoose from "mongoose";

const BankDetailsSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  accountHolderName: {
    type: String,
    required: true,
  },
});

const WithdrawRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  transactionId: {
    type: String,
    required: true,
  },
  reasonForCancel: {
    type: String,
    required: true,
  },
  bankingAccount: BankDetailsSchema,
});

const WithdrawRequest = mongoose.model(
  "WithdrawRequest",
  WithdrawRequestSchema
);
export default WithdrawRequest;
