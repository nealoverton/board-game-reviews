const db = require("../db/connection.js");

exports.selectUsers = async () => {
  const users = await db.query(`SELECT username FROM users`);
  return users.rows;
};

exports.selectUserByUsername = async (username) => {
  const user = await db.query(
    `SELECT * FROM users
    WHERE username = $1`,
    [username]
  );

  return user.rows[0];
};
