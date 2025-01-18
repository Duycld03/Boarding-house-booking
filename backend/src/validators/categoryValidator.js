import { body } from "express-validator";

export const createCategoryValidator = [
  body("parentId")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent category ID format"),

  body("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Category name is required"),
];

export const updateCategoryValidator = [
  body("parentId")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent category ID format"),

  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Category name is required"),
];
