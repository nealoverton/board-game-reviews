const {
  selectCategories,
  countTotalCategories,
  insertCategory,
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

exports.postCategory = async (req, res, next) => {
  try {
    const { slug, description } = req.body;
    if (/;/.test(slug)) throw { status: 400, msg: "No ; allowed" };
    const category = await insertCategory(slug, description);
    res.status(201).send({ category });
  } catch (err) {
    next(err);
  }
};
