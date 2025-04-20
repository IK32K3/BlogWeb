const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Get all categories validation
const getAllCategoriesValidation = [
    new QueryWithLocale('page').isNumberic().get(),
    new QueryWithLocale('limit').isNumberic().get(),
    new QueryWithLocale('language_id').isNumberic().get()
];

// Get category by ID validation
const getCategoryByIdValidation = [
    new ParamWithLocale('id').notEmpty().isNumberic().get()
];

// Create category validation
const createCategoryValidation = [
    new BodyWithLocale('name').notEmpty().isLength({ min: 2, max: 50 }).get()
];

// Update category validation
const updateCategoryValidation = [
    new ParamWithLocale('id').notEmpty().isNumberic().get(),
    new BodyWithLocale('name').isLength({ min: 2, max: 50 }).get()
];

// Delete category validation
const deleteCategoryValidation = [
    new ParamWithLocale('id').notEmpty().isNumberic().get()
];

module.exports = {
  getAllCategoriesValidation,
  getCategoryByIdValidation,
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation
};