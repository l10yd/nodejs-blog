import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//подключение к монго
mongoose
  .connect(
    "mongodb+srv://admin:admin@cluster0.gkzp9u2.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => console.log("Database fail", err));

const app = express();

app.use(express.json());

app.get("/", (request, response) => {
  response.send("Hello Clientovich!!");
});

app.post("/auth/login", (req, res) => {
  console.log(req.body);

  //шифруем реквест в токен и отправляем обратно
  const token = jwt.sign(
    {
      email: req.body.email,
      fullName: "Gena",
    },
    "kluch-kluchik"
  );

  res.json({
    success: true,
    token,
  });
});

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server started!!");
});
