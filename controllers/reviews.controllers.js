const { selectCategories } = require("../models/categories.models");
const {
  selectReviewById,
  updateReview,
  selectReviews,
  selectCommentsByReviewId,
  insertComment,
  countTotalReviews,
  countTotalComments,
  insertReview,
  removeReview,
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
    const response = { reviews, total_count };

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

exports.postReview = async (req, res, next) => {
  try {
    const { owner, title, review_body, designer, category } = req.body;
    const review = await insertReview(
      owner,
      title,
      review_body,
      designer,
      category
    );
    review.comment_count = 0;

    res.status(201).send({ review });
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

exports.deleteReview = async (req, res, next) => {
  try {
    const { review_id } = req.params;
    const review = await removeReview(review_id);
    if (review) {
      res.sendStatus(204);
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
    const { limit, p } = req.query;

    const existingReviews = await selectReviews();
    const validReviewIds = existingReviews.map((obj) => {
      return obj.review_id;
    });

    if (!isNaN(review_id) && !validReviewIds.includes(parseInt(review_id))) {
      throw { status: 404, msg: "Id not found" };
    }

    const comments = await selectCommentsByReviewId(review_id, limit, p);
    const total_count = await countTotalComments(review_id);
    const response = { comments, total_count };

    res.status(200).send(response);
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
