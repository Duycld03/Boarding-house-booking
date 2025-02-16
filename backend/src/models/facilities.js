import mongoose from "mongoose";
import mongoose_delete from "mongoose-delete";

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  { timestamps: true }
);

facilitySchema.plugin(mongoose_delete, {
  deletedBy: true,
  overrideMethods: true,
});

const Facility = mongoose.model("Facility", facilitySchema);

export default Facility;