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

// Middleware để tự động cập nhật status trước khi find/findOne
AppointmentSchema.pre(['find', 'findOne', 'findOneAndUpdate'], async function () {
  // Cập nhật tất cả appointments có status pending và appointmentDate đã qua
  await this.model.updateMany(
    {
      status: 'pending',
      appointmentDate: { $lt: new Date() }
    },
    {
      status: 'canceled'
    }
  );
});

// Static method để manually update expired appointments
AppointmentSchema.statics.updateExpiredAppointments = async function () {
  const result = await this.updateMany(
    {
      status: 'pending',
      appointmentDate: { $lt: new Date() }
    },
    {
      status: 'canceled'
    }
  );
  return result;
};

// Virtual field để check xem appointment có expired không
AppointmentSchema.virtual('isExpired').get(function () {
  return this.status === 'pending' && new Date() > this.appointmentDate;
});

const Appointment = mongoose.model("Appointment", AppointmentSchema);

export default Appointment;


import cron from 'node-cron';

cron.schedule('0 * * * *', async () => {
  try {
    const result = await Appointment.updateExpiredAppointments();
    console.log(`Updated ${result.modifiedCount} expired appointments`);
  } catch (error) {
    console.error('Error updating expired appointments:', error);
  }
});

export const updateExpiredAppointments = async () => {
  try {
    const result = await Appointment.updateExpiredAppointments();
    return {
      success: true,
      modifiedCount: result.modifiedCount
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const getAppointments = async (req, res) => {
  try {
    await Appointment.updateExpiredAppointments();

    const appointments = await Appointment.find()
      .populate('accountId')
      .populate('roomId');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAppointmentsWithUpdatedStatus = async (req, res) => {
  try {
    const appointments = await Appointment.aggregate([
      {
        $addFields: {
          status: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$status", "pending"] },
                  { $lt: ["$appointmentDate", new Date()] }
                ]
              },
              then: "canceled",
              else: "$status"
            }
          }
        }
      },
      {
        $lookup: {
          from: "accounts",
          localField: "accountId",
          foreignField: "_id",
          as: "account"
        }
      },
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "room"
        }
      }
    ]);

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};