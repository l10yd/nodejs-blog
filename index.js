import express from "express";

import mongoose from "mongoose";

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./validations/validation.js";

import checkAuth from "./utils/checkAuth.js";

import * as UserController from "./controllers/UserController.js";
import * as PostController from "./controllers/PostController.js";

//подключение к монго
mongoose
  .connect("mongodb://localhost:27017/newdb")
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => console.log("Database fail", err));

const app = express();

app.use(express.json());

//просто главная страница
app.get("/", (request, response) => {
  response.send("Hello Clientovich!!");
});

//регистрация
//проверка через валидатор по запросу, если ок, то выполняется дальше
app.post("/auth/register", registerValidation, UserController.register);

//авторизация
app.post("/auth/login", loginValidation, UserController.login);

//получение информации о юзере, но сначала проверка авторизации через checkAuth
app.get("/auth/me", checkAuth, UserController.getMe);

//роуты для запросов на статьи
//получить все статьи
app.get("/posts", PostController.getAll);
//запостить новую статью
app.post("/posts", checkAuth, postCreateValidation, PostController.create);
//получить определенную статью
app.get("/posts/:id", PostController.getOne);
/*
app.delete("/posts/", checkAuth, PostController.remove);
app.patch("/posts/:id", checkAuth, PostController.update);*/

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server started!!");
});
