import { body } from "express-validator";
import { deleteFile } from "../utils/fileUtils.js";

export const productReviewImageValidator = (isRequired) => (req, res, next) => {
  if (isRequired && (!req.files || req.files.length === 0)) {
    return res
      .status(422)
      .json({ errors: [{ msg: "Comment images are required" }] });
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

export const createProductReviewValidator = [
  body("product_id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid Product ID format"),

  body("commentTxt")
    .optional()
    .isString()
    .withMessage("Comment text must be a string"),

  body("vote_star")
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage("Vote star must be an integer between 0 and 5"),
  productReviewImageValidator(false),
];

export const updateProductReviewValidator = [
  body("product_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid Product ID format"),

  body("commentTxt")
    .optional()
    .isString()
    .withMessage("Comment text must be a string"),

  body("vote_star")
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage("Vote star must be an integer between 0 and 5"),
  productReviewImageValidator(false),
];
