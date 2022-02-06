const req = require("express/lib/request");
const { removeComment, updateComment } = require("../models/comments.models");

exports.deleteComment = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    const comment = await removeComment(comment_id);

    if (comment) {
      res.sendStatus(204);
    } else {
      throw { status: 404, msg: "Id not found" };
    }
  } catch (err) {
    next(err);
  }
};

exports.patchComment = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    const { inc_votes, body } = req.body;

    const comment = await updateComment(comment_id, body, inc_votes);

    if (comment) {
      res.status(200).send({ comment });
    } else {
      throw { status: 404, msg: "Id not found" };
    }
  } catch (err) {
    next(err);
  }
};
