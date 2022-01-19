const db = require("../db/connection.js");

exports.removeComment = async (comment_id) => {
  const comment = await db.query(
    `DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *
        ;`,
    [comment_id]
  );

  return comment.rows[0];
};
