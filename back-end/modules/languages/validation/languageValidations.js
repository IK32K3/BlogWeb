const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Get all languages validation
const getAllLanguagesValidation = [
    new QueryWithLocale('page').isNumberic().get(),
    new QueryWithLocale('limit').isNumberic().get()
];

// Get language by ID validation
const getLanguageByIdValidation = [
    new ParamWithLocale('id').notEmpty().isNumberic().get()
];

// Create language validation
const createLanguageValidation = [
    new BodyWithLocale('name').notEmpty().isLength({ min: 2, max: 50 }).get(),
    new BodyWithLocale('locale').notEmpty().isLength({ min: 2, max: 10 }).get()
];

// Update language validation
const updateLanguageValidation = [
    new ParamWithLocale('id').notEmpty().isNumberic().get(),
    new BodyWithLocale('name').isLength({ min: 2, max: 50 }).get(),
    new BodyWithLocale('locale').isLength({ min: 2, max: 10 }).get()
];

// Delete language validation
const deleteLanguageValidation = [
    new ParamWithLocale('id').notEmpty().isNumberic().get()
];

module.exports = {
  getAllLanguagesValidation,
  getLanguageByIdValidation,
  createLanguageValidation,
  updateLanguageValidation,
  deleteLanguageValidation
};