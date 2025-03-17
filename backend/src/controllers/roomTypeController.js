import RoomType from '../models/roomType.js';
import Room from '../models/room.js';
import { v2 as cloudinary } from 'cloudinary';
import BoardingHouse from '../models/boardingHouse.js';
import facilities from '../models/facilities.js';
import mongoose from 'mongoose';

class RoomTypeController {
  async getRoomTypeByBhId(req, res, next) {
    try {
      const { id } = req.params;

      const bhRoomType = await RoomType.find({ boardingHouseId: id })
        .populate('facilities')
        .populate('boardingHouseId');

      if (!bhRoomType.length) {
        return res.status(404).json({ message: 'No room types found' });
      }

      const roomCounts = await Room.aggregate([
        {
          $match: {
            boardingHouseId: new mongoose.Types.ObjectId(id),
            isAvailable: true,
          },
        },
        { $group: { _id: '$roomTypeId', count: { $sum: 1 } } },
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

  async addRoomTypeToBoardingHouse(req, res, next) {
    try {
      const { id } = req.params; // ID của BoardingHouse
      let { typeName, facilities, price, roomSize, peopleNumber } = req.body;

      // 🔥 Kiểm tra BoardingHouse có tồn tại không
      const boardingHouse = await BoardingHouse.findById(id);
      if (!boardingHouse) {
        return res.status(404).json({ message: 'Boarding House not found' });
      }

      // ✅ Kiểm tra typeName: Không chứa ký tự đặc biệt, không trùng
      const typeNameRegex = /^[a-zA-Z0-9 ]+$/; // ✅ Chỉ cho phép chữ, số, khoảng trắng
      if (!typeNameRegex.test(typeName)) {
        return res
          .status(400)
          .json({ message: 'Type Name must not contain special characters.' });
      }

      // ✅ Kiểm tra typeName có trùng không
      const existingRoomType = await RoomType.findOne({
        boardingHouseId: id,
        typeName,
      });
      if (existingRoomType) {
        return res.status(400).json({
          message: 'Type Name already exists for this Boarding House.',
        });
      }

      // ✅ Convert `facilities` từ string JSON thành array ObjectId
      if (!facilities || facilities === 'null' || facilities === '[]') {
        facilities = []; // 👉 Nếu không có, gán mặc định là []
      } else if (typeof facilities === 'string') {
        try {
          facilities = JSON.parse(facilities);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid facilities format' });
        }
      }

      if (!Array.isArray(facilities)) {
        return res.status(400).json({ message: 'Facilities must be an array' });
      }

      // 👉 Nếu `facilities` không phải `["None"]`, convert sang `ObjectId`
      if (facilities[0] !== 'None') {
        facilities = facilities.map((id) => new mongoose.Types.ObjectId(id));
      }

      // 🔥 Kiểm tra và xử lý ảnh upload lên Cloudinary
      if (!req.file) {
        return res.status(400).json({ message: 'You must upload an image.' });
      }

      const image = {
        imageUrl: req.file.path,
        publicId: req.file.filename,
      };

      // ✅ Tạo mới RoomType
      const newRoomType = new RoomType({
        boardingHouseId: id,
        typeName,
        facilities,
        price,
        roomSize,
        peopleNumber,
        image, // Lưu ảnh duy nhất
      });

      // 🔥 Lưu vào database
      await newRoomType.save();

      res.status(201).json({
        message: 'Room Type added successfully',
        data: newRoomType,
      });
    } catch (error) {
      console.error('🔥 Error in addRoomTypeToBoardingHouse:', error);
      return res.status(500).json({
        message: 'An unexpected error occurred while adding room type.',
        error: error.message,
      });
    }
  }
  async updateRoomTypeToBoardingHouse(req, res, next) {
    try {
      const { roomTypeId } = req.params; // ID của RoomType
      let { typeName, facilities, price, roomSize, peopleNumber } = req.body;

      // 🔥 Kiểm tra RoomType có tồn tại không
      const roomType = await RoomType.findById(roomTypeId);
      if (!roomType) {
        return res.status(404).json({ message: 'Room Type not found' });
      }

      // ✅ Kiểm tra typeName không chứa ký tự đặc biệt
      const typeNameRegex = /^[a-zA-Z0-9 ]+$/;
      if (typeName && !typeNameRegex.test(typeName)) {
        return res
          .status(400)
          .json({ message: 'Type Name must not contain special characters.' });
      }

      // ✅ Kiểm tra typeName có trùng không (trừ chính nó)
      const existingRoomType = await RoomType.findOne({
        boardingHouseId: roomType.boardingHouseId,
        typeName,
        _id: { $ne: roomTypeId },
      });
      if (existingRoomType) {
        return res.status(400).json({
          message: 'Type Name already exists for this Boarding House.',
        });
      }

      // ✅ Convert `facilities` từ string JSON thành array ObjectId
      if (!facilities || facilities === 'null' || facilities === '[]') {
        facilities = [];
      } else if (typeof facilities === 'string') {
        try {
          facilities = JSON.parse(facilities);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid facilities format' });
        }
      }

      if (!Array.isArray(facilities)) {
        return res.status(400).json({ message: 'Facilities must be an array' });
      }

      // ✅ Nếu `facilities.length === 0`, cập nhật RoomType thành không có facilities
      if (facilities.length === 0) {
        roomType.facilities = []; // Xóa hết facilities
      } else {
        // Nếu vẫn còn facilities, chuyển đổi chúng thành ObjectId
        roomType.facilities = facilities.map(
          (id) => new mongoose.Types.ObjectId(id)
        );
      }

      // ✅ Xử lý ảnh: Nếu có ảnh mới -> Xóa ảnh cũ trên Cloudinary, upload ảnh mới
      let image = roomType.image; // Giữ ảnh cũ nếu không có ảnh mới
      if (req.file) {
        // 🔥 Xóa ảnh cũ trên Cloudinary nếu có
        if (roomType.image?.publicId) {
          await cloudinary.uploader.destroy(roomType.image.publicId);
        }

        // 🔥 Lưu ảnh mới lên Cloudinary
        image = {
          imageUrl: req.file.path,
          publicId: req.file.filename,
        };
      }

      // ✅ Cập nhật RoomType
      roomType.typeName = typeName || roomType.typeName;
      roomType.price = price || roomType.price;
      roomType.roomSize = roomSize || roomType.roomSize;
      roomType.peopleNumber = peopleNumber || roomType.peopleNumber;
      roomType.image = image;

      // 🔥 Lưu vào database
      await roomType.save();

      res.status(200).json({
        message: 'Room Type updated successfully',
        data: roomType,
      });
    } catch (error) {
      console.error('🔥 Error in updateRoomTypeToBoardingHouse:', error);
      return res.status(500).json({
        message: 'An unexpected error occurred while updating room type.',
        error: error.message,
      });
    }
  }
}

export default new RoomTypeController();
