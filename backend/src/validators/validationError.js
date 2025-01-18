import { validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const result = validationResult(req).formatWith((error) => ({
    msg: error.msg,
    path: error.path,
  }));

  if (!result.isEmpty()) {
    return res
      .status(422)
      .json({ errors: result.array({ onlyFirstError: true }) });
  }
  next();
};
