import ViewRoomRequest from "../models/viewRoomRequest.js"
import BoardingHouse from '../models/boardingHouse.js'
import Room from "../models/room.js";
import pagination from '../utils/pagination.js'

class AppointmentController {

    async getAppointmentByUserId(req, res) {
        try {
            const { userId } = req.user;

            if (!userId) {
                return res.status(403).json({ message: 'User not found' });
            }

            // Lấy các tham số pagination từ query
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Filter cơ bản chỉ theo userId
            const filter = { accountId: userId };

            // Đếm tổng số appointments của user
            const totalItems = await ViewRoomRequest.countDocuments(filter);

            if (totalItems === 0) {
                return res.status(404).json({
                    message: 'No appointments found for this user',
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalItems: 0,
                        limit,
                        hasNextPage: false,
                        hasPrevPage: false
                    },
                    data: []
                });
            }

            // Lấy danh sách appointments với pagination
            const appointmentList = await ViewRoomRequest.find(filter)
                .populate({
                    path: 'roomId',
                    populate: {
                        path: 'boardingHouseId',
                        populate: { path: 'ownerId' }
                    }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Cập nhật status và format dữ liệu
            const updatedAppointments = await Promise.all(
                appointmentList.map(async (appointment) => {
                    const appointmentDate = new Date(appointment.appointmentDate);
                    appointmentDate.setHours(0, 0, 0, 0);

                    // Cập nhật status nếu cần
                    if (appointmentDate < today &&
                        appointment.status !== "completed" &&
                        appointment.status !== "canceled") {
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

            // Tính toán pagination
            const totalPages = Math.ceil(totalItems / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            const pagination = {
                currentPage: page,
                totalPages,
                totalItems,
                limit,
                hasNextPage,
                hasPrevPage
            };

            return res.status(200).json({
                success: true,
                pagination,
                data: updatedAppointments
            });

        } catch (error) {
            console.error('Error in getAppointmentByUserId:', error);
            return res.status(500).json({
                success: false,
                message: 'There is something wrong!',
                error: error.message
            });
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