const db = require("../db/connection.js");

exports.selectReviews = async (sort_by = "created_at") => {
  const sort_byWhitelist = [
    "owner",
    "title",
    "review_id",
    "review_img_url",
    "category",
    "created_at",
    "votes",
    "comment_count",
  ];

  if (!sort_byWhitelist.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  const sql = `SELECT owner, title, reviews.review_id, review_img_url, category, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
  FROM reviews
  LEFT JOIN comments ON reviews.review_id = comments.review_id
  GROUP BY reviews.review_id
  ORDER BY reviews.${sort_by} ASC
  ;`;

  const reviews = await db.query(sql);
  return reviews.rows;
};

exports.selectReviewById = async (review_id) => {
  const review = await db.query(
    `SELECT owner, title, reviews.review_id, review_body, designer, review_img_url, category, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id
    ;`,
    [review_id]
  );

  return review.rows[0];
};

exports.updateReview = async (inc_votes, review_id) => {
  const review = await db.query(
    `UPDATE reviews
    SET votes = votes + $1
    WHERE review_id = $2
    RETURNING *
    ;`,
    [inc_votes, review_id]
  );

  return review.rows[0];
};
