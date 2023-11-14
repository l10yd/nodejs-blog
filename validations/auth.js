import { body } from "express-validator";

//проверяет вообще введенные данные
export const registerValidation = [
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  body("fullName").isLength({ min: 3 }),
  body("avatarUrl").optional().isURL(),
];
