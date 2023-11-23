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

//просто последние 5 комментариев
export const getLast = async (req, res) => {
  try {
    // Update the query to fetch all comments, sort by createdAt, and limit to 5
    const comments = await CommentModel.find()
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .limit(5) // Limit the result to 5 comments
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
