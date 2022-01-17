exports.formatCategories = (categoryData) => {
  const formattedCategories = categoryData.map((category) => [
    category.slug,
    category.description,
  ]);

  return formattedCategories;
};

exports.formatUsers = (userData) => {
  const formattedUsers = userData.map((user) => [
    user.username,
    user.avatar_url,
    user.name,
  ]);

  return formattedUsers;
};

exports.formatReviews = (reviewData) => {
  const formattedReviews = reviewData.map((review) => [
    review.title,
    review.review_body,
    review.designer,
    review.review_img_url,
    review.votes,
    review.category,
    review.owner,
    review.created_at,
  ]);

  return formattedReviews;
};

exports.formatComments = (commentData) => {
  const formattedComments = commentData.map((comment) => [
    comment.author,
    comment.review_id,
    comment.votes,
    comment.created_at,
    comment.body,
  ]);

  return formattedComments;
};
