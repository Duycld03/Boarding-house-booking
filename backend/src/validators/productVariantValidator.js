import { body } from "express-validator";
import { deleteFile } from "../utils/fileUtils.js";

const productVariantImageValidator = (isRequired) => (req, res, next) => {
  if (isRequired && !req.file) {
    return res
      .status(422)
      .json({ errors: [{ msg: "Product variant image is required" }] });
  }

  if (req.file) {
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validImageTypes.includes(req.file.mimetype)) {
      deleteFile(req.file.path);
      return res.status(422).json({
        errors: [
          {
            msg: "Product variant image must be a valid image (JPEG, PNG, GIF)",
          },
        ],
      });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      deleteFile(req.file.path);
      return res.status(400).json({
        errors: [{ msg: "Product variant image must be less than 5MB" }],
      });
    }
  }

  next();
};

export const createProductVariantValidator = [
  body("quantity_in_stock")
    .isInt({ min: 0 })
    .withMessage("Quantity in stock must be a non-negative integer"),

  body("variation.color")
    .notEmpty()
    .withMessage("Color is required")
    .isString()
    .withMessage("Color must be a string"),

  body("variation.size")
    .notEmpty()
    .withMessage("Size is required")
    .isString()
    .withMessage("Size must be a string"),
  productVariantImageValidator(true),
];

export const updateProductVariantValidator = [
  body("quantity_in_stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity in stock must be a non-negative integer"),

  body("color").optional().isString().withMessage("Color must be a string"),

  body("size").optional().isString().withMessage("Size must be a string"),
  productVariantImageValidator(false),
];
