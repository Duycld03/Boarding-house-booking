import mongoose from "mongoose";

const extensionRequestSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Account",
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Room",
    },
    currentEndDate: {
      type: Date,
      required: true,
    },
    requestedEndDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Approved", "Rejected"],
    },
    ownerNote: {
      type: String,
      default: "",
    },
    tenantNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const ExtensionRequest = mongoose.model(
  "ExtensionRequest",
  extensionRequestSchema
);

export default ExtensionRequest;
