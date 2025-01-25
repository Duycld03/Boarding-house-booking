import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const ReportSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    images: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Add mongoose-delete plugin without 'deletedAt'
ReportSchema.plugin(mongooseDelete, {
  overrideMethods: 'all',
});

const Report = mongoose.model('Report', ReportSchema);
export default Report;
