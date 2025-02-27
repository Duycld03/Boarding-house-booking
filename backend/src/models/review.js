import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const ReviewSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    boardingHouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BoardingHouse',
      required: true,
    },
    content: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      required: true,
    },
    images: [
      {
        imageUrl: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: "",
        },
      }
    ],
  },
  { timestamps: true }
);
ReviewSchema.plugin(mongooseDelete, {
  overrideMethods: 'all',
});

const Review = mongoose.model('Review', ReviewSchema);
export default Review;
