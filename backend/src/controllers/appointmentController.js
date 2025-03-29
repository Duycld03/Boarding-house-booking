import ViewRoomRequest from "../models/viewRoomRequest.js"
import BoardingHouse from '../models/boardingHouse.js'
import Room from "../models/room.js";
import mongoose from "mongoose";


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
            }).sort({ createdAt: -1 }).lean()


            if (appointmentList.length === 0) {
                return res.status(404).json({ message: 'No appointments found for this user' });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);



            const updatedAppointments = await Promise.all(
                appointmentList.map(async (appointment) => {
                    const appointmentDate = new Date(appointment.appointmentDate);
                    appointmentDate.setHours(0, 0, 0, 0);

                    if (appointmentDate < today && appointment.status !== "completed" && appointment.status !== "canceled") {
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


    async getAppointmentsByBoardingHouseId(req, res) {
        try {
            const { boardingHouseId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(boardingHouseId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid boardingHouseId format. It must be a 24-character hex string.",
                });
            }
            const rooms = await Room.find({ boardingHouseId }).select("_id");

            if (!rooms.length) {
                return res.status(404).json({ success: false, message: "No rooms found for this boarding house" });
            }
            const appointments = await ViewRoomRequest.find({
                roomId: { $in: rooms.map(room => room._id) }
            })
                .populate({
                    path: "accountId",
                    select: "fullname email",
                })
                .populate({
                    path: "roomId",
                    select: "roomNumber",
                })
                .sort({ appointmentDate: -1 })
                .lean();

            res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments,
            });
        } catch (error) {
            console.error("Error fetching viewing appointments:", error);
            res.status(500).json({ success: false, message: "Server error", error: error.message });
        }
    }

    async getAppointmentDetailForOwner(req, res) {
        try {
            const { appointmentId } = req.params;
            const { userId } = req.user;

            const appointment = await ViewRoomRequest.findById(appointmentId)
                .populate({
                    path: "roomId",
                    populate: {
                        path: "boardingHouseId",
                        populate: { path: "ownerId", select: "fullname email" }
                    }
                })
                .populate({ path: "accountId", select: "fullname email phoneNumber avatarImage" })
                .lean();

            if (!appointment) {
                return res.status(404).json({ message: "Appointment not found" });
            }

            if (!appointment.roomId) {
                return res.status(404).json({ message: "Room not found for this appointment" });
            }

            const ownerId = appointment.roomId?.boardingHouseId?.ownerId?._id.toString();
            if (ownerId !== userId) {
                return res.status(403).json({ message: "You do not have permission to view this appointment" });
            }

            return res.status(200).json({
                _id: appointment._id,
                tenant: {
                    avatarImage: appointment.accountId?.avatarImage || null,
                    fullName: appointment.accountId?.fullname || "Unknown",
                    email: appointment.accountId?.email || "Unknown",
                    phoneNumber: appointment.accountId?.phoneNumber || "Unknown",
                },
                room: {
                    id: appointment.roomId?._id,
                    number: appointment.roomId?.roomNumber || "Unknown",
                },
                appointmentDate: appointment.appointmentDate,
                status: appointment.status,
                reasonForCancel: appointment.reasonForCancel || null,
                userNote: appointment.note || "",
                createdAt: appointment.createdAt,
            });

        } catch (error) {
            console.error("Error fetching appointment details:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async acceptViewingRequest(req, res) {
        try {
            const { appointmentId } = req.params;

            const request = await ViewRoomRequest.findById(appointmentId)
                .populate({
                    path: "roomId",
                    populate: {
                        path: "boardingHouseId",
                        populate: { path: "ownerId", select: "fullname email" }
                    }
                })
                .populate({ path: "accountId", select: "fullname email phoneNumber avatarImage" });

            if (!request) {
                return res.status(404).json({ message: "Viewing request not found" });
            }

            if (request.status !== "pending") {
                return res.status(400).json({ message: "Only pending requests can be accepted" });
            }

            // Tính khoảng thời gian trùng (30 phút trước và sau)
            const startTime = new Date(request.appointmentDate.getTime() - 30 * 60000);
            const endTime = new Date(request.appointmentDate.getTime() + 30 * 60000);

            // Tìm các yêu cầu khác trùng thời gian và chưa bị từ chối
            const overlappingRequests = await ViewRoomRequest.find({
                _id: { $ne: request._id },
                roomId: request.roomId._id,
                status: { $in: ["pending", "accept"] },
                appointmentDate: {
                    $gte: startTime,
                    $lte: endTime,
                },
            });

            // Nếu đã có một cái đã được accept => không cho accept nữa
            const alreadyAccepted = overlappingRequests.find(r => r.status === "accept");
            if (alreadyAccepted) {
                return res.status(400).json({
                    message: `A viewing request has already been accepted for this time slot.`,
                });
            }

            // Chấp nhận lịch hẹn này
            request.status = "accepted";
            await request.save();

            // Lọc các yêu cầu bị trùng ngày + giờ => reject
            const targetDate = request.appointmentDate.toISOString().split("T")[0];
            const toReject = overlappingRequests.filter(r => {
                const dateStr = r.appointmentDate.toISOString().split("T")[0];
                return dateStr === targetDate;
            });

            const rejectIds = toReject.map(r => r._id);
            if (rejectIds.length > 0) {
                await ViewRoomRequest.updateMany(
                    { _id: { $in: rejectIds } },
                    {
                        status: "reject",
                        reasonForCancel: "This time slot has already been booked by another tenant.",
                    }
                );
            }

            res.status(200).json({ message: "Viewing request accepted successfully", request });
        } catch (error) {
            console.error("Error accepting viewing request:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async rejectViewingRequest(req, res) {
        try {
            const { appointmentId } = req.params;
            const { reason } = req.body;
            const userId = req.user?.userId;

            const request = await ViewRoomRequest.findById(appointmentId)
                .populate({
                    path: "roomId",
                    populate: {
                        path: "boardingHouseId",
                        populate: { path: "ownerId", select: "fullname email" }
                    }
                });

            if (!request) {
                return res.status(404).json({ message: "Viewing request not found" });
            }

            const ownerId = request.roomId?.boardingHouseId?.ownerId?._id.toString();
            if (ownerId !== userId) {
                return res.status(403).json({ message: "You do not have permission to reject this appointment" });
            }

            if (request.status !== "pending") {
                return res.status(400).json({ message: "Only pending requests can be rejected" });
            }

            request.status = "rejected";
            request.reasonForCancel = reason || "Rejected by owner";
            await request.save();

            res.status(200).json({ message: "Viewing request rejected successfully", request });
        } catch (error) {
            console.error("Error rejecting viewing request:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

export default new AppointmentController()