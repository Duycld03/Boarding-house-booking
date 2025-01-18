import { body } from "express-validator";

export const createFavoriteItemValidator = [
  body("product_id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid Product ID format"),
];

export const updateFavoriteItemValidator = [
  body("product_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid Product ID format"),
];
