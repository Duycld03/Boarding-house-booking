const mongoose = require('mongoose');

const electricalBillSchema = new mongoose.Schema({
  oldNumber: {
    type: Number,
    required: true
  },
  newNumber: {
    type: Number,
    required: true
  },
  quantityConsumed: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  }
});

const waterBillSchema = new mongoose.Schema({
  oldNumber: {
    type: Number,
    required: true
  },
  newNumber: {
    type: Number,
    required: true
  },
  quantityConsumed: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  }
});


const paymentBillSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  additionalFee: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  electricalBill: electricalBillSchema,
  waterBill: waterBillSchema
});

const PaymentBill = mongoose.model('PaymentBill', paymentBillSchema);

module.exports = PaymentBill;

