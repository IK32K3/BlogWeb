const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Common validation rules reusable across different validation sets
// const commonRules = {
//   title: () => new BodyWithLocale('title').notEmpty().isLength({ min: 3, max: 300 }).get(),
//   content: () => new BodyWithLocale('content').notEmpty().isLength({ min: 10, max: 10000 }).get(),
//   description: () => new BodyWithLocale('description').notEmpty().isLength({ min: 10, max: 500 }).get(),
//   categoryId: () => new BodyWithLocale('category_id').notEmpty().isNumeric().get(),
//   postId: () => new ParamWithLocale('id').notEmpty().isNumeric().get(),
//   mediaId: () => new BodyWithLocale('media_id').optional().isNumeric().get(),
//   languageId: () => new BodyWithLocale('language_id').optional().isNumeric().get(),
//   slug: () => new ParamWithLocale('slug').notEmpty().isSlug().get(),
//   status: () => new BodyWithLocale('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']).get(),
//   is_original_post: () => new BodyWithLocale('is_original_post').optional().isBoolean().toBoolean().get(),
//   is_featured: () => new BodyWithLocale('is_featured').optional().isBoolean().toBoolean().get(),
// };

// --- Validation Sets for Different Routes ---

// [GET] /posts/search
const searchPostsValidation = [
  new QueryWithLocale('page').optional().isInt({ min: 1 }).toInt().default(1).get(),
  new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(10).get(),
  new QueryWithLocale('search').optional().isString().trim().isLength({ min: 2, max: 50 }).get(),
  new QueryWithLocale('category_id').optional().isNumeric().toInt().get(),
  // Category ID
  new QueryWithLocale('user_id').optional().isNumeric().toInt().get(),
  // User ID
  new QueryWithLocale('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']).default('published').get(),
  // Post status
  new QueryWithLocale('sort').optional().isIn(['latest', 'oldest', 'most_viewed', 'title_asc', 'title_desc']).default('latest').get(),
  // Sort order
  new QueryWithLocale('tags').optional().isArray().withMessage('Tags must be an array').get(),
];

// [POST] /posts
const createPostValidation = [
  new BodyWithLocale('user_id').notEmpty().isNumeric().toInt().withMessage('User ID must be a number').get(),
  // User ID
  new BodyWithLocale('title').notEmpty().isLength({ min: 3, max: 300 }).withMessage('Title must be between 3 and 300 characters long').get(),
  new BodyWithLocale('content').notEmpty().isLength({ min: 10, max: 10000 }).withMessage('Content must be between 10 and 10000 characters long').get(),
  // Content
  new BodyWithLocale('description').notEmpty().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters long').get(),
  // Description
  new BodyWithLocale('category_id').notEmpty().isNumeric().toInt().withMessage('Category ID must be a number').get(),
  // Category ID
  new BodyWithLocale('media_id').optional().isNumeric().toInt().withMessage('Media ID must be a number').get(),
  // Media ID
  new BodyWithLocale('language_id').optional().isNumeric().toInt().withMessage('Language ID must be a number').get(),
  // Language ID
  new BodyWithLocale('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']).default('draft').withMessage('Status must be one of the following: draft, published, scheduled, archived').get(),
  // Post status
  new BodyWithLocale('is_original_post').optional().isBoolean().toBoolean().withMessage('Is original post must be a boolean').get(),
  // Is original post
  new BodyWithLocale('translations').optional().isArray().withMessage('Translations must be an array').get(),
  // Translations
  new BodyWithLocale('featured_media_id').optional({ nullable: true, checkFalsy: true }).isNumeric().toInt().get(),
  // Featured media ID
  new BodyWithLocale('tags').optional().isArray().withMessage('Tags must be an array').get(),
  // Tags
  new BodyWithLocale('media_ids').optional().isArray().withMessage('Media IDs must be an array').get(),
  // Media IDs
];

