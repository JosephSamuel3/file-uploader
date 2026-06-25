import { body } from "express-validator";

const nameValidator = body("name")
  .trim()
  .notEmpty()
  .withMessage("Name is required.")
  .isLength({ max: 255 })
  .withMessage("Name must be 255 characters or fewer.");

export { nameValidator };
