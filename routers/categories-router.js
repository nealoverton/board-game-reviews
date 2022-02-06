const categoriesRouter = require("express").Router();
const {
  getCategories,
  postCategory,
} = require("../controllers/categories.controllers");
const { handleInvalidMethod } = require("../errors/errors");

categoriesRouter
  .route("/")
  .get(getCategories)
  .post(postCategory)
  .all(handleInvalidMethod);

module.exports = categoriesRouter;
