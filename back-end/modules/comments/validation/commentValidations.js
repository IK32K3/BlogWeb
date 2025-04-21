const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Get comments by post validation
const getCommentsByPostValidation = [
  [
    new ParamWithLocale('postId').notEmpty().isNumeric().get(),
    new QueryWithLocale('page').isNumeric().get(),
    new QueryWithLocale('limit').isNumeric().get()
  ]
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

// Delete comment validation
const deleteCommentValidation = [
  [
    new ParamWithLocale('commentId').notEmpty().isNumeric().get()
  ]
];

// Get my comments validation
const getMyCommentsValidation = [
  [
    new QueryWithLocale('page').isNumeric().get(),
    new QueryWithLocale('limit').isNumeric().get()
  ]
];

module.exports = {
  getCommentsByPostValidation,
  addCommentValidation,
  updateCommentValidation,
  deleteCommentValidation,
  getMyCommentsValidation
};