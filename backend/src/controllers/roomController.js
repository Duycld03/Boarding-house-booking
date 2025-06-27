import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/room.js";
import PaymentBill from "../models/paymentBill.js";
import paginate from "../utils/pagination.js";


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
      })
        .populate("roomTypeId")
        .sort({ roomNumber: 1 });

      //   const roomNumbers = unpaidRooms.map((room) => room.roomNumber);

      return res.status(200).json(unpaidRooms);
    } catch (error) {
      console.error("Error fetching unpaid rooms:", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server", error });
    }
  }

  async getRoomsByBoardingHouse(req, res) {
    try {
      const { boardingHouseId } = req.params;


      const filter = {
        boardingHouseId: new mongoose.Types.ObjectId(boardingHouseId)
      };

      const paginationOptions = {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100,
        sortField: 'createdAt',
        sortOrder: 'desc',
        filter,
        populate: [
          { path: 'roomTypeId' },
          { path: 'rentBy' }
        ],
        includeTotalData: true
      };

      // Gọi helper paginate
      const result = await paginate(Room, paginationOptions, req);

      return res.status(200).json(result);

    } catch (error) {
      console.error("Error fetching rooms:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  }

  async addRoom(req, res) {
    try {
      const { roomNumber, boardingHouseId, description, roomTypeId } = req.body;

      if (!roomNumber || !boardingHouseId || !roomTypeId || !description) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const existingRoom = await Room.findOne({
        roomNumber,
        boardingHouseId,
      });

      if (existingRoom) {
        return res.status(400).json({ message: "Room already exists" });
      }

      const room = new Room({
        roomNumber,
        boardingHouseId,
        description,
        roomTypeId,
        isAvailable: true,
      });

      if (req.file) {
        room.images = {
          imageUrl: req.file.path,
          publicId: req.file.filename,
        };
      }

      await room.save();
      res.status(201).json({ message: "Room added successfully" });
    } catch (error) {
      console.error("Error adding room:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
  async updateRoom(req, res) {
    try {
      const { roomId } = req.params;
      const { roomNumber, boardingHouseId, description, roomTypeId } = req.body;

      if (!roomNumber || !boardingHouseId || !roomTypeId || !description) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(400).json({ message: "Room not found" });
      }

      if (room.roomNumber != roomNumber) {
        const existingRoom = await Room.findOne({
          roomNumber,
          boardingHouseId,
        });

        if (existingRoom) {
          return res.status(400).json({ message: "Room already exists" });
        }
        room.roomNumber = roomNumber;
      }

      room.description = description;
      room.roomTypeId = roomTypeId;
      // room.isAvailable = true;
      // room.boardingHouseId = boardingHouseId;

      if (req.file) {
        if (room?.images?.publicId) {
          await cloudinary.uploader.destroy(room.images.publicId);
        }

        room.images = {
          imageUrl: req.file.path,
          publicId: req.file.filename,
        };
      }

      await room.save();
      res.status(201).json({ message: "Room added successfully" });
    } catch (error) {
      console.error("Error adding room:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
  async deleteRoom(req, res) {
    try {
      const { roomId } = req.params;
      if (!roomId) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      await Room.findByIdAndDelete(roomId);
      res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
      console.error("Error deleting room:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
}

export default new RoomController();
