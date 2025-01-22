import mongoose from "mongoose";
import mongoose_delete from "mongoose-delete";

const AddressSchema = new mongoose.Schema({
  province: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  ward: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    default: "",
  },
});

const ImagesSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
});

const BoardingHouseSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    priceRange: {
      type: Number,
      required: true,
      min: 0,
    },
    totalRooms: {
      type: Number,
      required: true,
      min: 0,
    },
    availableRooms: {
      type: Number,
      required: true,
      min: 0,
    },
    electricityPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    waterPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    boardingHouseType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BoardingHouseType",
      required: true,
    },
    address: AddressSchema,
    images: [ImagesSchema],
  },
  { timestamps: true }
);

BoardingHouseSchema.plugin(mongoose_delete, {
  deletedBy: true,
  overrideMethods: true,
});

const BoardingHouse = mongoose.model("BoardingHouse", BoardingHouseSchema);
export default BoardingHouse;
