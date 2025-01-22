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
    required: true,
  },
});

const ImagesSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  isPrimary: {
    type: Boolean,
    required: true,
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
      required: true,
    },
    facilities: [
      {
        type: String,
        required: true,
      },
    ],
    priceRange: {
      type: String,
      required: true,
    },

    totalRooms: {
      type: Number,
      required: true,
    },
    availableRooms: {
      type: Number,
      required: true,
    },
    electricityPrice: {
      type: Number,
      required: true,
    },
    waterPrice: {
      type: Number,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
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
