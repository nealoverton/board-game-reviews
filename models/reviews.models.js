const db = require("../db/connection.js");

exports.countTotalReviews = async (category = "%") => {
  const categorySections = category.split("'");
  category = categorySections.join("''");

  const sql = `SELECT COUNT(review_id) AS total_count 
    FROM reviews
    WHERE category ILIKE '${category}'
  ;`;

  const total_count = await db.query(sql);
  return total_count.rows[0].total_count;
};

exports.countTotalComments = async (review_id) => {
  const sql = `SELECT COUNT(comment_id) AS total_count 
    FROM comments
    WHERE review_id = ${review_id}
  ;`;

  const total_count = await db.query(sql);
  return total_count.rows[0].total_count;
};

exports.selectReviews = async (
  sort_by = "created_at",
  order = "ASC",
  category = "%",
  limit = 10,
  p = 1
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
  const offset = (p - 1) * limit;

  if (!sort_byWhitelist.includes(sort_by)) {
    sort_by = "created_at";
  }

  if (order.toUpperCase() !== "DESC") {
    order = "ASC";
  }

  const categorySections = category.split("'");
  category = categorySections.join("''");

  if (sort_by !== "comment_count") sort_by = "reviews." + sort_by;

  let sql = `SELECT owner, title, reviews.review_id, review_img_url, category, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
  FROM reviews
  LEFT JOIN comments ON reviews.review_id = comments.review_id
  WHERE category ILIKE '${category}'
  GROUP BY reviews.review_id
  ORDER BY ${sort_by} ${order}
  LIMIT ${limit}
  OFFSET ${offset}
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

exports.selectCommentsByReviewId = async (review_id, limit = 10, p = 1) => {
  const offset = (p - 1) * limit;

  const comments = await db.query(
    `SELECT comment_id, votes, created_at, author, body
    FROM comments
    WHERE review_id = $1
    LIMIT $2
    OFFSET $3
    ;`,
    [review_id, limit, offset]
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
