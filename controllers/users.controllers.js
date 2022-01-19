const { selectUsers, selectUserByUsername } = require("../models/users.models");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await selectUsers();
    res.status(200).send({ users });
  } catch (err) {
    next(err);
  }
};

exports.getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await selectUserByUsername(username);

    if (user) {
      res.status(200).send({ user });
    } else {
      throw { status: 404, msg: "User not found" };
    }
  } catch (err) {
    next(err);
  }
};
