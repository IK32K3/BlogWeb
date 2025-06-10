// kernels/rules.js phải export các class con
// Ví dụ:
// const WithLocale = require('./WithLocale');
// class BodyWithLocale extends WithLocale { constructor(field) { super(field, 'body'); } }
// class ParamWithLocale extends WithLocale { constructor(field) { super(field, 'param'); } }
// class QueryWithLocale extends WithLocale { constructor(field) { super(field, 'query'); } }
// module.exports = { BodyWithLocale, ParamWithLocale, QueryWithLocale };

const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// =================================================================
// Reusable Rule Helpers
// =================================================================

const paginationRules = () => [
  new QueryWithLocale('page').optional().isInt({ min: 1 }).toInt().get(),
  new QueryWithLocale('limit').optional().isInt({ min: 1, max: 100 }).toInt().get(),
];

const postContentRules = (isOptional = false) => {
  const chain = (field, { min, max }) => {
    const builder = new BodyWithLocale(field).isLength({ min, max });
    return isOptional ? builder.optional().get() : builder.notEmpty().get();
  };

  return [
    chain('title', { min: 3, max: 300 }),
    chain('content', { min: 10, max: 10000 }),
    chain('description', { min: 10, max: 500 }),
    isOptional
      ? new BodyWithLocale('category_id').optional().isNumeric().toInt().get()
      : new BodyWithLocale('category_id').notEmpty().isNumeric().toInt().get(),
  ];
};

const translationRule = () => new BodyWithLocale('translations')
  .optional()
  // Bỏ .isString(). Thay vào đó, xử lý mọi thứ trong custom.
  .custom((value, { req }) => {
    // Nếu là optional và không được cung cấp, validation thành công.
    if (value === undefined) {
      return true;
    }

    let translationsArray;

    // 1. Xử lý cả hai trường hợp: chuỗi JSON (từ form-data) hoặc mảng (từ raw JSON)
    if (typeof value === 'string') {
      try {
        translationsArray = JSON.parse(value);
      } catch (e) {
        throw new Error('Translations, if provided as a string, must be valid JSON.');
      }
    } else if (Array.isArray(value)) {
      translationsArray = value;
    } else {
      throw new Error('Translations must be an array of objects or a JSON string representing an array.');
    }

    // 2. Kiểm tra sâu hơn về cấu trúc của mảng
    if (!Array.isArray(translationsArray)) {
        throw new Error('Parsed translations data must result in an array.');
    }

    for (const t of translationsArray) {
      if (
        typeof t !== 'object' || t === null ||
        typeof t.locale !== 'string' || !t.locale ||
        typeof t.title !== 'string' || !t.title ||
        typeof t.content !== 'string' || !t.content
      ) {
        throw new Error('Each translation must be an object with non-empty string properties: locale, title, content.');
      }
    }

    // 3. (QUAN TRỌNG) Ghi đè req.body.translations bằng mảng đã được parse.
    // Điều này giúp controller của bạn không cần phải parse lại.
    req.body.translations = translationsArray;

    return true; // Tất cả kiểm tra đều thành công.
  })
  .get();

// =================================================================
// Validation Sets for Post Routes
// =================================================================

const getAllPostsValidation = [
  ...paginationRules(),
  new QueryWithLocale('search').optional().isString().trim().isLength({ min: 2, max: 100 }).get(),
  new QueryWithLocale('categoryId').optional().isInt({ min: 1 }).toInt().get(),
  new QueryWithLocale('userId').optional().isInt({ min: 1 }).toInt().get(),
  new QueryWithLocale('status').optional().isIn(['all', 'published', 'draft', 'scheduled', 'archived']).get(),
  new QueryWithLocale('sort').optional().isIn(['latest', 'oldest', 'most_viewed', 'title_asc', 'title_desc']).get(),
  new QueryWithLocale('year').optional().isInt({ min: 1970, max: new Date().getFullYear() + 1 }).toInt().get(),
];

const createPostValidation = [
  ...postContentRules(),
  translationRule(),
  new BodyWithLocale('status').optional().isIn(['draft', 'published', 'scheduled']).get(),
];

const updatePostValidation = [
  new ParamWithLocale('id').notEmpty().isInt({ min: 1 }).toInt().get(),
  ...postContentRules(true),
  translationRule(),
  new BodyWithLocale('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']).get(),
];

const getMyPostsValidation = [
  ...paginationRules(),
  new QueryWithLocale('includeDrafts').optional().isBoolean().toBoolean().get(),
];

const getPostsByAuthorValidation = [
  new ParamWithLocale('userId').notEmpty().isInt({ min: 1 }).toInt().get(),
  ...paginationRules(),
  new QueryWithLocale('status').optional().isIn(['published', 'draft', 'archived']).get(),
  new QueryWithLocale('sort').optional().isIn(['newest', 'oldest', 'most_viewed']).get(),
];

const getPostsByCategoryValidation = [
  new ParamWithLocale('categoryId').notEmpty().isInt({ min: 1 }).toInt().get(),
  ...paginationRules(),
];


// =================================================================
// Exporting
// =================================================================

module.exports = {
  getAllPostsValidation,
  createPostValidation,
  updatePostValidation,
  getMyPostsValidation,
  getPostsByAuthorValidation,
  getPostsByCategoryValidation,
  getPostByIdValidation: [ new ParamWithLocale('id').notEmpty().isInt({ min: 1 }).toInt().get() ],
  getPostBySlugValidation: [ new ParamWithLocale('slug').notEmpty().isSlug().get() ],
};