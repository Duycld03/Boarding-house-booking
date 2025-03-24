import mongoose from 'mongoose';

const refundRequestSchema = new mongoose.Schema(
  {
    depositRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DepositRoom',
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    amountRefunded: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      default: 'pending',
    },
    reason: {
      type: String,
      required: true,
    },
    reasonForCancel: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const RefundRequest = mongoose.model('RefundRequest', refundRequestSchema);
export default RefundRequest;
