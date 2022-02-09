const { selectReviews } = require("../models/reviews.models");
const { selectUsers } = require("../models/users.models");

exports.flagReviewIdInvalidity = async (review_id) => {
  const existingReviews = await selectReviews(
    "created_at",
    "DESC",
    "%",
    "%",
    1000
  );
  const validReviewIds = existingReviews.map((obj) => {
    return obj.review_id;
  });

  if (!isNaN(review_id) && !validReviewIds.includes(parseInt(review_id))) {
    return { status: 404, msg: "Id not found" };
  }
};

exports.flagUnlistedUser = async (username) => {
  const existingUsers = await selectUsers();
  const validUsernames = existingUsers.map((obj) => {
    return obj.username;
  });

  if (username && !validUsernames.includes(username)) {
    throw { status: 404, msg: "Username not found" };
  }
};
