import CommentModel from "../models/Comment.js";

export const create = async (req, res) => {
  try {
    //делаем новый документ и сохраняем в базу
    const doc = new CommentModel({
      text: req.body.text,
      user: req.userId,
      post: req.body.postId,
    });

    const comment = await doc.save();
    res.json(comment);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось создать комментарий",
    });
  }
};

//возвращает комментарии к выбранной статье (по ее id)
export const getAll = async (req, res) => {
  try {
    const postId = req.params.postId;
    console.log(postId);

    const comments = await CommentModel.find({ post: postId })
      .populate("user")
      .exec();

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Не удалось получить комментарии",
    });
  }
};
