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
const { selectUsers } = require("../models/users.models");
const {
  flagReviewIdInvalidity,
  flagUnlistedUser,
} = require("../utils/format-checkers");

exports.getReviews = async (req, res, next) => {
  try {
    const { sort_by, order, category, owner, limit, p } = req.query;

    if (/;/.test(category)) throw { status: 400, msg: "No ; allowed" };
    if (category) {
      const existingCategories = await selectCategories();
      const validCategoryNames = existingCategories.map((obj) => {
        return obj.slug;
      });
      if (!validCategoryNames.includes(category)) {
        throw { status: 404, msg: "Category not found" };
      }
    }

    const userUnlisted = await flagUnlistedUser(owner);
    if (userUnlisted) throw userUnlisted;

    const reviews = await selectReviews(
      sort_by,
      order,
      category,
      owner,
      limit,
      p
    );
    const total_count = await countTotalReviews(category, owner);
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
    const { inc_votes, review_body } = req.body;
    const { review_id } = req.params;

    if (inc_votes && isNaN(inc_votes))
      throw { status: 400, msg: "Bad request" };

    const review = await updateReview(inc_votes, review_body, review_id);

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

    const invalidReviewId = await flagReviewIdInvalidity(review_id);
    if (invalidReviewId) throw invalidReviewId;

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

    const invalidReviewId = await flagReviewIdInvalidity(review_id);
    if (invalidReviewId) throw invalidReviewId;

    if (!username || !body) {
      throw { status: 400, msg: "Bad request" };
    }

    const userUnlisted = await flagUnlistedUser(username);
    if (userUnlisted) throw userUnlisted;

    const comment = await insertComment(review_id, username, body);
    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};
