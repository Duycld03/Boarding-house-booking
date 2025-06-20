import mongoose from "mongoose";
import BoardingHouse from "../models/boardingHouse.js";
import BoardingHouseType from "../models/boardingHouseType.js";
import { v2 as cloudinary } from "cloudinary";

// import path from "path";
import fs from "fs";
import multer from "multer";
import Account from "../models/account.js";
import paginate from "../utils/pagination.js";

class boardingHouseController {
  async getAllBHOnDashBoard(req, res, next) {
    try {
      const boardingHData = await BoardingHouse.find()
        .populate("boardingHouseType")
        .populate({
          path: "ownerId",
        })
        .sort({ createdAt: -1 });

      return res.status(200).json(boardingHData);
    } catch (error) {
      console.error("Error fetching boarding house data:", error);
      return res.status(500).json({
        message: "Failed to fetch boarding house data. Please try again later.",
        error: error.message,
      });
    }
  }

  async getBoardingHouseDetails(req, res, next) {
    try {
      const { id } = req.params;
      const boardingHouse = await BoardingHouse.findById(id)
        .populate("boardingHouseType", "name")
        .populate("ownerId", "email username fullname")
        .exec();

      if (!boardingHouse) {
        return res.status(404).json({
          success: false,
          message: "Boarding house not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: boardingHouse,
      });
    } catch (error) {
      console.error("Error fetching boarding house details:", error);
      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch boarding house details. Please try again later.",
        error: error.message,
      });
    }
  }

  async getBoardingHouseDetailInUser(req, res, next) {
    try {
      const { id } = req.params;
      const boardingHouse = await BoardingHouse.findById(id)
        .populate("boardingHouseType")
        .populate("ownerId")
        .exec();

      if (!boardingHouse) {
        return res.status(404).json({
          success: false,
          message: "Boarding house not found",
        });
      }
      return res.status(200).json(boardingHouse);
    } catch (error) {
      console.error("Error fetching boarding house details:", error);
      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch boarding house details. Please try again later.",
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
          message: "Name is required and must not contain special characters.",
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
          message: "A boarding house with this name already exists.",
        });
      }

      // Validate address
      if (!address || !address.province || !address.district || !address.ward) {
        return res.status(400).json({
          success: false,
          message:
            "Province, district, and ward are required fields in the address.",
        });
      }

      // Validate images
      const primaryImageCount =
        images?.filter((img) => img.isPrimary).length || 0;
      if (primaryImageCount !== 1) {
        return res.status(400).json({
          success: false,
          message: "You must upload exactly one primary image.",
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
          message: "Price fields must be greater than 0.",
        });
      }

      // Update the boarding house details
      const updatedBoardingHouse = await BoardingHouse.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("boardingHouseType", "name")
        .populate("ownerId", "email");

      // Check if the boarding house exists
      if (!updatedBoardingHouse) {
        return res.status(404).json({
          success: false,
          message: "Boarding house not found.",
        });
      }

      // Successfully updated
      return res.status(200).json({
        success: true,
        message: "Boarding house updated successfully.",
        data: updatedBoardingHouse,
      });
    } catch (error) {
      console.error("Error updating boarding house details:", error);
      return res.status(500).json({
        success: false,
        message:
          "Failed to update boarding house details. Please try again later.",
        error: error.message,
      });
    }
  }

  async getAllBoardingHouseTypes(req, res) {
    try {
      const boardingHouseTypes = await BoardingHouseType.find().sort({
        createdAt: -1,
      });
      const formattedTypes = boardingHouseTypes.map((type) => ({
        value: type._id,
        label: type.name,
        roomSize: type.roomSize,
        peopleNumber: type.peopleNumber,
        description: type.description,
        createdAt: type.createdAt,
        updatedAt: type.updatedAt,
      }));

      return res.status(200).json({
        success: true,
        data: formattedTypes,
      });
    } catch (error) {
      console.error("Error fetching boarding house types:", error.message);
      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch boarding house types. Please try again later.",
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
          message: "Boarding house not found",
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
        message: "Image added successfully",
        data: boardingHouse,
      });
    } catch (error) {
      console.error("Error adding boarding house image:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add image. Please try again later.",
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
          message: "Boarding house not found",
        });
      }

      const image = boardingHouse.images.id(imageId);
      if (!image) {
        return res.status(404).json({
          success: false,
          message: "Image not found",
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
        message: "Image updated successfully",
        data: boardingHouse,
      });
    } catch (error) {
      console.error("Error updating boarding house image:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update image. Please try again later.",
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
          message: "Boarding house not found",
        });
      }

      const imageIndex = boardingHouse.images.findIndex(
        (img) => img._id.toString() === imageId
      );

      if (imageIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }

      boardingHouse.images.splice(imageIndex, 1);
      await boardingHouse.save();

      return res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting boarding house image:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete image. Please try again later.",
        error: error.message,
      });
    }
  }
  async getBoardingHouseImages(req, res) {
    try {
      const { id } = req.params;

      // Tìm boarding house theo ID và chỉ lấy danh sách ảnh
      const boardingHouse = await BoardingHouse.findById(id).select("images");

      if (!boardingHouse) {
        return res.status(404).json({
          success: false,
          message: "Boarding house not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: boardingHouse.images,
      });
    } catch (error) {
      console.error("Error fetching boarding house images:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch boarding house images.",
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
        location,
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

      // Validate owner
      const ownerAccount = await Account.findOne({
        username: ownerUsername,
        role: "owner",
      });
      if (!ownerAccount) {
        console.error("Invalid owner:", ownerUsername);
        return res.status(400).json({
          message: "Invalid owner username or the user is not a landlord.",
        });
      }
      const ownerId = ownerAccount._id;

      // Validate boarding house type
      const boardingHouseTypeExists =
        await BoardingHouseType.findById(boardingHouseType);
      if (!boardingHouseTypeExists) {
        console.error("Invalid boarding house type:", boardingHouseType);
        return res
          .status(400)
          .json({ message: "Invalid boarding house type." });
      }

      // Validate name
      if (!name || /[!@#$%^&*(),.?":{}|<>]/g.test(name)) {
        console.error("Invalid name:", name);
        return res.status(400).json({
          message: "Name is required and must not contain special characters.",
        });
      }
      // Check if the boarding house name already exists
      const existingBoardingHouse = await BoardingHouse.findOne({ name });
      if (existingBoardingHouse) {
        console.error("Boarding house name already exists:", name);
        return res
          .status(400)
          .json({ message: "A boarding house with this name already exists." });
      }

      // Validate address
      const { province, district, ward, detail } = address;
      if (!province || !district || !ward) {
        console.error("Invalid address:", address);
        return res.status(400).json({
          message:
            "Province, district, and ward are required fields in the address.",
        });
      }

      // Validate images
      const primaryImageCount = images.filter((img) => img.isPrimary).length;
      if (primaryImageCount !== 1) {
        console.error("Invalid primary images count:", primaryImageCount);
        return res
          .status(400)
          .json({ message: "You must upload exactly one primary image." });
      }
      if (images.length > 15) {
        console.error("Too many images:", images.length);
        return res.status(400).json({
          message: "You can't upload more than 15 images for other image.",
        });
      }

      // Validate price fields
      if (priceRange <= 0 || electricityPrice <= 0 || waterPrice <= 0) {
        console.error("Invalid price fields:", {
          priceRange,
          electricityPrice,
          waterPrice,
        });
        return res
          .status(400)
          .json({ message: "Price fields must be greater than 0." });
      }

      // Tạo mới boarding house
      const newBoardingHouse = new BoardingHouse({
        ownerId,
        name,
        description: description || "",
        priceRange,
        electricityPrice,
        waterPrice,
        boardingHouseType,
        address: {
          province,
          district,
          ward,
          detail: detail || "",
        },
        location: {
          lat: location.lat,
          lon: location.lon,
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
        message: "Boarding house created successfully!",
        data: savedBoardingHouse,
      });
    } catch (error) {
      console.error("Error creating boarding house:", error);
      return res.status(500).json({
        message: "An unexpected error occurred while creating boarding house.",
        error: error.message,
      });
    }
  }

  async uploadFile(req, res) {
    const storagePath = "./public/images/boardingHouse";

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

      const upload = multer({ storage }).single("file");

      upload(req, res, (err) => {
        if (err) {
          console.error("Error uploading file:", err);
          return res.status(500).json({ message: "Failed to upload file." });
        }

        if (!req.file) {
          return res.status(400).json({ message: "No file provided." });
        }
        // Trả về đường dẫn file
        const filePath = `/public/images/boardingHouse/${req.file.filename}`;
        res.status(200).json({ filePath });
        // const filePath = `${req.protocol}://${req.get('host')}/assets/images/${req.file.filename}`;
        // res.status(200).json({ filePath });
      });
    } catch (error) {
      console.error("Error in uploadFile:", error);
      res.status(500).json({ message: "Internal server error." });
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
        rating,
      } = req.query;

      let filter = {};
      let result = [];

      if (boardingHouseType) {
        filter.boardingHouseType = new mongoose.Types.ObjectId(
          boardingHouseType
        ); // Convert string to ObjectId
      }
      if (rating) {
        const ratings = rating.split(",").map(Number); // Split and convert to numbers
        const validRatings = ratings.filter(
          (r) => !isNaN(r) && r >= 0 && r <= 5
        ); // Validate ratings

        if (validRatings.length > 0) {
          filter.rating = { $in: validRatings }; // Filter for ratings in the provided array
        } else {
          return res.status(400).json({
            success: false,
            message:
              "Invalid rating format. Each rating must be a number between 0 and 5.",
          });
        }
      }
      if (priceRange && priceRange.length === 2) {
        filter.priceRange = { $gte: priceRange[0], $lte: priceRange[1] };
      }
      // If province is provided, filter by province
      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      // Query the boarding houses based on filter
      const boardingHouses = await BoardingHouse.find(filter)
        .populate("boardingHouseType")
        .populate({
          path: "ownerId",
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
      console.error("Error filtering boarding houses:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }

  async getMaxPriceBH(req, res, next) {
    try {
      const maxPriceHouse = await BoardingHouse.findOne().sort({
        priceRange: -1,
      });
      if (!maxPriceHouse || maxPriceHouse === 0) {
        return res.status(404).json({ message: "No boarding house found" });
      }

      const roundedPrice = Math.ceil(maxPriceHouse.priceRange / 100) * 100;

      res.status(200).json({ maxPrice: roundedPrice });
    } catch (error) {
      console.error("Error fetching max price:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
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
      console.error("Error fetching boarding house data:", error);
      return res.status(500).json({
        message: "Failed to fetch boarding house data. Please try again later.",
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
          message: "Boarding house not found",
        });
      }

      // Check if the boarding house is already soft deleted
      if (boardingHouse.deleted) {
        return res.status(400).json({
          success: false,
          message: "Boarding house is already soft deleted",
        });
      }

      boardingHouse.deleted = true;
      boardingHouse.deletedAt = new Date(); // Optional: track deletion timestamp
      await boardingHouse.save();

      return res.status(200).json({
        success: true,
        message: "Boarding house soft deleted successfully",
      });
    } catch (error) {
      console.error("Error soft deleting boarding house:", error);
      return res.status(500).json({
        success: false,
        message:
          "Failed to soft delete boarding house. Please try again later.",
        error: error.message,
      });
    }
  }

  async getAllBHOwner(req, res, next) {
    try {
      // Lấy thông tin tài khoản từ token
      const account = await Account.findById(req.user.userId);
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Xây dựng filter theo ownerId
      let filter = {};

      if (account.role === "owner") {
        filter = { ownerId: account._id };
      } else if (account.role === "manager" || account.role === "staff") {
        filter = { staffId: account._id };
      }

      // (Tuỳ chỉnh thêm nếu bạn muốn filter theo query string)
      // Ví dụ: ?status=active
      const { status, startDate, endDate } = req.query;
      if (status) filter.status = status;
      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      // Cấu hình pagination giống filterAccounts
      const paginationOptions = {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100,
        sortField: "createdAt",
        sortOrder: "desc", // Theo code gốc bạn dùng sort({ createdAt: -1 })
        filter, // filter ownerId + các filter khác
        allowQueryFilters: ["status"], // whitelist những query filter cho BoardingHouse
        allowSearchFields: ["name", "address"], // nếu bạn muốn search theo tên hoặc địa chỉ
        fields: "-__v", // không trả về trường __v
        populate: ["boardingHouseType"], // populate ref tới type
        includeTotalData: true, // nếu cần totalCount, totalPages…
      };

      // Gọi helper paginate
      const result = await paginate(BoardingHouse, paginationOptions, req);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error fetching boarding house data:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch boarding house data. Please try again later.",
        error: error.message,
      });
    }
  }
  async createBoardingHouseOwner(req, res, next) {
    try {
      const account = await Account.findById(req.user.userId);
      if (!account) {
        console.error("User not found for ID:", req.user.userId);
        return res.status(404).json({ message: "User not found" });
      }

      const ownerId = account._id;
      const {
        boardingHouseType,
        name,
        address,
        location,
        description,
        priceRange,
        electricityPrice,
        waterPrice,
        totalRooms = 0,
        staffId,
        availableRooms = 0,
      } = req.body;

      const boardingHouseTypeExists =
        await BoardingHouseType.findById(boardingHouseType);
      if (!boardingHouseTypeExists) {
        console.error("Invalid boarding house type:", boardingHouseType);
        return res
          .status(400)
          .json({ message: "Invalid boarding house type." });
      }

      if (!name || /[!@#$%^&*(),.?":{}|<>]/g.test(name)) {
        console.error("Invalid name:", name);
        return res.status(400).json({
          message: "Name is required and must not contain special characters.",
        });
      }
      const existingBoardingHouse = await BoardingHouse.findOne({ name });
      if (existingBoardingHouse) {
        console.error("Boarding house name already exists:", name);
        return res.status(400).json({
          message: "A boarding house with this name already exists.",
        });
      }

      if (!address || !address.province || !address.district || !address.ward) {
        console.error("Invalid address:", address);
        return res.status(400).json({
          message:
            "Province, district, and ward are required fields in the address.",
        });
      }
      let validManagerId = staffId;
      if (staffId === "") {
        validManagerId = null;
      }

      const images = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          images.push({
            imageUrl: file.path,
            publicId: file.filename,
            isPrimary: images.length === 0, // First image is primary
          });
        });
      }

      if (images.length === 0) {
        console.error("No images uploaded.");
        return res
          .status(400)
          .json({ message: "You must upload at least one image." });
      }

      const newBoardingHouse = new BoardingHouse({
        ownerId,
        name,
        description,
        priceRange,
        electricityPrice,
        waterPrice,
        boardingHouseType,
        address,
        location,
        images,
        totalRooms,
        availableRooms,
        staffId: validManagerId, // Use validManagerId here
      });

      const savedBoardingHouse = await newBoardingHouse.save();

      return res.status(201).json({
        message: "Boarding house created successfully!",
        data: savedBoardingHouse,
      });
    } catch (error) {
      console.error("Error creating boarding house:", error);
      return res.status(500).json({
        message: "An unexpected error occurred while creating boarding house.",
        error: error.message,
      });
    }
  }
  async updateBoardingHouseDetailsOwner(req, res, next) {
    try {
      const { id } = req.params; // Boarding house ID
      const updateData = req.body;
      const {
        name,
        address,
        priceRange,
        electricityPrice,
        waterPrice,
        staffId,
      } = updateData;

      // Validate name
      if (!name || /[!@#$%^&*(),.?":{}|<>]/g.test(name)) {
        return res.status(400).json({
          success: false,
          message: "Name is required and must not contain special characters.",
        });
      }

      // Check if the name already exists
      const existingBoardingHouse = await BoardingHouse.findOne({
        name,
        _id: { $ne: id },
      });
      if (existingBoardingHouse) {
        return res.status(400).json({
          success: false,
          message: "A boarding house with this name already exists.",
        });
      }

      // Validate address
      if (!address || !address.province || !address.district || !address.ward) {
        return res.status(400).json({
          success: false,
          message:
            "Province, district, and ward are required fields in the address.",
        });
      }

      // Fetch existing boarding house data
      const boardingHouse = await BoardingHouse.findById(id);
      if (!boardingHouse) {
        return res
          .status(404)
          .json({ success: false, message: "Boarding house not found." });
      }

      // Handle image upload to Cloudinary
      const images = [];
      let hasPrimary = false;
      if (req.body.boardingHouse) {
        const data = JSON.parse(req.body.boardingHouse);

        for (const img of data) {
          if (img.isPrimary) hasPrimary = true;
        }

        if (Array.isArray(data)) {
          images.push(...data);
        }
      }
      if (req.files) {
        req.files.forEach((file, index) => {
          images.push({
            imageUrl: file.path,
            publicId: file.filename,
            isPrimary: !hasPrimary && index === 0,
          });
        });
        // Delete old images from Cloudinary
        for (const oldImage of boardingHouse.images) {
          await cloudinary.uploader.destroy(oldImage.publicId);
        }

        updateData.images = images;
      }

      // Validate images
      // const primaryImageCount =
      //   updateData.images?.filter((img) => img.isPrimary).length || 0;
      // if (primaryImageCount !== 1) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'You must upload exactly one primary image.',
      //   });
      // }
      // if (updateData.images?.length > 15) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "You can't upload more than 15 images.",
      //   });
      // }

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
          message: "Price fields must be greater than 0.",
        });
      }
      if (staffId === "" || staffId === "null") {
        updateData.staffId = null;
      }
      // Update the boarding house details
      const updatedBoardingHouse = await BoardingHouse.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("boardingHouseType", "name")
        .populate("ownerId", "email");

      return res.status(200).json({
        success: true,
        message: "Boarding house updated successfully.",
        data: updatedBoardingHouse,
      });
    } catch (error) {
      console.error("Error updating boarding house details:", error);
      return res.status(500).json({
        success: false,
        message:
          "Failed to update boarding house details. Please try again later.",
        error: error.message,
      });
    }
  }
  async getBhByArea(req, res) {
    try {
      const {
        province,
        district,
        ward,
        boardingHouseType,
        rating,
        priceRange,
        name,
      } = req.query;
      let result = [];

      let filter = { totalRooms: { $gt: 0 } };

      // Nếu có loại nhà trọ, chuyển thành ObjectId
      if (boardingHouseType) {
        filter.boardingHouseType = new mongoose.Types.ObjectId(
          boardingHouseType
        );
      }

      // Nếu có rating, chuyển thành mảng số và kiểm tra hợp lệ
      if (rating) {
        const ratings = rating.split(",").map(Number);
        const validRatings = ratings.filter(
          (r) => !isNaN(r) && r >= 0 && r <= 5
        );
        if (validRatings.length > 0) {
          filter.rating = { $in: validRatings };
        } else {
          return res.status(400).json({
            success: false,
            message:
              "Invalid rating format. Each rating must be a number between 0 and 5.",
          });
        }
      }

      // Nếu có priceRange, kiểm tra định dạng và áp dụng bộ lọc
      if (priceRange) {
        const prices = priceRange.split(",").map(Number);
        if (prices.length === 2 && !isNaN(prices[0]) && !isNaN(prices[1])) {
          filter.priceRange = { $gte: prices[0], $lte: prices[1] };
        } else {
          return res.status(400).json({
            success: false,
            message: "Invalid price range format. Use 'priceRange=min,max'.",
          });
        }
      }

      // Truy vấn cơ sở dữ liệu với bộ lọc
      const boardingHData = await BoardingHouse.find(filter, { reviews: 0 });

      result = boardingHData;

      // Lọc theo tỉnh/thành phố
      if (province) {
        result = result.filter(
          (bh) =>
            bh.address?.province
              .toLowerCase()
              .includes(province.toLowerCase()) ?? false
        );
      }

      // Lọc theo quận/huyện
      if (district) {
        result = result.filter(
          (bh) =>
            bh.address?.district
              .toLowerCase()
              .includes(district.toLowerCase()) ?? false
        );
      }

      // Lọc theo phường/xã
      if (ward?.trim()) {
        result = result.filter(
          (bh) =>
            bh.address?.ward?.toLowerCase().includes(ward.toLowerCase()) ??
            false
        );
      }
      if (name) {
        result = result.filter((bh) => {
          return bh.name && bh.name.toLowerCase().includes(name.toLowerCase());
        });
      }
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  async createBoardingHouseType(req, res) {
    try {
      const { name, description } = req.body;

      // Kiểm tra xem tên loại nhà trọ đã được cung cấp hay chưa
      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name is required.",
        });
      }

      // Kiểm tra xem loại nhà trọ có tồn tại hay không
      const existingType = await BoardingHouseType.findOne({ name });
      if (existingType) {
        return res.status(400).json({
          success: false,
          message: "Boarding house type already exists.",
        });
      }

      // Tạo mới loại nhà trọ
      const newType = new BoardingHouseType({
        name,
        description,
      });

      // Lưu vào cơ sở dữ liệu
      const savedType = await newType.save();

      return res.status(201).json({
        success: true,
        message: "Boarding house type created successfully.",
        data: savedType,
      });
    } catch (error) {
      console.error("Error creating boarding house type:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create boarding house type.",
        error: error.message,
      });
    }
  }
  async getBoardingHouseTypeDetails(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Boarding house type ID is required.",
        });
      }

      const boardingHouseType = await BoardingHouseType.findById(id);

      if (!boardingHouseType) {
        return res.status(404).json({
          success: false,
          message: "Boarding house type not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: boardingHouseType,
      });
    } catch (error) {
      console.error("Error fetching boarding house type details:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch boarding house type details.",
        error: error.message,
      });
    }
  }
  async updateBoardingHouseType(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Boarding house type ID is required.",
        });
      }
      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Name is required and cannot be empty.",
        });
      }

      const existingType = await BoardingHouseType.findOne({
        name: name.trim(),
        _id: { $ne: id }, // Loại trừ loại nhà trọ hiện tại
      });

      if (existingType) {
        return res.status(400).json({
          success: false,
          message: "A boarding house type with this name already exists.",
        });
      }

      const updatedType = await BoardingHouseType.findByIdAndUpdate(
        id,
        { name: name.trim(), description },
        { new: true, runValidators: true }
      );
      if (!updatedType) {
        return res.status(404).json({
          success: false,
          message: "Boarding house type not found.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Boarding house type updated successfully.",
        data: updatedType,
      });
    } catch (error) {
      console.error("Error updating boarding house type:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update boarding house type.",
        error: error.message,
      });
    }
  }
  async softDeleteBoardingHouseType(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Boarding house type ID is required.",
        });
      }
      const boardingHouseType = await BoardingHouseType.findById(id);
      if (!boardingHouseType) {
        return res.status(404).json({
          success: false,
          message: "Boarding house type not found.",
        });
      }

      boardingHouseType.deleted = true;
      await boardingHouseType.save();

      return res.status(200).json({
        success: true,
        message: "Boarding house type soft deleted successfully.",
      });
    } catch (error) {
      console.error("Error soft deleting boarding house type:", error);
      return res.status(500).json({
        success: false,
        message:
          "Failed to soft delete boarding house type. Please try again later.",
        error: error.message,
      });
    }
  }
  async filterBoardingHouseType(req, res) {
    try {
      const { name, startDate, endDate } = req.query;

      const filter = {};
      if (name) {
        filter.name = { $regex: new RegExp(name, "i") };
      }

      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      const boardingHouseTypes = await BoardingHouseType.find(filter).sort({
        createdAt: -1,
      });

      if (!boardingHouseTypes || boardingHouseTypes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No boarding house types found matching the criteria.",
        });
      }
      return res.status(200).json({
        success: true,
        data: boardingHouseTypes,
      });
    } catch (error) {
      console.error("Error filtering boarding house types:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to filter boarding house types.",
        error: error.message,
      });
    }
  }

  async getElectricalAndWaterPrice(req, res) {
    try {
      const { boardingHouseId } = req.params;
      if (!boardingHouseId) {
        return res.status(400).json({ message: "boardingHouseId is required" });
      }
      const boardingHouse = await BoardingHouse.findById(boardingHouseId);
      if (!boardingHouse) {
        return res.status(404).json({ message: "Boarding house not found" });
      }
      const { electricityPrice, waterPrice } = boardingHouse;
      res.status(200).json({
        electricityPrice,
        waterPrice,
      });
    } catch (error) {
      console.error("Error fetching prices:", error);
      res.status(500).json({
        message: "An error occurred while fetching prices",
        error: error.message,
      });
    }
  }
}

export default new boardingHouseController();
