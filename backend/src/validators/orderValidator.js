import { body } from "express-validator";

export const createOrderValidator = [
  body("orderTotal")
    .isFloat({ min: 0 })
    .withMessage("Order total must be a number greater than or equal to 0")
    .notEmpty()
    .withMessage("Order total is required"),

  body("paymentMethod")
    .isString()
    .withMessage("Payment method must be a valid string")
    .notEmpty()
    .withMessage("Payment method is required"),

  body("totalItem")
    .isInt({ min: 1 })
    .withMessage("Total item must be an integer greater than 0")
    .notEmpty()
    .withMessage("Total item is required"),

  body("status")
    .isString()
    .withMessage("Status must be a valid string")
    .notEmpty()
    .withMessage("Status is required"),

  body("shipping.method")
    .isString()
    .withMessage("Shipping method must be a valid string")
    .notEmpty()
    .withMessage("Shipping method is required"),

  body("shipping.cost")
    .isFloat({ min: 0 })
    .withMessage("Shipping cost must be a number greater than or equal to 0")
    .notEmpty()
    .withMessage("Shipping cost is required"),

  body("shipping.address")
    .isString()
    .withMessage("Shipping address must be a valid string")
    .notEmpty()
    .withMessage("Shipping address is required"),

  body("shipping.arrived_date")
    .isISO8601()
    .withMessage("Arrived date must be a valid date in ISO 8601 format")
    .notEmpty()
    .withMessage("Arrived date is required"),

  body("discount_cost")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Discount cost must be a number greater than or equal to 0"),
];

export const updateOrderValidator = [
  body("orderTotal")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Order total must be a number greater than or equal to 0")
    .notEmpty()
    .withMessage("Order total is required"),

  body("paymentMethod")
    .optional()
    .isString()
    .withMessage("Payment method must be a valid string")
    .notEmpty()
    .withMessage("Payment method is required"),

  body("totalItem")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total item must be an integer greater than 0")
    .notEmpty()
    .withMessage("Total item is required"),

  body("status")
    .optional()
    .isString()
    .withMessage("Status must be a valid string")
    .notEmpty()
    .withMessage("Status is required"),

  body("shipping.method")
    .optional()
    .isString()
    .withMessage("Shipping method must be a valid string")
    .notEmpty()
    .withMessage("Shipping method is required"),

  body("shipping.cost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Shipping cost must be a number greater than or equal to 0")
    .notEmpty()
    .withMessage("Shipping cost is required"),

  body("shipping.address")
    .optional()
    .isString()
    .withMessage("Shipping address must be a valid string")
    .notEmpty()
    .withMessage("Shipping address is required"),

  body("shipping.arrived_date")
    .optional()
    .isISO8601()
    .withMessage("Arrived date must be a valid date in ISO 8601 format")
    .notEmpty()
    .withMessage("Arrived date is required"),

  body("discount_cost")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Discount cost must be a number greater than or equal to 0"),
];
