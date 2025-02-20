import ViewRoomRequest from "../models/viewRoomRequest.js"
import BoardingHouse from '../models/boardingHouse.js'
import Room from "../models/room.js";


class AppointmentController {
    async getAppointmentByUserId(req, res) {
        try {
            const { userId } = req.user;


            if (!userId) {
                return res.status(403).json({ message: 'User not found' });
            }


            const appointmentList = await ViewRoomRequest.find({ accountId: userId }).populate({
                path: 'roomId',
                populate: {
                    path: 'boardingHouseId',
                    populate: { path: 'ownerId' }
                }
            }).lean();


            if (appointmentList.length === 0) {
                return res.status(404).json({ message: 'No appointments found for this user' });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);



            const updatedAppointments = await Promise.all(
                appointmentList.map(async (appointment) => {
                    const appointmentDate = new Date(appointment.appointmentDate);
                    appointmentDate.setHours(0, 0, 0, 0);

                    if (appointmentDate < today && appointment.status !== "completed") {
                        await ViewRoomRequest.findByIdAndUpdate(appointment._id, { status: "completed" });
                        appointment.status = "completed";
                    }

                    return {
                        _id: appointment._id,
                        ownerName: appointment.roomId?.boardingHouseId?.ownerId?.fullname || null,
                        boardingHouseName: appointment.roomId?.boardingHouseId?.name || null,
                        roomNumber: appointment.roomId?.roomNumber || null,
                        appointmentDate: appointment?.appointmentDate,
                        status: appointment?.status,
                        note: appointment?.note,
                        roomId: appointment?.roomId?._id,
                    };
                })
            );

            return res.status(200).json(updatedAppointments);
        } catch (error) {
            return res.status(500).json({ message: 'There is something wrong!', error: error.message });
        }
    }


    async updateAppointmentStatus(req, res) {
        try {
            const { id } = req.params;

            console.log(req.params);

            const { status } = req.body;

            const validStatuses = ["pending", "confirmed", "canceled", "completed"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: "Invalid status value" });
            }

            const updatedAppointment = await ViewRoomRequest.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );

            if (!updatedAppointment) {
                return res.status(404).json({ message: "Appointment not found" });
            }

            res.status(200).json({ message: "Appointment status updated", updatedAppointment });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async getAppointmentsByOwnerId(req, res) {
        try {
            const { ownerId } = req.params;

            if (!ownerId) {
                return res.status(400).json({ message: "Missing ownerId parameter" });
            }

            const boardingHouses = await BoardingHouse.find({ ownerId }).select("_id");

            if (!boardingHouses.length) {
                return res.status(404).json({ message: "No boarding houses found for this owner" });
            }

            const rooms = await Room.find({
                boardingHouseId: { $in: boardingHouses.map((bh) => bh._id) },
            }).select("_id");

            if (!rooms.length) {
                return res.status(404).json({ message: "No rooms found for this owner" });
            }

            const appointments = await ViewRoomRequest.find({
                roomId: { $in: rooms.map((room) => room._id) },
                status: "confirmed",
            }).populate("roomId", "roomNumber");

            res.status(200).json(appointments);
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
    async createAppointment(req, res) {
        try {
            const { roomId, appointmentDate, note } = req.body;
            const userId = req.user.userId;

            const bookingRequest = new ViewRoomRequest({
                accountId: userId,
                roomId,
                appointmentDate,
                note,
                status: "pending",
            });

            await bookingRequest.save();

            res.status(200).json(bookingRequest);
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error });
        }
    }




}

export default new AppointmentController()