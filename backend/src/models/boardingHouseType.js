import mongoose from "mongoose";
import mongoose_delete from "mongoose-delete";

const boardingHouseTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Account",
    },
    roomSize: {
      type: String,
      required: true,
    },
    peopleNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

boardingHouseTypeSchema.plugin(mongoose_delete, { overrideMethods: true });

const BoardingHouseType = mongoose.model(
  "BoardingHouseType",
  boardingHouseTypeSchema
);

export default BoardingHouseType;
