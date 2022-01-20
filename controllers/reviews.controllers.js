const { selectCategories } = require("../models/categories.models");
const {
  selectReviewById,
  updateReview,
  selectReviews,
  selectCommentsByReviewId,
  insertComment,
  countTotalReviews,
} = require("../models/reviews.models");

exports.getReviews = async (req, res, next) => {
  try {
    const { sort_by, order, category, limit, p } = req.query;

    if (category) {
      const existingCategories = await selectCategories();
      const validCategoryNames = existingCategories.map((obj) => {
        return obj.slug;
      });
      if (!validCategoryNames.includes(category)) {
        throw { status: 400, msg: "Invalid category" };
      }
    }

    const reviews = await selectReviews(sort_by, order, category, limit, p);
    const total_count = await countTotalReviews(category);
    const response = {
      reviews: reviews,
      total_count: total_count,
    };

    res.status(200).send(response);
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

    if (!inc_votes) throw { status: 400, msg: "Bad request" };

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

exports.getCommentsByReviewId = async (req, res, next) => {
  try {
    const { review_id } = req.params;

    const existingReviews = await selectReviews();
    const validReviewIds = existingReviews.map((obj) => {
      return obj.review_id;
    });

    if (!isNaN(review_id) && !validReviewIds.includes(parseInt(review_id))) {
      throw { status: 404, msg: "Id not found" };
    }

    const comments = await selectCommentsByReviewId(review_id);
    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};

exports.postComment = async (req, res, next) => {
  try {
    const { review_id } = req.params;
    const { username, body } = req.body;

    if (!username || !body) {
      throw { status: 400, msg: "Bad request" };
    }

    const comment = await insertComment(review_id, username, body);
    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};
