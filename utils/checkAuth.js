import jwt from "jsonwebtoken";

//функция для проверки токена jwt
export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  if (token) {
    try {
      //расшифровка токена
      const decoded = jwt.verify(token, "bongojambo");
      //в него вшит id из mongo
      req.userId = decoded._id;

      //возвращает что-то, без этого в родительской функции дальше не пойдет
      next();
    } catch (error) {
      return req.status(403).json({
        message: "Нет доступа",
      });
    }
  } else {
    return req.status(403).json({
      message: "Нет доступа",
    });
  }
};
