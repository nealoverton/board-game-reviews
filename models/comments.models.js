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

exports.updateComment = async (comment_id, inc_votes) => {
  const comment = await db.query(
    `UPDATE comments
    SET votes = votes + $2
    WHERE comment_id = $1
    RETURNING *
    ;`,
    [comment_id, inc_votes]
  );

  return comment.rows[0];
};
