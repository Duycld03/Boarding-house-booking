import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    boardingHouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BoardingHouse",
      required: true,
    },
    rentBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
      },
    ],
    roomNumber: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      required: true,
    },
    images: {
      imageUrl: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", RoomSchema);
export default Room;
