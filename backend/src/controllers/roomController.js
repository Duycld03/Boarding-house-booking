import mongoose from "mongoose";
import Room from "../models/room.js";
import PaymentBill from "../models/paymentBill.js";

class RoomController {
  async getRoomsByRoomType(req, res) {
    try {
      const { roomTypeId } = req.params;
      const { boardingHouseId } = req.query;

      if (!roomTypeId) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const filter = {
        roomTypeId: new mongoose.Types.ObjectId(roomTypeId),
        isAvailable: true,
      };

      if (boardingHouseId) {
        filter.boardingHouseId = new mongoose.Types.ObjectId(boardingHouseId);
      }

      const rooms = await Room.find(filter);

      res.status(200).json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }

  async getRoomsByBoardingHouse(req, res) {
    try {
      const { boardingHouseId } = req.params;

      if (!boardingHouseId) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const rooms = await Room.find({
        boardingHouseId: new mongoose.Types.ObjectId(boardingHouseId),
      })
        .populate("roomTypeId")
        .populate("rentBy")
        .sort({ createdAt: -1 });

      res.status(200).json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }

  async getUnpaidRoomsByBoardingHouse(req, res) {
    try {
      const { boardingHouseId } = req.params;

      if (!boardingHouseId) {
        return res.status(400).json({ message: "boardingHouseId là bắt buộc" });
      }

      // Lấy thời gian tháng trước
      const now = new Date();
      const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
      const lastYear =
        now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

      // Lấy danh sách roomId đã thanh toán trong tháng trước thuộc boardingHouseId
      const paidRooms = await PaymentBill.find({
        month: lastMonth.toString(),
        year: lastYear.toString(),
        status: { $regex: "paid", $options: "i" },
      }).distinct("roomId");

      // Lọc danh sách phòng chưa thanh toán theo boardingHouseId
      const unpaidRooms = await Room.find({
        _id: { $nin: paidRooms },
        boardingHouseId: boardingHouseId,
      }).sort({ roomNumber: 1 });

      //   const roomNumbers = unpaidRooms.map((room) => room.roomNumber);

      return res.status(200).json(unpaidRooms);
    } catch (error) {
      console.error("Error fetching unpaid rooms:", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server", error });
    }
  }
}

export default new RoomController();
