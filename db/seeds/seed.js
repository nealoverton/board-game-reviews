const db = require("../connection");
const format = require("pg-format");
const {
  formatCategories,
  formatUsers,
  formatReviews,
  formatComments,
} = require("./seed-formatting");

const seed = (data) => {
  const { categoryData, commentData, reviewData, userData } = data;
  // 1. create tables
  return db
    .query(`DROP TABLE IF EXISTS categories, users, reviews, comments;`)
    .then(() => {
      return db.query(
        `CREATE TABLE categories(
          slug VARCHAR(50) PRIMARY KEY,
          description VARCHAR(100) NOT NULL
        );`
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE users(
          username VARCHAR(50) PRIMARY KEY,
          avatar_url VARCHAR(2000) NOT NULL,
          name VARCHAR(50) NOT NULL
        );`
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE reviews(
          review_id SERIAL PRIMARY KEY,
          title VARCHAR(2000) NOT NULL,
          review_body TEXT NOT NULL,
          designer VARCHAR(100) NOT NULL,
          review_img_url VARCHAR(2000) DEFAULT 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
          votes INT DEFAULT 0,
          category VARCHAR(50) NOT NULL REFERENCES categories(slug),
          owner VARCHAR(50) NOT NULL REFERENCES users(username),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE comments(
          comment_id SERIAL PRIMARY KEY,
          author VARCHAR(50) NOT NULL REFERENCES users(username),
          review_id INT NOT NULL REFERENCES reviews(review_id),
          votes INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          body TEXT NOT NULL
        );`
      );
    })
    .then(() => {
      const formattedCategories = formatCategories(categoryData);
      const sql = format(
        `INSERT INTO categories
        (slug, description)
        VALUES %L
        RETURNING *
        ;`,
        formattedCategories
      );

      return db.query(sql);
    })
    .then(() => {
      const formattedUsers = formatUsers(userData);
      const sql = format(
        `INSERT INTO users
        (username, avatar_url, name)
        VALUES %L
        RETURNING *
        ;`,
        formattedUsers
      );

      return db.query(sql);
    })
    .then(() => {
      const formattedReviews = formatReviews(reviewData);
      const sql = format(
        `INSERT INTO reviews
        (title, review_body, designer, review_img_url, votes, category, owner, created_at)
        VALUES %L
        RETURNING *
        ;`,
        formattedReviews
      );

      return db.query(sql);
    })
    .then(() => {
      const formattedComments = formatComments(commentData);
      const sql = format(
        `INSERT INTO comments
        (author, review_id, votes, created_at, body)
        VALUES %L
        RETURNING *
        ;`,
        formattedComments
      );

      return db.query(sql);
    })
    .catch((err) => {
      console.log(err);
    });
  // 2. insert data
};

module.exports = seed;
