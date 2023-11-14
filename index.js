import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";

import { registerValidation } from "./validations/auth.js";
import UserModel from "./models/User.js";

//подключение к монго
mongoose
  .connect("mongodb://localhost:27017/newdb")
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => console.log("Database fail", err));

const app = express();

app.use(express.json());

app.get("/", (request, response) => {
  response.send("Hello Clientovich!!");
});

//авторизация
app.post("/auth/login", async (req, res) => {
  try {
    //по почте ищем юзера (почта уникальная)
    const user = await UserModel.findOne({ email: req.body.email });
    //если нет - то 404 (неверный запрос)
    if (!user) {
      //вообще в целях безопасности не надо уточнять причину ошибки
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    //проверяем, сходятся ли пароли в БД и запросе
    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );
    if (!isValidPass) {
      return res.status(404).json({
        message: "Неверный логин или пароль",
      });
    }

    //создаем токен, он хранится 30 дней
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "bongojambo",
      {
        expiresIn: "30d",
      }
    );

    //отрезаем пароль, чтобы не возвращать его в запросе
    const { passwordHash, ...userData } = user._doc;

    //если все ок, возвращаем информацию:
    res.json({
      ...userData,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось авторизоваться",
    });
  }
});

//регистрация
//проверка через валидатор по запросу, если ок, то выполняется дальше
app.post("/auth/register", registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    //если есть ошибки, возвращается 400
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    //пароль шифруем
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    //создаем документ из реквеста
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });
    //сохраняем документ
    const user = await doc.save();

    //создаем токен, он хранится 30 дней
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "bongojambo",
      {
        expiresIn: "30d",
      }
    );

    //отрезаем пароль, чтобы не возвращать его в запросе
    const { passwordHash, ...userData } = user._doc;

    //если все ок, возвращаем информацию:
    res.json({
      ...userData,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось зарегистрироваться",
    });
  }
});

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server started!!");
});
