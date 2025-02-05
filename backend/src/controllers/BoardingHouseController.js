import mongoose from 'mongoose';
import BoardingHouse from '../models/boardingHouse.js';
import BoardingHouseType from '../models/boardingHouseType .js';
import unidecode from 'unidecode';

class BoardingHouseController {
  async getAllBHOnDashBoard(req, res, next) {
    try {
      const boardingHData = await BoardingHouse.find()
        .populate('boardingHouseType')
        .populate({
          path: 'ownerId',
        })
        .sort({ createdAt: 1 });

      return res.status(200).json(boardingHData);
    } catch (error) {
      console.error('Error fetching boarding house data:', error);
      return res.status(500).json({
        message: 'Failed to fetch boarding house data. Please try again later.',
        error: error.message,
      });
    }
  }
  async getBoardingHouseDetails(req, res, next) {
    try {
      const { id } = req.params;
      const boardingHouse = await BoardingHouse.findById(id)
        .populate('boardingHouseType', 'name')
        .populate('ownerId', 'email username fullname') // Populate owner details
        .exec();

      if (!boardingHouse) {
        return res.status(404).json({
          success: false,
          message: 'Boarding house not found',
        });
      }
      return res.status(200).json({
        success: true,
        data: boardingHouse,
      });
    } catch (error) {
      console.error('Error fetching boarding house details:', error);
      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch boarding house details. Please try again later.',
        error: error.message,
      });
    }
  }
  async updateBoardingHouseDetails(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedBoardingHouse = await BoardingHouse.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('boardingHouseType', 'name')
        .populate('ownerId', 'email');

      if (!updatedBoardingHouse) {
        return res.status(404).json({
          success: false,
          message: 'Boarding house not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Boarding house updated successfully',
        data: updatedBoardingHouse,
      });
    } catch (error) {
      console.error('Error updating boarding house details:', error);
      return res.status(500).json({
        success: false,
        message:
          'Failed to update boarding house details. Please try again later.',
        error: error.message,
      });
    }
  }
  async getAllBoardingHouseTypes(req, res) {
    try {
      const boardingHouseTypes = await BoardingHouseType.find();
      const formattedTypes = boardingHouseTypes.map((type) => ({
        value: type._id,
        label: type.name,
        roomSize: type.roomSize,
        peopleNumber: type.peopleNumber,
      }));

      return res.status(200).json({
        success: true,
        data: formattedTypes,
      });
    } catch (error) {
      console.error('Error fetching boarding house types:', error.message);
      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch boarding house types. Please try again later.',
      });
    }
  }
  async addBoardingHouseImage(req, res) {
    try {
      const { id } = req.params;
      const { imageUrl, isPrimary } = req.body;

      const boardingHouse = await BoardingHouse.findById(id);
      if (!boardingHouse) {
        return res.status(404).json({
          success: false,
          message: 'Boarding house not found',
        });
      }

      // If isPrimary is true, set all other images to false
      if (isPrimary) {
        boardingHouse.images.forEach((image) => {
          image.isPrimary = false;
        });
      }

      boardingHouse.images.push({
        imageUrl,
        isPrimary,
      });

      await boardingHouse.save();

      return res.status(201).json({
        success: true,
        message: 'Image added successfully',
        data: boardingHouse,
      });
    } catch (error) {
      console.error('Error adding boarding house image:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add image. Please try again later.',
        error: error.message,
      });
    }
  }

  async updateBoardingHouseImage(req, res) {
    try {
      const { id, imageId } = req.params;
      const { imageUrl, isPrimary } = req.body;

      const boardingHouse = await BoardingHouse.findById(id);
      if (!boardingHouse) {
        return res.status(404).json({
          success: false,
          message: 'Boarding house not found',
        });
      }

      const image = boardingHouse.images.id(imageId);
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Image not found',
        });
      }

      // If setting this image as primary, update other images
      if (isPrimary) {
        boardingHouse.images.forEach((img) => {
          img.isPrimary = false;
        });
      }

      if (imageUrl) image.imageUrl = imageUrl;
      image.isPrimary = isPrimary;

      await boardingHouse.save();

      return res.status(200).json({
        success: true,
        message: 'Image updated successfully',
        data: boardingHouse,
      });
    } catch (error) {
      console.error('Error updating boarding house image:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update image. Please try again later.',
        error: error.message,
      });
    }
  }

  async deleteBoardingHouseImage(req, res) {
    try {
      const { id, imageId } = req.params;

      const boardingHouse = await BoardingHouse.findById(id);
      if (!boardingHouse) {
        return res.status(404).json({
          success: false,
          message: 'Boarding house not found',
        });
      }

      const imageIndex = boardingHouse.images.findIndex(
        (img) => img._id.toString() === imageId
      );

      if (imageIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Image not found',
        });
      }

      boardingHouse.images.splice(imageIndex, 1);
      await boardingHouse.save();

      return res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting boarding house image:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete image. Please try again later.',
        error: error.message,
      });
    }
  }
  async getBoardingHouseImages(req, res) {
    try {
      const { id } = req.params;

      // Tìm boarding house theo ID và chỉ lấy danh sách ảnh
      const boardingHouse = await BoardingHouse.findById(id).select('images');

      if (!boardingHouse) {
        return res.status(404).json({
          success: false,
          message: 'Boarding house not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: boardingHouse.images,
      });
    } catch (error) {
      console.error('Error fetching boarding house images:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch boarding house images.',
        error: error.message,
      });
    }
  }

  async filterBoardingHouse(req, res) {
    try {
      let {
        boardingHouseType,
        district,
        name,
        priceRange,
        province,
        ward,
        startDate,
        endDate,
      } = req.query;

      let filter = {};
      let result = [];

      if (boardingHouseType) {
        filter.boardingHouseType = new mongoose.Types.ObjectId(
          boardingHouseType
        ); // Convert string to ObjectId
      }

      if (priceRange && priceRange.length === 2) {
        filter.priceRange = { $gte: priceRange[0], $lte: priceRange[1] };
      }

      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      // Query the boarding houses based on filter
      const boardingHouses = await BoardingHouse.find(filter)
        .populate('boardingHouseType')
        .populate({
          path: 'ownerId',
        })
        .sort({ createdAt: 1 });

      result = boardingHouses;

      if (province) {
        result = result.filter((bh) => {
          return (
            bh.address?.province &&
            bh.address.province.toLowerCase().includes(province.toLowerCase())
          );
        });
      }

      if (district) {
        result = result.filter((bh) => {
          return (
            bh.address?.district &&
            bh.address.district.toLowerCase().includes(district.toLowerCase())
          );
        });
      }

      if (ward) {
        result = result.filter((bh) => {
          return (
            bh.address?.ward &&
            bh.address.ward.toLowerCase().includes(ward.toLowerCase())
          );
        });
      }

      // Handle name search if provided
      if (name) {
        result = result.filter((bh) => {
          return bh.name && bh.name.toLowerCase().includes(name.toLowerCase());
        });
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error filtering boarding houses:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
  async getMaxPriceBH(req, res, next) {
    try {
      const boardingHouses = await BoardingHouse.find({}, { priceRange: 1 });

      if (!boardingHouses || boardingHouses.length === 0) {
        return res.status(404).json({ message: 'No boarding house found' });
      }

      const maxPrice = boardingHouses[0].priceRange; // Lấy giá trị lớn nhất

      const roundedPrice = Math.ceil(maxPrice / 100) * 100; // Làm tròn lên theo bội số của 100

      res.status(200).json({ maxPrice: roundedPrice });
    } catch (error) {
      console.error('Error fetching max price:', error);
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message });
    }
  }
  async getAllBHOnHome(req, res, next) {
    try {
      const boardingHData = await BoardingHouse.aggregate([
        {
          $match: { totalRooms: { $gt: 0 } }, // Filter boarding houses with totalRoom > 0
        },
        {
          $lookup: {
            from: 'reviews', // Tên collection của Review
            localField: '_id',
            foreignField: 'boardingHouseId',
            as: 'reviews',
          },
        },
        {
          $addFields: {
            rating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] }, // Tính trung bình rating, nếu không có thì mặc định 0
            reviewCount: { $size: '$reviews' }, // Đếm số lượng review
          },
        },
        {
          $project: {
            reviews: 0, // Ẩn danh sách review để response nhẹ hơn
          },
        },
      ]);

      return res.status(200).json(boardingHData);
    } catch (error) {
      console.error('Error fetching boarding house data:', error);
      return res.status(500).json({
        message: 'Failed to fetch boarding house data. Please try again later.',
        error: error.message,
      });
    }
  }
}

export default new BoardingHouseController();
