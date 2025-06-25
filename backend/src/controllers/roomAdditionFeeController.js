import RoomAdditionalFees from "../models/roomAdditionalFees.js";
import paginate from "../utils/pagination.js";

class RoomAdditionFeeController {
    async createRoomAdditionFee(req, res) {
        try {
            const { roomId, feeName, feeAmount, month, year } = req.body;
            const newFee = new RoomAdditionalFees({ roomId, feeName, feeAmount, month, year });
            await newFee.save();
            res.status(201).json(newFee);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllRoomAdditionFees(req, res) {
        try {
            const additionFee = await RoomAdditionalFees.find()
            res.status(200).json(additionFee);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    //update room addition fee
    async updateRoomAdditionFee(req, res) {
        try {
            const { id } = req.params;
            const { feeName, feeAmount, month, year } = req.body;
            const updatedFee = await RoomAdditionalFees.findByIdAndUpdate(
                id,
                { feeName, feeAmount, month, year },
                { new: true }
            );
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


    async getRoomAdditionFeesByRoomId(req, res) {
        try {
            const { roomId } = req.params;
            const { month, year } = req.query;

            let dateFilter = {};
            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(year, 10);


            dateFilter = {
                month: monthNum || undefined,
                year: yearNum || undefined,
            };
            // Cấu hình phân trang
            const paginationOptions = {
                defaultPage: 1,
                defaultLimit: 10,
                filter: {
                    roomId,
                    ...dateFilter
                },
                populate: [
                    {
                        path: 'roomId',
                        select: 'roomNumber'
                    }
                ],
                sortField: 'createdAt',
                allowQueryFilters: ['feeName'], // Cho phép filter theo tên phí
                fields: req.query.fields // Cho phép select fields
            };

            // Sử dụng hàm paginate
            const result = await paginate(RoomAdditionalFees, paginationOptions, req);

            // Kiểm tra nếu không có dữ liệu
            if (result.data.length === 0 && result.pagination.currentPage === 1) {
                const monthYearText = month && year ? ` in ${month}/${year}` : '';
                return res.status(404).json({
                    success: false,
                    message: `No fees found for room ${roomId}${monthYearText}`,
                    pagination: result.pagination,
                    data: []
                });
            }

            res.status(200).json(result);

        } catch (error) {
            console.error("Error getting room additional fees:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new RoomAdditionFeeController();
