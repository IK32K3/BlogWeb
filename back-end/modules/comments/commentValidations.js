const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Get comments by post validation
const getCommentsByPostValidation = [
  [
    new ParamWithLocale('postId').notEmpty().isNumberic().get(),
    new QueryWithLocale('page').isNumberic().get(),
    new QueryWithLocale('limit').isNumberic().get()
  ]
];

// Add comment validation
const addCommentValidation = [
  [
    new ParamWithLocale('postId').notEmpty().isNumberic().get(),
    new BodyWithLocale('content').notEmpty().get()
  ]
];

// Update comment validation
const updateCommentValidation = [
  [
    new ParamWithLocale('commentId').notEmpty().isNumberic().get(),
    new BodyWithLocale('content').notEmpty().get()
  ]
];

// Delete comment validation
const deleteCommentValidation = [
  [
    new ParamWithLocale('commentId').notEmpty().isNumberic().get()
  ]
];

// Get my comments validation
const getMyCommentsValidation = [
  [
    new QueryWithLocale('page').isNumberic().get(),
    new QueryWithLocale('limit').isNumberic().get()
  ]
];

module.exports = {
  getCommentsByPostValidation,
  addCommentValidation,
  updateCommentValidation,
  deleteCommentValidation,
  getMyCommentsValidation
};