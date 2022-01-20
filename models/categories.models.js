const db = require("../db/connection.js");

exports.selectCategories = async (limit = 10, p = 1) => {
  const offset = (p - 1) * limit;

  const categories = await db.query(
    `SELECT * FROM categories
    LIMIT $1
    OFFSET $2
    ;`,
    [limit, offset]
  );

  return categories.rows;
};

exports.countTotalCategories = async () => {
  const total_count = await db.query(
    `SELECT COUNT(slug) AS total_count 
    FROM categories
    ;`
  );

  return total_count.rows[0].total_count;
};
