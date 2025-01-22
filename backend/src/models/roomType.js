import mongoose from "mongoose";
const RoomTypeSchema = new mongoose.Schema({
  boardingHouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BoardingHouse",
    required: true,
  },
  typeName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageURL: {
    type: String,
  },
});

const RoomType = mongoose.model("RoomType", RoomTypeSchema);
export default RoomType;
