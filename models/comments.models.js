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

exports.updateComment = async (comment_id, body, inc_votes = 0) => {
  let bodyUpdate = "";
  if (body) {
    const bodySections = body.split("'");
    body = bodySections.join("''");
    bodyUpdate = `, body = '${body}'`;
  }

  const sql = `UPDATE comments
  SET votes = votes + $2${bodyUpdate}
  WHERE comment_id = $1
  RETURNING *
  ;`;

  const comment = await db.query(sql, [comment_id, inc_votes]);

  return comment.rows[0];
};
