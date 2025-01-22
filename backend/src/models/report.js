import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      require: true,
    },
    reason: {
      type: String,
      require: true,
    },
    details: {
      type: String,
      require: true,
    },
    status: {
      type: String,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", ReportSchema);
export default Report;
