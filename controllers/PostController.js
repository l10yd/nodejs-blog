import PostModel from "../models/Post.js";

export const create = async (req, res) => {
  try {
    //делаем новый документ и сохраняем в базу
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId,
    });

    const post = await doc.save();
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось создать статью",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    //находим все статьи и заполняем ответ объектом user
    const posts = await PostModel.find().populate("user").exec();
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось получить статьи",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    // Ищем статью, обновляем счетчик просмотров и возвращаем ее
    const updatedPost = await PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        new: true, // to return the updated document
      }
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: "Статья не найдена",
      });
    }

    res.json(updatedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось получить статью",
    });
  }
};
