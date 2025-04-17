// Assuming 'kernels/rules' provides classes similar to express-validator
// where .optional() allows subsequent validation methods to be chained,
// and methods like isNumeric, isSlug, isBoolean, etc., are correctly implemented.
const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Common validation rules reusable across different validation sets
const commonRules = {
  title: new BodyWithLocale('title').notEmpty().isLength({ min: 3, max: 300 }),
  content: new BodyWithLocale('content').notEmpty(),
  description: new BodyWithLocale('description').notEmpty().isLength({ min: 10, max: 500 }),
  categoryId: new BodyWithLocale('category_id').notEmpty().isNumeric(),
  postId: new ParamWithLocale('id').notEmpty().isNumeric(),
  mediaId: new BodyWithLocale('media_id').optional().isNumeric(), // Usually optional unless required for specific actions
  languageId: new BodyWithLocale('language_id').optional().isNumeric(), // Often part of translations array
  slug: new ParamWithLocale('slug').notEmpty().isSlug() // Ensure isSlug handles non-empty internally or chain .notEmpty()
};

// --- Validation Sets for Different Routes ---

// [GET] /posts/search
const searchPostsValidation = [
  // Use .get() to extract the underlying express-validator chain for the route middleware
  [
    new QueryWithLocale('query').optional().isString().trim().isLength({ min: 2, max: 100 }).get(), // Optional query term
    new QueryWithLocale('page').optional().isInt({ min: 1 }).toInt().default(1).get(), // Sanitize to integer
    new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(10).get(), // Sanitize to integer
    new QueryWithLocale('category_id').optional().isNumeric().toInt().get(), // Sanitize to integer
    new QueryWithLocale('user_id').optional().isNumeric().toInt().get(), // Sanitize to integer
    new QueryWithLocale('status').optional().isIn(['draft', 'published', 'archived']).get(), // Allowed statuses for search
    new QueryWithLocale('sort').optional().isIn([
      'newest',
      'oldest',
      'most_viewed'
      // Add other valid sort options if needed
    ]).default('newest').get(),
    new QueryWithLocale('date_from').optional().isISO8601().toDate().get(), // Sanitize to Date object
    new QueryWithLocale('date_to').optional().isISO8601().toDate().get() // Sanitize to Date object
  ]
];

// [POST] /posts
const createPostValidation = [
  [
    commonRules.title.get(),
    commonRules.content.get(),
    commonRules.description.get(),
    commonRules.categoryId.get(), // category_id is required on creation
    new BodyWithLocale('media_ids').optional().isArray().withMessage('Media IDs must be an array').get(),
    // Further validation: Check if elements in media_ids are numeric
    new BodyWithLocale('media_ids.*').optional().isNumeric().toInt().get(),
    new BodyWithLocale('featured_media_id').optional().isNumeric().toInt().get(),
    new BodyWithLocale('translations').optional().isArray().withMessage('Translations must be an array').get(),
    // TODO: Consider nested validation for translations array elements if structure is fixed
    // e.g., body('translations.*.language_id').notEmpty().isNumeric()
    // e.g., body('translations.*.title').notEmpty().isString()
    new BodyWithLocale('status').optional().isIn(['draft', 'published', 'scheduled']).default('draft').get(),
    // NOTE: Conditional validation: 'scheduled_at' should be required if status is 'scheduled'.
    // This often needs custom logic or handling in the controller/service after basic validation.
    new BodyWithLocale('scheduled_at').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate().get(),
    new BodyWithLocale('tags').optional().isArray().withMessage('Tags must be an array').get(),
    // TODO: Consider nested validation for tags array elements
    // e.g., body('tags.*').notEmpty().isString().trim()
  ]
];

