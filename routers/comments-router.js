const commentsRouter = require("express").Router();
const {
  deleteComment,
  patchComment,
} = require("../controllers/comments.controllers");
const { handleInvalidMethod } = require("../errors/errors");

commentsRouter
  .route("/:comment_id")
  .delete(deleteComment)
  .patch(patchComment)
  .all(handleInvalidMethod);

module.exports = commentsRouter;