// [PUT] /posts/:id
const updatePostValidation = [
  new ParamWithLocale('id').notEmpty().isNumeric().toInt().get(),
  new BodyWithLocale('title').notEmpty().isLength({ min: 3, max: 300 }).withMessage('Title must be between 3 and 300 characters long').get(),
  new BodyWithLocale('content').notEmpty().isLength({ min: 10, max: 10000 }).withMessage('Content must be between 10 and 10000 characters long').get(),
  // Content
  new BodyWithLocale('description').notEmpty().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters long').get(),
  // Description
  new BodyWithLocale('category_id').notEmpty().isNumeric().toInt().withMessage('Category ID must be a number').get(),
  // Category ID
  new BodyWithLocale('media_id').optional().isNumeric().toInt().withMessage('Media ID must be a number').get(),
  // Media ID
  new BodyWithLocale('language_id').optional().isNumeric().toInt().withMessage('Language ID must be a number').get(),
  new BodyWithLocale('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']).default('draft').withMessage('Status must be one of the following: draft, published, scheduled, archived').get(),
  // Post status
  new BodyWithLocale('is_original_post').optional().isBoolean().toBoolean().withMessage('Is original post must be a boolean').get(),
  // Is original post
  new BodyWithLocale('translations').optional().isArray().withMessage('Translations must be an array').get(),
  // Featured media ID
  new BodyWithLocale('tags').optional().isArray().withMessage('Tags must be an array').get(),
  // Tags
  new BodyWithLocale('remove_media_ids').optional().isArray().withMessage('Remove media IDs must be an array').get(),
];

// [GET] /posts/:id
const getPostByIdValidation = [
  // commonRules.postId(),
  new ParamWithLocale('id').notEmpty().isNumeric().toInt().get(),
];

// [GET] /posts/slug/:slug
const getPostBySlugValidation = [
  // commonRules.slug()
  new ParamWithLocale('slug').notEmpty().isSlug().get(),
];

// [DELETE] /posts/:id
const deletePostValidation = [
  // commonRules.postId()
  new ParamWithLocale('id').notEmpty().isNumeric().toInt().get(),
];

// [GET] /posts/category/:categoryId
const getPostsByCategoryValidation = [
  new ParamWithLocale('categoryId').notEmpty().isNumeric().toInt().get(),
  new QueryWithLocale('page').optional().isInt({ min: 1 }).toInt().default(1).get(),
  new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(10).get(),
];

// [GET] /posts
const getAllPostsValidation = [
  new QueryWithLocale('page').optional().isInt({ min: 1 }).toInt().default(1).get(),
  new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(10).get(),
  new QueryWithLocale('category_id').optional().isNumeric().toInt().get(),
  new QueryWithLocale('user_id').optional().isNumeric().toInt().get(),
  new QueryWithLocale('search').optional().isString().trim().isLength({ min: 2, max: 50 }).get(),
  new QueryWithLocale('sort').optional().isIn(['latest', 'oldest', 'most_viewed', 'title_asc', 'title_desc']).default('latest').get(),
  new QueryWithLocale('status').optional().isIn(['all', 'published', 'draft', 'scheduled', 'archived']).default('published').get(),
  new QueryWithLocale('tags').optional().get(),
];

// [GET] /posts/my
const getMyPostsValidation = [
  new QueryWithLocale('page').optional().isInt({ min: 1 }).toInt().default(1).get(),
  new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(10).get(),
  new QueryWithLocale('include_drafts').optional().toBoolean().isBoolean().default(false).get(),
];

// [GET] /posts/author/:userId
const getPostsByAuthorValidation = [
  new ParamWithLocale('userId').notEmpty().isNumeric().toInt().get(),
  new QueryWithLocale('page').optional().isInt({ min: 1 }).toInt().default(1).get(),
  new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(10).get(),
  new QueryWithLocale('status').optional().isIn(['draft', 'published', 'archived']).get(),
  new QueryWithLocale('sort').optional().isIn(['newest', 'oldest', 'most_viewed']).default('newest').get(),
];

module.exports = {
  createPostValidation,
  updatePostValidation,
  getPostByIdValidation,
  getPostBySlugValidation,
  deletePostValidation,
  getPostsByCategoryValidation,
  getAllPostsValidation,
  getMyPostsValidation,
  searchPostsValidation,
  getPostsByAuthorValidation
};