const {
  selectReviewById,
  updateReview,
  selectReviews,
} = require("../models/reviews.models");

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await selectReviews();
    res.status(200).send({ reviews });
  } catch (err) {
    next(err);
  }
};

exports.getReviewById = async (req, res, next) => {
  try {
    const { review_id } = req.params;
    const review = await selectReviewById(review_id);
    if (review) {
      res.status(200).send({ review });
    } else {
      throw { status: 404, msg: "Id not found" };
    }
  } catch (err) {
    next(err);
  }
};

exports.patchReview = async (req, res, next) => {
  try {
    const { inc_votes } = req.body;
    const { review_id } = req.params;
    const review = await updateReview(inc_votes, review_id);

    if (review) {
      res.status(200).send({ review });
    } else {
      throw { status: 404, msg: "Id not found" };
    }
  } catch (err) {
    next(err);
  }
};
