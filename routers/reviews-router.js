const reviewsRouter = require("express").Router();
const {
  getReviews,
  getReviewById,
  postReview,
  patchReview,
  deleteReview,
  getCommentsByReviewId,
  postComment,
} = require("../controllers/reviews.controllers");
const { handleInvalidMethod } = require("../errors/errors");

reviewsRouter
  .route("/")
  .get(getReviews)
  .post(postReview)
  .all(handleInvalidMethod);

reviewsRouter
  .route("/:review_id")
  .get(getReviewById)
  .patch(patchReview)
  .delete(deleteReview)
  .all(handleInvalidMethod);

reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postComment)
  .all(handleInvalidMethod);

module.exports = reviewsRouter;
