import Appointment from "../models/appointment.js"
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
            const totalItems = await Appointment.countDocuments(filter);

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
            const appointmentList = await Appointment.find(filter)
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

                    return {
                        _id: appointment._id,
                        ownerName: appointment.roomId?.boardingHouseId?.ownerId?.fullname || null,
                        boardingHouseName: appointment.roomId?.boardingHouseId?.name || null,
                        roomNumber: appointment.roomId?.roomNumber || null,
                        appointmentDate: appointment?.appointmentDate,
                        status: appointment?.status,
                        note: appointment?.note,
                        roomId: appointment?.roomId?._id,
                        reasonForCancel: appointment?.reasonForCancel || null
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

            const { status } = req.body;

            const validStatuses = ["pending", "confirmed", "rejected", "completed"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: "Invalid status value" });
            }

            const updatedAppointment = await Appointment.findByIdAndUpdate(
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

            // Pagination setup
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Tìm các boarding house của owner
            const boardingHouses = await BoardingHouse.find({ ownerId }).select("_id name");

            if (!boardingHouses.length) {
                return res.status(404).json({ message: "No boarding houses found for this owner" });
            }

            // const rooms = await Room.find({
            //     boardingHouseId: { $in: boardingHouses.map((bh) => bh._id) },
            // }).select("_id");
            const bhMap = {};
            const bhIds = boardingHouses.map(bh => {
                bhMap[bh._id.toString()] = bh.name;
                return bh._id;
            });

            // Tìm các phòng của owner
            const rooms = await Room.find({ boardingHouseId: { $in: bhIds } }).select("_id roomNumber boardingHouseId");
            if (!rooms.length) {
                return res.status(404).json({ message: "No rooms found for this owner" });
            }
            const roomMap = {};
            const roomIds = rooms.map(room => {
                roomMap[room._id.toString()] = {
                    roomNumber: room.roomNumber,
                    boardingHouseId: room.boardingHouseId,
                };
                return room._id;
            });

            // Lấy lịch hẹn kèm user
            const totalItems = await Appointment.countDocuments({
                roomId: { $in: roomIds },
            });
            const appointments = await Appointment.find({
                roomId: { $in: roomIds },
            })
                .populate({ path: "accountId", select: "fullname" })
                .sort({ appointmentDate: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const result = appointments.map(item => {
                const roomInfo = roomMap[item.roomId.toString()];
                return {
                    _id: item._id,
                    tenantName: item.accountId?.fullname || "Unknown",
                    roomNumber: roomInfo?.roomNumber || "N/A",
                    boardingHouseName: bhMap[roomInfo?.boardingHouseId.toString()] || "N/A",
                    appointmentDate: item.appointmentDate,
                    note: item.note || "",
                    status: item.status,
                };
            });

            const totalPages = Math.ceil(totalItems / limit);



            return res.status(200).json({
                success: true,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
                data: result,
            });
        } catch (error) {
            console.error("Error fetching owner appointments:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async createAppointment(req, res) {
        try {
            const { roomId, appointmentDate, note } = req.body;
            const userId = req.user.userId;

            const bookingRequest = new Appointment({
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
            const appointments = await Appointment.find({
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

            const appointment = await Appointment.findById(appointmentId)
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

            const request = await Appointment.findById(appointmentId)
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
            const overlappingRequests = await Appointment.find({
                _id: { $ne: request._id },
                roomId: request.roomId._id,
                status: { $in: ["pending", "accepted"] },
                appointmentDate: {
                    $gte: startTime,
                    $lte: endTime,
                },
            });

            // Nếu đã có một cái đã được accept => không cho accept nữa
            const alreadyAccepted = overlappingRequests.find(r => r.status === "accepted");
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
                await Appointment.updateMany(
                    { _id: { $in: rejectIds } },
                    {
                        status: "rejected",
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

            const request = await Appointment.findById(appointmentId)
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