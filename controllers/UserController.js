import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator/src/validation-result.js";

import UserModel from "../models/User.js";

import User from "../models/User.js";

export const register = async (req, res) => {
  try {
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
};

export const login = async (req, res) => {
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
};

export const getMe = async (req, res) => {
  try {
    //вытаскиваем пользователя по расшифрованному из токена id
    const user = await User.findById(req.userId);
    //если нет - 404
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }
    //отрезаем пароль, чтобы не возвращать его в запросе
    const { passwordHash, ...userData } = user._doc;

    //если все ок, возвращаем информацию:
    res.json(userData);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};
