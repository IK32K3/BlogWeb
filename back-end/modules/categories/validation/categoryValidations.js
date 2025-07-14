const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Get all categories validation
const getAllCategoriesValidation = [
    new QueryWithLocale('page').optional().isNumeric().get(),
    new QueryWithLocale('limit').optional().isNumeric().get(),
    new QueryWithLocale('language_id').optional().isNumeric().get()
];

// Get category by ID validation
const getCategoryByIdValidation = [
    new ParamWithLocale('id').notEmpty().isNumeric().get()
];

// Create category validation
const createCategoryValidation = [
    new BodyWithLocale('name')
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .matches(/^[^\d]*$/, 'i').withMessage('Tên không được chứa số')
      .custom(value => !/<script[\s>]/i.test(value)).withMessage('Tên không được chứa <script>'),
    new BodyWithLocale('slug')
      .optional()
      .isLength({ min: 2, max: 255 })
      .custom(value => !/<script[\s>]/i.test(value)).withMessage('Slug không được chứa <script>'),
];

// Update category validation
const updateCategoryValidation = [
    new ParamWithLocale('id').notEmpty().isNumeric().get(),
    new BodyWithLocale('name')
      .isLength({ min: 2, max: 50 })
      .matches(/^[^\d]*$/, 'i').withMessage('Tên không được chứa số')
      .custom(value => !/<script[\s>]/i.test(value)).withMessage('Tên không được chứa <script>'),
    new BodyWithLocale('slug')
      .optional()
      .isLength({ min: 2, max: 255 })
      .custom(value => !/<script[\s>]/i.test(value)).withMessage('Slug không được chứa <script>'),
];


module.exports = {
  getAllCategoriesValidation,
  getCategoryByIdValidation,
  createCategoryValidation,
  updateCategoryValidation,
};