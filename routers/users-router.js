const usersRouter = require("express").Router();
const {
  getUsers,
  getUserByUsername,
} = require("../controllers/users.controllers");
const { handleInvalidMethod } = require("../errors/errors");

usersRouter.route("/").get(getUsers).all(handleInvalidMethod);
usersRouter.route("/:username").get(getUserByUsername).all(handleInvalidMethod);

module.exports = usersRouter;
