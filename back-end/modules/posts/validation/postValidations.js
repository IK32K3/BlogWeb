const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Common validation rules
const commonRules = {
  title: new BodyWithLocale('title').notEmpty().isLength({ min: 3, max: 300 }),
  content: new BodyWithLocale('content').notEmpty(),
  description: new BodyWithLocale('description').notEmpty().isLength({ min: 10, max: 500 }),
  categoryId: new BodyWithLocale('category_id').notEmpty().isNumeric(),
  postId: new ParamWithLocale('id').notEmpty().isNumeric(),
  mediaId: new BodyWithLocale('media_id').isNumeric(),
  languageId: new BodyWithLocale('language_id').isNumeric(),
  slug: new ParamWithLocale('slug').notEmpty().isSlug()
};
// Search posts validation
const searchPostsValidation = [
  [
    new QueryWithLocale('query').notEmpty().isString().trim().isLength({ min: 2, max: 100 }),
    new QueryWithLocale('page').optional().isInt({ min: 1 }).default(1),
    new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).default(10),
    new QueryWithLocale('category_id').optional().isNumeric(),
    new QueryWithLocale('user_id').optional().isNumeric(),
    new QueryWithLocale('status').optional().isIn(['draft', 'published', 'archived']),
    new QueryWithLocale('sort').optional().isIn([
      'newest', 
      'oldest', 
      'most_viewed'
    ]).default('newest'),
    new QueryWithLocale('date_from').optional().isISO8601(),
    new QueryWithLocale('date_to').optional().isISO8601()
  ]
];
// Create post validation
const createPostValidation = [
  [
    commonRules.title.get(),
    commonRules.content.get(),
    commonRules.description.get(),
    commonRules.categoryId.get(),
    new BodyWithLocale('media_ids').optional().isArray(),
    new BodyWithLocale('featured_media_id').optional().isNumeric(),
    new BodyWithLocale('translations').optional().isArray(),
    new BodyWithLocale('status').optional().isIn(['draft', 'published', 'scheduled']),
    new BodyWithLocale('scheduled_at').optional().isISO8601(),
    new BodyWithLocale('tags').optional().isArray()
  ]
];

// Update post validation
const updatePostValidation = [
  [
    commonRules.postId.get(),
    commonRules.title.optional().get(),
    commonRules.content.optional().get(),
    commonRules.description.optional().get(),
    commonRules.categoryId.optional().get(),
    new BodyWithLocale('media_ids').optional().isArray(),
    new BodyWithLocale('featured_media_id').optional().isNumeric(),
    new BodyWithLocale('translations').optional().isArray(),
    new BodyWithLocale('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']),
    new BodyWithLocale('scheduled_at').optional().isISO8601(),
    new BodyWithLocale('tags').optional().isArray()
  ]
];

// Get post by ID validation
const getPostByIdValidation = [
  [
    commonRules.postId.get()
  ]
];

// Get post by slug validation
const getPostBySlugValidation = [
  [
    commonRules.slug.get()
  ]
];

// Delete post validation
const deletePostValidation = [
  [
    commonRules.postId.get()
  ]
];

// Get posts by category validation
const getPostsByCategoryValidation = [
  [
    new ParamWithLocale('categoryId').notEmpty().isNumeric(),
    new QueryWithLocale('page').optional().isInt({ min: 1 }).default(1),
    new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).default(10)
  ]
];

// Get all posts validation
const getAllPostsValidation = [
  [
    new QueryWithLocale('page').optional().isInt({ min: 1 }).default(1),
    new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).default(10),
    new QueryWithLocale('category_id').optional().isNumeric(),
    new QueryWithLocale('user_id').optional().isNumeric(),
    new QueryWithLocale('search').optional().isString().trim().isLength({ min: 2, max: 50 }),
    new QueryWithLocale('sort').optional().isIn([
      'latest', 
      'oldest', 
      'most_viewed', 
      'title_asc', 
      'title_desc'
    ]).default('latest'),
    new QueryWithLocale('status').optional().isIn([
      'all', 
      'published', 
      'draft', 
      'scheduled', 
      'archived'
    ]).default('published'),
    new QueryWithLocale('tags').optional()
  ]
];

// Get user posts validation
const getUserPostsValidation = [
  [
    new ParamWithLocale('userId').optional().isNumeric(),
    new QueryWithLocale('page').optional().isInt({ min: 1 }).default(1),
    new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).default(10),
    new QueryWithLocale('include_drafts').optional().isBoolean().default(false)
  ]
];

// Get my posts validation
const getMyPostsValidation = [
  [
    new QueryWithLocale('page').optional().isInt({ min: 1 }).default(1),
    new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).default(10),
    new QueryWithLocale('include_drafts').optional().isBoolean().default(false)
  ]
];
const getPostsByAuthorValidation = [
  [
    new ParamWithLocale('userId').notEmpty().isNumeric(),
    new QueryWithLocale('page').optional().isInt({ min: 1 }).default(1),
    new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).default(10),
    new QueryWithLocale('status').optional().isIn(['draft', 'published', 'archived']),
    new QueryWithLocale('sort').optional().isIn([
      'newest', 
      'oldest', 
      'most_viewed'
    ]).default('newest')
  ]
];
module.exports = {
  createPostValidation,
  updatePostValidation,
  getPostByIdValidation,
  getPostBySlugValidation,
  deletePostValidation,
  getPostsByCategoryValidation,
  getAllPostsValidation,
  getUserPostsValidation,
  getMyPostsValidation,
  searchPostsValidation,
  getPostsByAuthorValidation
};