import facilities from "../models/facilities.js";

class FacilitiesController {
    async getAllFacilities(req, res) {
        try {
            const data = await facilities.find({}).sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error });
        }
    }

    async deleteFacilities(req, res) {
        try {
            const { id } = req.params;
            const facility = await facilities.findByIdAndDelete(id);
            if (!facility) {
                return res.status(404).json({ success: false, message: "Facility không tồn tại" });
            }
            res.status(200).json({ success: true, message: "Xóa thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server", error });
        }
    }

    async addFacilities(req, res) {
        try {
            const { name, description } = req.body;

            // Check if facility name already exists
            const existingFacility = await facilities.findOne({ name });
            if (existingFacility) {
                return res.status(400).json({ success: false, message: "Facility name already exists" });
            }

            // Create new facility
            const newFacility = new facilities({ name, description });
            await newFacility.save();

            res.status(201).json({ success: true, data: newFacility });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server error", error });
        }
    }


    async updateFacilities(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            // Check if another facility with the same name already exists
            const existingFacility = await facilities.findOne({ name, _id: { $ne: id } });
            if (existingFacility) {
                return res.status(400).json({ success: false, message: "Facility name already exists" });
            }

            // Proceed with the update
            const updatedFacility = await facilities.findByIdAndUpdate(id, req.body, { new: true });
            if (!updatedFacility) {
                return res.status(404).json({ success: false, message: "Facility not found" });
            }

            res.status(200).json({ success: true, data: updatedFacility });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server error", error });
        }
    }


    async filterFacilities(req, res) {
        try {
            const { search, startDate, endDate } = req.query;
            let filter = {};

            // Lọc theo khoảng thời gian
            if (startDate && endDate) {
                const start = new Date(startDate);
                start.setUTCHours(0, 0, 0, 0);

                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);

                filter.createdAt = {
                    $gte: start,
                    $lte: end,
                };
            }

            // Lấy danh sách theo bộ lọc ban đầu
            let facilitiesList = await facilities.find(filter).sort({ createdAt: -1 });

            // Lọc theo tên nếu có search
            if (search && search.trim() !== "") {
                facilitiesList = facilitiesList.filter((facility) =>
                    facility.name.toLowerCase().includes(search.toLowerCase())
                );
            }

            res.status(200).json({ success: true, data: facilitiesList });
        } catch (error) {
            console.error("Error filtering facilities:", error);
            res.status(500).json({ success: false, message: "Lỗi server", error });
        }
    }



}

export default new FacilitiesController();
