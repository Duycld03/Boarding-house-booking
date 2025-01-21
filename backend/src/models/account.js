import mongoose from "mongoose";
import mongoose_delete from "mongoose-delete";

const AccountSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 5,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: "user",
    },
    socialId: {
      type: String,
    },
    avatarImage: {
      type: String,
    },
    accountBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }
);

AccountSchema.plugin(mongoose_delete, { overrideMethods: true });

const Account = mongoose.model("Account", AccountSchema);
export default Account;
