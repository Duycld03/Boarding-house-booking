import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    boardingHouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BoardingHouse",
      required: true,
    },
  },
  { timestamps: true }
);

const Favorite = mongoose.model("Favorite", FavoriteSchema);
export default Favorite;
