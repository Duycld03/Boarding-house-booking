import { body } from "express-validator";

export const checkoutValidator = [
  body("shippingMethod")
    .isString()
    .withMessage("Shipping method must be a string")
    .notEmpty()
    .withMessage("Shipping method is required"),

  body("shippingCost")
    .isNumeric()
    .withMessage("Shipping cost must be a number")
    .notEmpty()
    .withMessage("Shipping cost is required"),

  body("paymentMethod")
    .isString()
    .withMessage("Payment method must be a string")
    .notEmpty()
    .withMessage("Payment method is required"),

  body("promotion")
    .optional()
    .isString()
    .withMessage("Promotion must be a string"),
];
