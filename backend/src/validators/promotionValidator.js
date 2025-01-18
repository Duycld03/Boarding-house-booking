import { body } from "express-validator";

export const createPromotionValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("description").isString().withMessage("Description must be a string"),

  body("discount_rate")
    .notEmpty()
    .withMessage("Discount rate is required")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount rate must be a number between 0 and 100"),

  body("start_Date")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => new Date(value) > new Date(req.body.start_Date))
    .withMessage("End date must be later than start date"),
];

export const updatePromotionValidator = [
  body("name").optional().isString().withMessage("Name must be a string"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("discount_rate")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount rate must be a number between 0 and 100"),

  body("start_Date")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => new Date(value) > new Date(req.body.start_Date))
    .withMessage("End date must be later than start date"),
];
