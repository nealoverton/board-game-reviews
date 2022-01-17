const db = require("../connection");
const format = require("pg-format");
const {
  formatCategories,
  formatUsers,
  formatReviews,
  formatComments,
} = require("./seed-formatting");

const seed = async (data) => {
  const { categoryData, commentData, reviewData, userData } = data;

  await db.query(`DROP TABLE IF EXISTS categories, users, reviews, comments;`);

  await db.query(
    `CREATE TABLE categories(
          slug VARCHAR(255) PRIMARY KEY,
          description VARCHAR(255) NOT NULL
        );`
  );
  await db.query(
    `CREATE TABLE users(
          username VARCHAR(255) PRIMARY KEY,
          avatar_url VARCHAR(2000) NOT NULL,
          name VARCHAR(255) NOT NULL
        );`
  );
  await db.query(
    `CREATE TABLE reviews(
          review_id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          review_body TEXT NOT NULL,
          designer VARCHAR(255) NOT NULL,
          review_img_url VARCHAR(2000) DEFAULT 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
          votes INT DEFAULT 0,
          category VARCHAR(255) NOT NULL REFERENCES categories(slug),
          owner VARCHAR(255) NOT NULL REFERENCES users(username),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`
  );

  await db.query(
    `CREATE TABLE comments(
          comment_id SERIAL PRIMARY KEY,
          author VARCHAR(255) NOT NULL REFERENCES users(username),
          review_id INT NOT NULL REFERENCES reviews(review_id),
          votes INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          body TEXT NOT NULL
        );`
  );

  const formattedCategories = formatCategories(categoryData);
  const categoriesSql = format(
    `INSERT INTO categories
        (slug, description)
        VALUES %L
        RETURNING *
        ;`,
    formattedCategories
  );

  await db.query(categoriesSql);

  const formattedUsers = formatUsers(userData);
  const usersSql = format(
    `INSERT INTO users
        (username, avatar_url, name)
        VALUES %L
        RETURNING *
        ;`,
    formattedUsers
  );

  await db.query(usersSql);

  const formattedReviews = formatReviews(reviewData);
  const reviewsSql = format(
    `INSERT INTO reviews
        (title, review_body, designer, review_img_url, votes, category, owner, created_at)
        VALUES %L
        RETURNING *
        ;`,
    formattedReviews
  );

  await db.query(reviewsSql);

  const formattedComments = formatComments(commentData);
  const commentsSql = format(
    `INSERT INTO comments
        (author, review_id, votes, created_at, body)
        VALUES %L
        RETURNING *
        ;`,
    formattedComments
  );

  await db.query(commentsSql);
};

module.exports = seed;
