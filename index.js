import express from "express";
import multer from "multer";
import cors from "cors";
import mongoose from "mongoose";

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./validations/validation.js";

//содержат основные функции-обработчики запросов
import { UserController, PostController } from "./controllers/index.js";
//доп функции для работы с запросами
import { checkAuth, handleValidationErrors } from "./utils/index.js";

//подключение к монго
mongoose
  .connect("mongodb://localhost:27017/newdb")
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => console.log("Database fail", err));

const app = express();

//хранилище файлов через multer, картинки
const storage = multer.diskStorage({
  //возвращает путь этого файла
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  //перед сохранением указывает название файла
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.use(express.json());
//это чтобы с localhost на localhost делать запросы
app.use(cors());
//если приходит запрос на uploads, проверяем, есть ли в папке uploads нужный файл
app.use("/uploads", express.static("uploads"));

//просто главная страница
app.get("/", (request, response) => {
  response.send("Hello Clientovich!!");
});

//регистрация
//проверка через валидатор по запросу, если ок, то выполняется дальше
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);

//авторизация
app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);

//получение информации о юзере, но сначала проверка авторизации через checkAuth
app.get("/auth/me", checkAuth, UserController.getMe);

//если приходит запрос на загрузку, то ожидаем файл image (он так помечен в insomnia через multipart)
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  //возвращаем в response путь сохранения картинки
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

//получить теги
app.get("/tags", PostController.getLastTags);

//роуты для запросов на статьи
//получить все статьи
app.get("/posts", PostController.getAll);
//запостить новую статью
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);
//получить определенную статью
app.get("/posts/:id", PostController.getOne);
//удалить статью
app.delete("/posts/:id", checkAuth, PostController.remove);
//обновить статью
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

//при запуске сервера
app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server started!!");
});
