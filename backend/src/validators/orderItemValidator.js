import { body } from "express-validator";

export const createOrderItemValidator = [
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be an integer greater than 0")
    .notEmpty()
    .withMessage("Quantity is required"),

  body("totalPrice")
    .isFloat({ min: 0 })
    .withMessage("Total price must be a number greater than or equal to 0")
    .notEmpty()
    .withMessage("Total price is required"),

  body("orderId")
    .isMongoId()
    .withMessage("Invalid order ID format")
    .notEmpty()
    .withMessage("Order ID is required"),

  body("variantId")
    .isMongoId()
    .withMessage("Invalid product variant ID format")
    .notEmpty()
    .withMessage("Product variant ID is required"),
];

export const updateOrderItemValidator = [
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be an integer greater than 0")
    .notEmpty()
    .withMessage("Quantity is required"),

  body("totalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Total price must be a number greater than or equal to 0")
    .notEmpty()
    .withMessage("Total price is required"),

  body("orderId")
    .optional()
    .isMongoId()
    .withMessage("Invalid order ID format")
    .notEmpty()
    .withMessage("Order ID is required"),

  body("variantId")
    .optional()
    .isMongoId()
    .withMessage("Invalid product variant ID format")
    .notEmpty()
    .withMessage("Product variant ID is required"),
];
