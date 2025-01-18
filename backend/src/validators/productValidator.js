import { body } from "express-validator";
import { deleteFile } from "../utils/fileUtils.js";

export const productImageValidator = (isRequired) => (req, res, next) => {
  if (isRequired && (!req.files || req.files.length === 0)) {
    return res
      .status(422)
      .json({ errors: [{ msg: "Product images are required" }] });
  }

  if (req.files) {
    if (req.files.length > 5) {
      req.files.forEach((file) => deleteFile(file.path));
      return res
        .status(422)
        .json({ errors: [{ msg: "You can upload up to 5 images" }] });
    }

    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    req.files.forEach((file) => {
      if (!validImageTypes.includes(file.mimetype)) {
        deleteFile(file.path);
        return res.status(422).json({
          errors: [{ msg: "Each file must be a valid image (JPEG, PNG, GIF)" }],
        });
      }

      if (file.size > 5 * 1024 * 1024) {
        deleteFile(file.path);
        return res.status(422).json({
          errors: [{ msg: "Each image must be less than 5MB" }],
        });
      }
    });
  }

  next();
};

export const createProductValidator = [
  body("name")
    .isString()
    .withMessage("Product name must be a string")
    .notEmpty()
    .withMessage("Product name is required"),

  body("entry_price")
    .isFloat({ min: 0 })
    .withMessage("Entry price must be a positive number")
    .notEmpty()
    .withMessage("Entry price is required"),

  body("description").isString().withMessage("Description must be a string"),

  body("product_image.*.isPrimary")
    .optional()
    .isBoolean()
    .withMessage("isPrimary must be a boolean"),

  body("sale_price")
    .isFloat({ min: 0 })
    .withMessage("Sale price must be a positive number"),

  body("discount")
    .optional()
    .isString()
    .withMessage("Discount must be a string"),
  body("vote_average")
    .optional()
    .isFloat()
    .withMessage("Vote average must be a number"),
  body("vote_count")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Vote count must be an integer"),
  body("category_id")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Invalid category ID format"),
  productImageValidator(true),
];

export const updateProductValidator = [
  body("name")
    .optional()
    .isString()
    .withMessage("Product name must be a string")
    .notEmpty()
    .withMessage("Product name is required"),

  body("entry_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Entry price must be a positive number")
    .notEmpty()
    .withMessage("Entry price is required"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("product_image.*.isPrimary")
    .optional()
    .isBoolean()
    .withMessage("isPrimary must be a boolean"),

  body("sale_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Sale price must be a positive number"),

  body("discount")
    .optional()
    .isString()
    .withMessage("Discount must be a string"),
  body("vote_average")
    .optional()
    .isFloat()
    .withMessage("Vote average must be a number"),
  body("vote_count")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Vote count must be an integer"),
  body("category_id")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Invalid category ID format"),
  productImageValidator(false),
];
