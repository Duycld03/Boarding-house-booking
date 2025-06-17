import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const AvatarImageSchema = mongoose.Schema({
  publicId: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
});

const AccountSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
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
      unique: true,
    },
    role: {
      type: String,
      default: 'user',
    },
    socialId: {
      type: String,
    },
    avatarImage: AvatarImageSchema,
    accountBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      default: 'inactive',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
  },
  { timestamps: true }
);

AccountSchema.plugin(mongoose_delete, { overrideMethods: 'all' });

const Account = mongoose.model('Account', AccountSchema);
export default Account;
