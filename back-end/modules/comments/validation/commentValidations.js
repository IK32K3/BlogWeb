const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Get comments by post validation
const getCommentsByPostValidation = [
  new ParamWithLocale('postId').notEmpty().isNumeric().get(),
  new QueryWithLocale('page').optional().isNumeric().withMessage('Page must be a number').get(),
  new QueryWithLocale('limit').optional().isNumeric().withMessage('Limit must be a number').get()
];

// Add comment validation
const addCommentValidation = [
  new ParamWithLocale('postId').notEmpty().isNumeric().get(),
  new BodyWithLocale('content').notEmpty().get()
];

// Update comment validation
const updateCommentValidation = [
  new ParamWithLocale('commentId').notEmpty().isNumeric().get(),
  new BodyWithLocale('content').notEmpty().get()
];

// Get my comments validation
const getMyCommentsValidation = [
  new QueryWithLocale('page').optional().isNumeric().withMessage('Page must be a number').get(),
  new QueryWithLocale('limit').optional().isNumeric().withMessage('Limit must be a number').get()
];

// Get all comments validation (admin only)
const getAllCommentsValidation = [
  new QueryWithLocale('page').optional().isNumeric().withMessage('Page must be a number').get(),
  new QueryWithLocale('limit').optional().isNumeric().withMessage('Limit must be a number').get()
];

module.exports = {
  getCommentsByPostValidation,
  addCommentValidation,
  updateCommentValidation,
  getMyCommentsValidation,
  getAllCommentsValidation
};
