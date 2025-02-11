import mongoose from 'mongoose';
import BoardingHouse from '../models/boardingHouse.js';
import BoardingHouseType from '../models/boardingHouseType .js';
import unidecode from 'unidecode';

// import path from "path";
import fs from 'fs';
import multer from 'multer';
import Account from '../models/account.js';
class boardingHouseController {
  async getAllBHOnDashBoard(req, res, next) {
    try {
      const boardingHData = await BoardingHouse.find()
        .populate('boardingHouseType')
        .populate({
          path: 'ownerId',
        })
        .sort({ createdAt: -1 });

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

  async getBoardingHouseDetailInUser(req, res, next) {
    try {
      const { id } = req.params;
      const boardingHouse = await BoardingHouse.findById(id)
        .populate('boardingHouseType', 'name')
        .populate('ownerId')
        .exec();

      if (!boardingHouse) {
        return res.status(404).json({
          success: false,
          message: 'Boarding house not found',
        });
      }
      return res.status(200).json(boardingHouse);
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
      const { id } = req.params; // Boarding house ID
      const updateData = req.body;

      // Destructure data for validation
      const {
        name,
        address,
        images,
        priceRange,
        electricityPrice,
        waterPrice,
      } = updateData;

      // Validate name
      if (!name || /[!@#$%^&*(),.?":{}|<>]/g.test(name)) {
        return res.status(400).json({
          success: false,
          message: 'Name is required and must not contain special characters.',
        });
      }

      // Check if the name already exists (excluding the current boarding house)
      const existingBoardingHouse = await BoardingHouse.findOne({
        name,
        _id: { $ne: id },
      });
      if (existingBoardingHouse) {
        return res.status(400).json({
          success: false,
          message: 'A boarding house with this name already exists.',
        });
      }

      // Validate address
      if (!address || !address.province || !address.district || !address.ward) {
        return res.status(400).json({
          success: false,
          message:
            'Province, district, and ward are required fields in the address.',
        });
      }

      // Validate images
      const primaryImageCount =
        images?.filter((img) => img.isPrimary).length || 0;
      if (primaryImageCount !== 1) {
        return res.status(400).json({
          success: false,
          message: 'You must upload exactly one primary image.',
        });
      }
      if (images?.length > 15) {
        return res.status(400).json({
          success: false,
          message: "You can't upload more than 15 images.",
        });
      }

      // Validate price fields
      if (
        !priceRange ||
        priceRange <= 0 ||
        !electricityPrice ||
        electricityPrice <= 0 ||
        !waterPrice ||
        waterPrice <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Price fields must be greater than 0.',
        });
      }

      // Update the boarding house details
      const updatedBoardingHouse = await BoardingHouse.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('boardingHouseType', 'name')
        .populate('ownerId', 'email');

      // Check if the boarding house exists
      if (!updatedBoardingHouse) {
        return res.status(404).json({
          success: false,
          message: 'Boarding house not found.',
        });
      }

      // Successfully updated
      return res.status(200).json({
        success: true,
        message: 'Boarding house updated successfully.',
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
  async createBoardingHouse(req, res) {
    try {
      const {
        ownerUsername,
        boardingHouseType,
        name,
        address,
        description,
        images,
        priceRange,
        electricityPrice,
        waterPrice,
        totalRooms = 0,
        availableRooms = 0,
        likes = 0,
        rating = 5,
      } = req.body;

      // console.log("Request body received:", req.body);

      // Validate owner
      const ownerAccount = await Account.findOne({
        username: ownerUsername,
        role: 'owner',
      });
      // console.log("Owner account found:", ownerAccount);
      if (!ownerAccount) {
        console.error('Invalid owner:', ownerUsername);
        return res.status(400).json({
          message: 'Invalid owner username or the user is not a landlord.',
        });
      }
      const ownerId = ownerAccount._id;

      // Validate boarding house type
      const boardingHouseTypeExists =
        await BoardingHouseType.findById(boardingHouseType);
      if (!boardingHouseTypeExists) {
        console.error('Invalid boarding house type:', boardingHouseType);
        return res
          .status(400)
          .json({ message: 'Invalid boarding house type.' });
      }

      // Validate name
      if (!name || /[!@#$%^&*(),.?":{}|<>]/g.test(name)) {
        console.error('Invalid name:', name);
        return res.status(400).json({
          message: 'Name is required and must not contain special characters.',
        });
      }
      // Check if the boarding house name already exists
      const existingBoardingHouse = await BoardingHouse.findOne({ name });
      if (existingBoardingHouse) {
        console.error('Boarding house name already exists:', name);
        return res
          .status(400)
          .json({ message: 'A boarding house with this name already exists.' });
      }

      // Validate address
      const { province, district, ward, detail } = address;
      if (!province || !district || !ward) {
        console.error('Invalid address:', address);
        return res.status(400).json({
          message:
            'Province, district, and ward are required fields in the address.',
        });
      }

      // Validate images
      const primaryImageCount = images.filter((img) => img.isPrimary).length;
      if (primaryImageCount !== 1) {
        console.error('Invalid primary images count:', primaryImageCount);
        return res
          .status(400)
          .json({ message: 'You must upload exactly one primary image.' });
      }
      if (images.length > 15) {
        console.error('Too many images:', images.length);
        return res.status(400).json({
          message: "You can't upload more than 15 images for other image.",
        });
      }

      // Validate price fields
      if (priceRange <= 0 || electricityPrice <= 0 || waterPrice <= 0) {
        console.error('Invalid price fields:', {
          priceRange,
          electricityPrice,
          waterPrice,
        });
        return res
          .status(400)
          .json({ message: 'Price fields must be greater than 0.' });
      }

      // Tạo mới boarding house
      const newBoardingHouse = new BoardingHouse({
        ownerId,
        name,
        description: description || '',
        priceRange,
        electricityPrice,
        waterPrice,
        boardingHouseType,
        address: {
          province,
          district,
          ward,
          detail: detail || '',
        },
        images,
        totalRooms,
        availableRooms,
        likes,
        rating,
      });

      // Lưu boarding house vào database
      const savedBoardingHouse = await newBoardingHouse.save();

      return res.status(201).json({
        message: 'Boarding house created successfully!',
        data: savedBoardingHouse,
      });
    } catch (error) {
      console.error('Error creating boarding house:', error);
      return res.status(500).json({
        message: 'An unexpected error occurred while creating boarding house.',
        error: error.message,
      });
    }
  }

  async uploadFile(req, res) {
    const storagePath = './public/images/boardingHouse';

    // Tạo thư mục lưu file nếu chưa tồn tại
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    // const { multer } = await import("multer");
    try {
      const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, storagePath);
        },
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      });

      const upload = multer({ storage }).single('file');

      upload(req, res, (err) => {
        if (err) {
          console.error('Error uploading file:', err);
          return res.status(500).json({ message: 'Failed to upload file.' });
        }

        if (!req.file) {
          return res.status(400).json({ message: 'No file provided.' });
        }
        // Trả về đường dẫn file
        const filePath = `/public/images/boardingHouse/${req.file.filename}`;
        res.status(200).json({ filePath });
        // const filePath = `${req.protocol}://${req.get('host')}/assets/images/${req.file.filename}`;
        // res.status(200).json({ filePath });
      });
    } catch (error) {
      console.error('Error in uploadFile:', error);
      res.status(500).json({ message: 'Internal server error.' });
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
        .sort({ createdAt: -1 });

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
      const maxPriceHouse = await BoardingHouse.findOne().sort({
        priceRange: -1,
      });
      if (!maxPriceHouse || maxPriceHouse === 0) {
        return res.status(404).json({ message: 'No boarding house found' });
      }

      const roundedPrice = Math.ceil(maxPriceHouse.priceRange / 100) * 100;

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
      const boardingHData = await BoardingHouse.find(
        { totalRooms: { $gt: 0 } }, // Chỉ lấy các boarding house có phòng
        {
          reviews: 0, // Ẩn danh sách review
        }
      );

      return res.status(200).json(boardingHData);
    } catch (error) {
      console.error('Error fetching boarding house data:', error);
      return res.status(500).json({
        message: 'Failed to fetch boarding house data. Please try again later.',
        error: error.message,
      });
    }
  }

  async softDeleteBoardingHouse(req, res) {
    try {
      const { id } = req.params;

      // Find the boarding house by ID
      const boardingHouse = await BoardingHouse.findById(id);
      if (!boardingHouse) {
        return res.status(404).json({
          success: false,
          message: 'Boarding house not found',
        });
      }

      // Check if the boarding house is already soft deleted
      if (boardingHouse.deleted) {
        return res.status(400).json({
          success: false,
          message: 'Boarding house is already soft deleted',
        });
      }

      boardingHouse.deleted = true;
      boardingHouse.deletedAt = new Date(); // Optional: track deletion timestamp
      await boardingHouse.save();

      return res.status(200).json({
        success: true,
        message: 'Boarding house soft deleted successfully',
      });
    } catch (error) {
      console.error('Error soft deleting boarding house:', error);
      return res.status(500).json({
        success: false,
        message:
          'Failed to soft delete boarding house. Please try again later.',
        error: error.message,
      });
    }
  }
}

export default new boardingHouseController();
