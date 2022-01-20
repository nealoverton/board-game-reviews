const {
  selectCategories,
  countTotalCategories,
} = require("../models/categories.models");

exports.getCategories = async (req, res, next) => {
  try {
    const { limit, p } = req.query;
    const categories = await selectCategories(limit, p);
    const total_count = await countTotalCategories();
    const response = { categories, total_count };

    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
};
