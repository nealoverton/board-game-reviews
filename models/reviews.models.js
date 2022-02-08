const db = require("../db/connection.js");

exports.countTotalReviews = async (category = "%", owner = "%") => {
  const categorySections = category.split("'");
  category = categorySections.join("''");
  const ownerSections = owner.split("'");
  owner = ownerSections.join("''");

  const sql = `SELECT COUNT(review_id) AS total_count 
    FROM reviews
    WHERE category ILIKE '${category}'
    AND reviews.owner ILIKE '${owner}'
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
  order = "DESC",
  category = "%",
  owner = "%",
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

  if (order.toUpperCase() !== "ASC") {
    order = "DESC";
  }

  const categorySections = category.split("'");
  category = categorySections.join("''");
  const ownerSections = owner.split("'");
  owner = ownerSections.join("''");

  if (sort_by !== "comment_count") sort_by = "reviews." + sort_by;

  let sql = `SELECT owner, title, reviews.review_id, review_img_url, category, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
  FROM reviews
  LEFT JOIN comments ON reviews.review_id = comments.review_id
  WHERE category ILIKE '${category}'
  AND reviews.owner ILIKE '${owner}'
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

exports.insertReview = async (
  owner,
  title,
  review_body,
  designer,
  category
) => {
  const review = await db.query(
    `INSERT INTO reviews
    (owner, title, review_body, designer, category)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING owner, title, review_body, designer, category, review_id, votes, created_at
    ;`,
    [owner, title, review_body, designer, category]
  );

  return review.rows[0];
};

exports.updateReview = async (inc_votes = 0, review_body, review_id) => {
  let bodyUpdate = "";
  if (review_body) {
    const reviewBodySections = review_body.split("'");
    review_body = reviewBodySections.join("''");
    bodyUpdate = `, review_body = '${review_body}'`;
  }

  const sql = `UPDATE reviews
  SET votes = votes + $1${bodyUpdate}
  WHERE review_id = $2
  RETURNING *
  ;`;

  const review = await db.query(sql, [inc_votes, review_id]);

  return review.rows[0];
};

exports.removeReview = async (review_id) => {
  const review = await db.query(
    `DELETE FROM reviews
    WHERE review_id = $1
    RETURNING *
    ;`,
    [review_id]
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
