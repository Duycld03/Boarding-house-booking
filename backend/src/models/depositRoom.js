import mongoose from "mongoose";

const DepositRoomSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
}, {
  timestamps: true
});

const DepositRoom = mongoose.model("DepositRoom", DepositRoomSchema);
export default DepositRoom;
