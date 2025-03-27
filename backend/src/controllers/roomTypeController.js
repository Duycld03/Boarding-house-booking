import RoomType from "../models/roomType.js";
import Room from "../models/room.js";
import mongoose from "mongoose";


class RoomTypeController {

    async getRoomTypeByBhId(req, res, next) {
        try {
            const { id } = req.params;

            const bhRoomType = await RoomType.find({ boardingHouseId: id })
                .populate("facilities")
                .populate("boardingHouseId");

            if (!bhRoomType.length) {
                return res.status(404).json({ message: "No room types found" });
            }

            const roomCounts = await Room.aggregate([
                {
                    $match: {
                        boardingHouseId: new mongoose.Types.ObjectId(id),
                        isAvailable: true,
                    },
                },
                { $group: { _id: "$roomTypeId", count: { $sum: 1 } } },
            ]);

            const roomCountMap = roomCounts.reduce((acc, cur) => {
                acc[cur._id.toString()] = cur.count;
                return acc;
            }, {});

            const roomTypesWithAvailableCount = bhRoomType.map((roomType) => ({
                ...roomType.toObject(),
                availableRoom: roomCountMap[roomType._id.toString()] || 0,
            }));

            res.status(200).json({
                data: roomTypesWithAvailableCount,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new RoomTypeController();