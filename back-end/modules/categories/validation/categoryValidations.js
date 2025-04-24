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
    new BodyWithLocale('name').notEmpty().isLength({ min: 2, max: 50 }).get()
];

// Update category validation
const updateCategoryValidation = [
  
    new ParamWithLocale('id').notEmpty().isNumeric().get(),
    new BodyWithLocale('name').isLength({ min: 2, max: 50 }).get()
];


module.exports = {
  getAllCategoriesValidation,
  getCategoryByIdValidation,
  createCategoryValidation,
  updateCategoryValidation,
};