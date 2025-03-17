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
      console.log('🔥 Received Data:', req.body); // ✅ Debug body nhận từ frontend
      console.log('🖼️ Received File:', req.file);

      // 🔥 Kiểm tra BoardingHouse có tồn tại không
      const boardingHouse = await BoardingHouse.findById(id);
      if (!boardingHouse) {
        return res.status(404).json({ message: 'Boarding House not found' });
      }

      // ✅ Convert `facilities` từ string JSON thành array ObjectId
      if (typeof facilities === 'string') {
        try {
          facilities = JSON.parse(facilities);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid facilities format' });
        }
      }

      if (!Array.isArray(facilities)) {
        return res.status(400).json({ message: 'Facilities must be an array' });
      }

      facilities = facilities.map((id) => new mongoose.Types.ObjectId(id));

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
}

export default new RoomTypeController();
