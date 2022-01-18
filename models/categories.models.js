const db = require("../db/connection.js");

exports.selectCategories = async () => {
  const categories = await db.query(`SELECT * FROM categories;`);

  return categories.rows;
};
