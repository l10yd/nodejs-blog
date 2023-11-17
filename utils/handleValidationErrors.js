import { validationResult } from "express-validator/src/validation-result.js";

//если валидация не прошла, возвращает ошибки, иначе продвигает дальше
export default (req, res, next) => {
  const errors = validationResult(req);
  //если есть ошибки, возвращается 400
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  next();
};
