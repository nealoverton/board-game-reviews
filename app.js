const express = require("express");
const {
  handleInvalidUrl,
  handlePsqlErrors,
  handleCustomErrors,
  handleServerErrors,
} = require("./errors/errors.js");
const { getCategories } = require("./controllers/categories.controllers");
const {
  getReviews,
  getReviewById,
  patchReview,
  getCommentsByReviewId,
} = require("./controllers/reviews.controllers");

const app = express();
app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewById);
app.patch("/api/reviews/:review_id", patchReview);

app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);

app.all("*", handleInvalidUrl);

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