// [PUT] /posts/:id
const updatePostValidation = [
  [
    commonRules.postId.get(), // Validate the route parameter 'id'
    // All body fields are optional for update (PATCH/PUT)
    new BodyWithLocale('title').optional().isLength({ min: 3, max: 300 }).get(),
    new BodyWithLocale('content').optional().notEmpty().get(), // Use notEmpty() if empty string shouldn't be allowed for update
    new BodyWithLocale('description').optional().notEmpty().isLength({ min: 10, max: 500 }).get(),
    new BodyWithLocale('category_id').optional().isNumeric().toInt().get(),
    new BodyWithLocale('media_ids').optional().isArray().withMessage('Media IDs must be an array').get(),
    new BodyWithLocale('media_ids.*').optional().isNumeric().toInt().get(),
    new BodyWithLocale('featured_media_id').optional({ nullable: true, checkFalsy: true }).isNumeric().toInt().get(), // Allow null/empty to unset
    new BodyWithLocale('translations').optional().isArray().withMessage('Translations must be an array').get(),
    // TODO: Consider nested validation for translations array elements
    new BodyWithLocale('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']).get(),
    // NOTE: Conditional validation: 'scheduled_at' might need validation based on 'status'.
    new BodyWithLocale('scheduled_at').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate().get(),
    new BodyWithLocale('tags').optional().isArray().withMessage('Tags must be an array').get(),
     // TODO: Consider nested validation for tags array elements
  ]
];

// [GET] /posts/:id
const getPostByIdValidation = [
  [
    commonRules.postId.get()
  ]
];

// [GET] /posts/slug/:slug
const getPostBySlugValidation = [
  [
    commonRules.slug.get()
  ]
];

// [DELETE] /posts/:id
const deletePostValidation = [
  [
    commonRules.postId.get()
  ]
];

// [GET] /posts/category/:categoryId
const getPostsByCategoryValidation = [
  [
    new ParamWithLocale('categoryId').notEmpty().isNumeric().toInt().get(), // Validate param & sanitize
    new QueryWithLocale('page').optional().isInt({ min: 1 }).toInt().default(1).get(),
    new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(10).get()
  ]
];

// [GET] /posts
const getAllPostsValidation = [
  [
    new QueryWithLocale('page').optional().isInt({ min: 1 }).toInt().default(1).get(),
    new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(10).get(),
    new QueryWithLocale('category_id').optional().isNumeric().toInt().get(),
    new QueryWithLocale('user_id').optional().isNumeric().toInt().get(),
    new QueryWithLocale('search').optional().isString().trim().isLength({ min: 2, max: 50 }).get(),
    new QueryWithLocale('sort').optional().isIn([
      'latest', // Default
      'oldest',
      'most_viewed',
      'title_asc',
      'title_desc'
    ]).default('latest').get(),
    new QueryWithLocale('status').optional().isIn([
      'all', // Might need special handling in service/controller
      'published', // Default
      'draft',
      'scheduled',
      'archived'
    ]).default('published').get(),
    // Tags: Handling depends on format (comma-separated string vs. array params)
    // Option 1: Comma-separated string: .optional().isString().customSanitizer(v => v.split(',').map(t => t.trim()))
    // Option 2: Array params (?tags=a&tags=b): .optional().isArray()
    // Option 3: Keep simple, parse in controller/service:
    new QueryWithLocale('tags').optional().get()
  ]
];

// [GET] /posts/my
const getMyPostsValidation = [
  [
    new QueryWithLocale('page').optional().isInt({ min: 1 }).toInt().default(1).get(),
    new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(10).get(),
    // Use toBoolean() sanitizer for query params representing booleans
    new QueryWithLocale('include_drafts').optional().toBoolean().isBoolean().default(false).get()
  ]
];

// [GET] /posts/author/:userId
const getPostsByAuthorValidation = [
  [
    new ParamWithLocale('userId').notEmpty().isNumeric().toInt().get(), // Validate param & sanitize
    new QueryWithLocale('page').optional().isInt({ min: 1 }).toInt().default(1).get(),
    new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(10).get(),
    new QueryWithLocale('status').optional().isIn(['draft', 'published', 'archived']).get(), // Controller enforces access control
    new QueryWithLocale('sort').optional().isIn([
      'newest', // Default
      'oldest',
      'most_viewed'
    ]).default('newest').get()
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
  getMyPostsValidation,
  searchPostsValidation,
  getPostsByAuthorValidation,
  // commonRules // Usually not exported directly unless needed elsewhere
};