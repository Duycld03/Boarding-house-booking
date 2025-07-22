import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/room.js";
import PaymentBill from "../models/paymentBill.js";
import paginate from "../utils/pagination.js";
import DepositRoom from "../models/depositRoom.js";
import BoardingHouse from "../models/boardingHouse.js";
import boardingHouseService from "../service/boardingHouseService.js";

class RoomController {
  async getRoomsByRoomType(req, res) {
    try {
      const { roomTypeId } = req.params;
      const { boardingHouseId } = req.query;

      if (!roomTypeId) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Get deposit room IDs with confirmed status
      const depositRoomIds = await DepositRoom.find({
        status: "confirmed",
      }).distinct("roomId");

      // Create filter with roomTypeId and exclude depositRoomIds
      const filter = {
        roomTypeId: new mongoose.Types.ObjectId(roomTypeId),
        isAvailable: true,
        _id: { $nin: depositRoomIds },
      };

      if (boardingHouseId) {
        filter.boardingHouseId = new mongoose.Types.ObjectId(boardingHouseId);
      }

      const availableRooms = await Room.find(filter);

      res.status(200).json(availableRooms);
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
        status: { $regex: /^paid$/i },
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
        boardingHouseId: new mongoose.Types.ObjectId(boardingHouseId),
      };

      const paginationOptions = {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100,
        sortField: "createdAt",
        sortOrder: "desc",
        filter,
        populate: [{ path: "roomTypeId" }, { path: "rentBy" }],
        includeTotalData: true,
      };

      // Gọi helper paginate
      const result = await paginate(Room, paginationOptions, req);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Backend API - Improved addRoom method
  async addRoom(req, res) {
    try {
      const roomData = req.body;
      const rooms = Array.isArray(roomData) ? roomData : [roomData];

      // Validate required fields for each room
      for (const room of rooms) {
        const { roomNumber, boardingHouseId, description, roomTypeId } = room;

        if (!roomNumber || !boardingHouseId || !roomTypeId || !description) {
          return res.status(400).json({
            message: "Missing required parameters",
            missingFields: {
              roomNumber: !roomNumber ? "required" : undefined,
              boardingHouseId: !boardingHouseId ? "required" : undefined,
              description: !description ? "required" : undefined,
              roomTypeId: !roomTypeId ? "required" : undefined,
            },
          });
        }
      }

      // Check for duplicate room numbers in the same boarding house
      const roomNumbers = rooms.map((room) => room.roomNumber);
      const duplicateCheck = await Room.find({
        boardingHouseId: rooms[0].boardingHouseId,
        roomNumber: { $in: roomNumbers },
      });

      if (duplicateCheck.length > 0) {
        const existingNumbers = duplicateCheck.map((room) => room.roomNumber);
        return res.status(400).json({
          message: "Some rooms already exist",
          duplicateRooms: existingNumbers,
        });
      }

      // Check for duplicates within the current batch
      const uniqueNumbers = new Set(roomNumbers);
      if (uniqueNumbers.size !== roomNumbers.length) {
        const duplicatesInBatch = roomNumbers.filter(
          (item, index) => roomNumbers.indexOf(item) !== index
        );
        return res.status(400).json({
          message: "Duplicate room numbers in the same request",
          duplicateRooms: [...new Set(duplicatesInBatch)],
        });
      }

      // Create room documents
      const roomDocs = rooms.map((room) => ({
        roomNumber: room.roomNumber,
        boardingHouseId: room.boardingHouseId,
        description: room.description,
        roomTypeId: room.roomTypeId,
        isAvailable: true,
        images: room.images || null,
      }));

      // Save all rooms
      const savedRooms = await Room.insertMany(roomDocs);

      // Lấy boarding house và thêm stats
      const boardingHouse = await BoardingHouse.findById(rooms[0].boardingHouseId);
      const boardingHouseWithStats = await boardingHouseService.addStatsToBoaringHouse(boardingHouse);

      // Trả về response tương ứng dựa trên số lượng phòng đã thêm
      if (savedRooms.length === 1) {
        res.status(201).json({
          message: "Room added successfully",
          room: savedRooms[0],
          boardingHouse: boardingHouseWithStats
        });
      } else {
        res.status(201).json({
          message: `${savedRooms.length} rooms added successfully`,
          rooms: savedRooms,
          count: savedRooms.length,
          boardingHouse: boardingHouseWithStats
        });
      }
    } catch (error) {
      console.error("Error adding room(s):", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Alternative: Create separate endpoint for bulk add
  async addRooms(req, res) {
    try {
      const { rooms } = req.body;

      if (!Array.isArray(rooms) || rooms.length === 0) {
        return res.status(400).json({ message: "Invalid rooms data" });
      }

      // Validate required fields for each room
      for (const room of rooms) {
        const { roomNumber, boardingHouseId, description, roomTypeId } = room;

        if (!roomNumber || !boardingHouseId || !roomTypeId || !description) {
          return res.status(400).json({
            message: "Missing required parameters in one or more rooms",
            missingFields: {
              roomNumber,
              boardingHouseId,
              description,
              roomTypeId,
            },
          });
        }
      }

      // Check for duplicate room numbers in the same boarding house
      const roomNumbers = rooms.map((room) => room.roomNumber);
      const duplicateCheck = await Room.find({
        boardingHouseId: rooms[0].boardingHouseId,
        roomNumber: { $in: roomNumbers },
      });

      if (duplicateCheck.length > 0) {
        const existingNumbers = duplicateCheck.map((room) => room.roomNumber);
        return res.status(400).json({
          message: "Some rooms already exist",
          duplicateRooms: existingNumbers,
        });
      }

      // Check for duplicates within the current batch
      const uniqueNumbers = new Set(roomNumbers);
      if (uniqueNumbers.size !== roomNumbers.length) {
        const duplicatesInBatch = roomNumbers.filter(
          (item, index) => roomNumbers.indexOf(item) !== index
        );
        return res.status(400).json({
          message: "Duplicate room numbers in the same request",
          duplicateRooms: [...new Set(duplicatesInBatch)],
        });
      }

      // Create room documents
      const roomDocs = rooms.map((room) => ({
        roomNumber: room.roomNumber,
        boardingHouseId: room.boardingHouseId,
        description: room.description,
        roomTypeId: room.roomTypeId,
        isAvailable: true,
        images: room.images || null,
      }));

      // Save all rooms
      const savedRooms = await Room.insertMany(roomDocs);

      res.status(201).json({
        message: `${savedRooms.length} rooms added successfully`,
        rooms: savedRooms,
        count: savedRooms.length,
      });
    } catch (error) {
      console.error("Error adding rooms:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  async updateRoom(req, res) {
    try {
      const { roomId } = req.params;
      const { roomNumber, boardingHouseId, description, roomTypeId, isAvailable } = req.body;

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

      // Cập nhật trạng thái phòng nếu được cung cấp
      if (isAvailable !== undefined) {
        room.isAvailable = isAvailable;
      }

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

      // Lấy boarding house và thêm stats mới sau khi cập nhật phòng
      const boardingHouse = await BoardingHouse.findById(boardingHouseId);
      const boardingHouseWithStats = await boardingHouseService.addStatsToBoaringHouse(boardingHouse);

      res.status(200).json({
        message: "Room updated successfully",
        room: room,
        boardingHouse: boardingHouseWithStats
      });
    } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }

  async deleteRoom(req, res) {
    try {
      const { roomId } = req.params;
      if (!roomId) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Lấy thông tin phòng trước khi xóa
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const boardingHouseId = room.boardingHouseId;

      // Xóa phòng
      await Room.findByIdAndDelete(roomId);

      // Lấy boarding house và thêm stats mới sau khi xóa phòng
      const boardingHouse = await BoardingHouse.findById(boardingHouseId);
      const boardingHouseWithStats = await boardingHouseService.addStatsToBoaringHouse(boardingHouse);

      res.status(200).json({
        message: "Room deleted successfully",
        boardingHouse: boardingHouseWithStats
      });
    } catch (error) {
      console.error("Error deleting room:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
}

export default new RoomController();
