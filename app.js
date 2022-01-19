const express = require("express");
const { getEndpoints } = require("./controllers/api.controllers");
const { getCategories } = require("./controllers/categories.controllers");
const { deleteComment } = require("./controllers/comments.controllers");
const {
  getReviews,
  getReviewById,
  patchReview,
  getCommentsByReviewId,
  postComment,
} = require("./controllers/reviews.controllers");
const {
  handleInvalidUrl,
  handleInvalidMethod,
  handlePsqlErrors,
  handleCustomErrors,
  handleServerErrors,
} = require("./errors/errors.js");

const app = express();
app.use(express.json());

app.get("/", getEndpoints);

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewById);
app.patch("/api/reviews/:review_id", patchReview);

app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);
app.post("/api/reviews/:review_id/comments", postComment);

app.delete("/api/comments/:comment_id", deleteComment);

app.all("/api", handleInvalidMethod);
app.all("/api/categories", handleInvalidMethod);
app.all("/api/reviews", handleInvalidMethod);
app.all("/api/reviews/:review_id", handleInvalidMethod);
app.all("/api/reviews/:review_id/comments", handleInvalidMethod);
app.all("/api/comments/:comment_id", handleInvalidMethod);

app.all("*", handleInvalidUrl);

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
