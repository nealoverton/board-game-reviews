const apiRouter = require("express").Router();
const categoriesRouter = require("./categories-router");
const usersRouter = require("./users-router");
const commentsRouter = require("./comments-router");
const reviewsRouter = require("./reviews-router");
const { getEndpoints } = require("../controllers/api.controllers");
const { handleInvalidMethod } = require("../errors/errors");

apiRouter.route("/").get(getEndpoints).all(handleInvalidMethod);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
