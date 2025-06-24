import RoomAdditionalFees from "../models/roomAdditionalFees.js";
import paginate from "../utils/pagination.js";

class RoomAdditionFeeController {
    async createRoomAdditionFee(req, res) {
        try {
            const { roomId, feeName, feeAmount } = req.body;
            const newFee = new RoomAdditionalFees({ roomId, feeName, feeAmount });
            await newFee.save();
            res.status(201).json(newFee);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllRoomAdditionFees(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const fees = await RoomAdditionalFees.find()
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .populate("roomId", "roomNumber");
            const totalFees = await RoomAdditionalFees.countDocuments();
            const result = paginate(totalFees, page, limit);
            res.status(200).json(
                result
            );
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    //update room addition fee
    async updateRoomAdditionFee(req, res) {
        try {
            const { id } = req.params;
            const { feeName, feeAmount } = req.body;
            const updatedFee = await RoomAdditionalFees.findByIdAndUpdate(
                id,
                { feeName, feeAmount },
                { new: true }
            );
            if (!updatedFee) {
                return res.status(404).json({ message: "Fee not found" });
            }
            res.status(200).json(updatedFee);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    //Delete room addition fee
    async deleteRoomAdditionFee(req, res) {
        try {
            const { id } = req.params;
            const deletedFee = await RoomAdditionalFees.findByIdAndDelete(id);
            if (!deletedFee) {
                return res.status(404).json({ message: "Fee not found" });
            }
            res.status(200).json({ message: "Fee deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    //get room addition fee by roomId, month and year
    // get room addition fee by roomId, month and year from createdAt
    async getRoomAdditionFeesByRoomId(req, res) {
        try {
            const { roomId } = req.params;
            const { month, year } = req.query;

            // Validate month and year
            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(year, 10);

            const startDate = new Date(yearNum, monthNum - 1, 1); // Tháng trong JS là 0-11
            const endDate = new Date(yearNum, monthNum, 0); // Ngày 0 của tháng kế tiếp = ngày cuối cùng của tháng hiện tại
            endDate.setHours(23, 59, 59, 999); // Đặt giờ cuối ngày

            const fees = await RoomAdditionalFees.find({
                roomId,
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).populate("roomId", "roomNumber");

            if (fees.length === 0) {
                return res.status(404).json({
                    message: `No fees found for room ${roomId} in ${month}/${year}`
                });
            }

            res.status(200).json(fees);
        } catch (error) {
            console.error("Error getting room additional fees:", error);
            res.status(500).json({ message: error.message });
        }
    }
}

export default new RoomAdditionFeeController();
