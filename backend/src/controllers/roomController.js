import mongoose from "mongoose";
import Room from "../models/room.js";

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

  async addRoom(req, res) {
    try {
      const { roomNumber, boardingHouseId, description, roomTypeId } = req.body;

      if (!roomNumber || !boardingHouseId || !roomTypeId) {
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
  async updateRoom(req, res) {}
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
