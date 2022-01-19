const db = require("../db/connection.js");

exports.selectReviews = async (
  sort_by = "created_at",
  order = "ASC",
  category = "%"
) => {
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
    sort_by = "created_at";
  }

  if (order.toUpperCase() !== "DESC") {
    order = "ASC";
  }

  const categorySections = category.split("'");
  category = categorySections.join("''");

  if (sort_by !== "comment_count") sort_by = "reviews." + sort_by;

  const sql = `SELECT owner, title, reviews.review_id, review_img_url, category, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
  FROM reviews
  LEFT JOIN comments ON reviews.review_id = comments.review_id
  WHERE category ILIKE '${category}'
  GROUP BY reviews.review_id
  ORDER BY ${sort_by} ${order}
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

exports.selectCommentsByReviewId = async (review_id) => {
  const comments = await db.query(
    `SELECT comment_id, votes, created_at, author, body
    FROM comments
    WHERE review_id = $1
    ;`,
    [review_id]
  );

  return comments.rows;
};

exports.insertComment = async (review_id, username, body) => {
  const comment = await db.query(
    `INSERT INTO comments
      (review_id, author, body)
      VALUES ($1, $2, $3)
      RETURNING *
      ;`,
    [review_id, username, body]
  );

  return comment.rows[0];
};
