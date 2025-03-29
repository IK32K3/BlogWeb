const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Create post validation
const createPostValidation = [
  [
    new BodyWithLocale('title').notEmpty().isLength({ min: 3, max: 300 }).get(),
    new BodyWithLocale('content').notEmpty().get(),
    new BodyWithLocale('description').notEmpty().get(),
    new BodyWithLocale('category_id').notEmpty().isNumberic().get()
  ]
];

// Update post validation
const updatePostValidation = [
  [
    new ParamWithLocale('id').notEmpty().isNumberic().get(),
    new BodyWithLocale('title').isLength({ min: 3, max: 300 }).get(),
    new BodyWithLocale('category_id').isNumberic().get()
  ]
];

// Get post by ID validation
const getPostByIdValidation = [
  [
    new ParamWithLocale('id').notEmpty().isNumberic().get()
  ]
];

// Delete post validation
const deletePostValidation = [
  [
    new ParamWithLocale('id').notEmpty().isNumberic().get()
  ]
];

// Get posts by category validation
const getPostsByCategoryValidation = [
  [
    new ParamWithLocale('categoryId').notEmpty().isNumberic().get(),
    new QueryWithLocale('page').isNumberic().get(),
    new QueryWithLocale('limit').isNumberic().get()
  ]
];

// Get all posts validation (for pagination and filters)
const getAllPostsValidation = [
  [
    new QueryWithLocale('page').isNumberic().get(),
    new QueryWithLocale('limit').isNumberic().get(),
    new QueryWithLocale('category_id').isNumberic().get(),
    new QueryWithLocale('user_id').isNumberic().get()
  ]
];

module.exports = {
  createPostValidation,
  updatePostValidation,
  getPostByIdValidation,
  deletePostValidation,
  getPostsByCategoryValidation,
  getAllPostsValidation
};