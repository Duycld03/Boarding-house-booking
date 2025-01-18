import { body } from "express-validator";
import CartItem from "../models/cartItemModel.js";

export const createCartItemValidator = [
  body("productVariant_id")
    .isMongoId()
    .withMessage("Invalid product variant ID format")
    .notEmpty()
    .withMessage("Product variant ID is required"),

  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer")
    .optional({ nullable: true })
    .default(1),
];

export const updateCartItemValidator = [
  body("productVariant_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid product variant ID format")
    .notEmpty()
    .withMessage("Product variant ID is required"),


  body("quantity")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer")
    .optional({ nullable: true })
    .default(1),
];
