import ExtensionRequest from '../models/extensionRequest.js';

class renewalController {
    async getExtensionRequests(req, res) {
        const accountId = req.user.userId;
        try {
            const extensionRequests = await ExtensionRequest.find({ accountId })
                .populate({
                    path: "roomId",
                    select: "roomNumber boardingHouseId",
                    populate: {
                        path: "boardingHouseId",
                    }
                }).sort({ createdAt: -1 });

            res.json(extensionRequests);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createExtensionRequest(req, res) {
        try {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({ message: "Unauthorized: No user data" });
            }

            const accountId = req.user.userId;
            const { roomId, depositRoomId, currentEndDate, requestedEndDate, tenantNote } = req.body;

            // Kiểm tra thiếu trường dữ liệu
            if (!roomId || !depositRoomId || !requestedEndDate) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            // Tạo yêu cầu gia hạn
            const extensionRequest = await ExtensionRequest.create({
                accountId,
                roomId,
                depositRoomId,
                currentEndDate,
                requestedEndDate,
                tenantNote,
                status: "Pending",
            });

            res.json(extensionRequest);
        } catch (error) {
            console.error("Error creating extension request:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }

    async updateExtensionRequest(req, res) {
        try {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({ message: "Unauthorized: No user data" });
            }

            const { requestId } = req.params;
            const { requestedEndDate, tenantNote } = req.body;

            // Kiểm tra nếu requestId không được cung cấp
            if (!requestId) {
                return res.status(400).json({ message: "Missing requestId parameter" });
            }

            // Tìm yêu cầu gia hạn theo ID
            const extensionRequest = await ExtensionRequest.findById(requestId);
            if (!extensionRequest) {
                return res.status(404).json({ message: "Extension request not found" });
            }

            // Cập nhật thông tin mới
            extensionRequest.requestedEndDate = requestedEndDate || extensionRequest.requestedEndDate;
            extensionRequest.tenantNote = tenantNote || extensionRequest.tenantNote;
            extensionRequest.updatedAt = new Date(); // Ghi nhận thời gian cập nhật

            // Lưu thay đổi
            await extensionRequest.save();

            res.json({ message: "Extension request updated successfully", extensionRequest });
        } catch (error) {
            console.error("Error updating extension request:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }




}
export default new renewalController();