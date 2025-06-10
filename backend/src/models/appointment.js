import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    note: {
      type: String,
      default: ""
    },
    appointmentDate: {
      type: Date,
      required: true
    }

  },
  { timestamps: true }
);

const ViewRoomRequest = mongoose.model(
  "Appointment",
  AppointmentSchema
);
export default ViewRoomRequest;
