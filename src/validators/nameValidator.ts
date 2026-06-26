import { body } from "express-validator";

const nameValidator = body("name")
  .trim()
  .notEmpty()
  .withMessage("Name is required.")
  .isLength({ max: 255 })
  .withMessage("Name must be 255 characters or fewer.");

export { nameValidator };

const signUpValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").trim().notEmpty().withMessage("Last name is required."),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
];

export { signUpValidator };