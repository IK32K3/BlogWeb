const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Get all media validation
const getAllMediaValidation = [
    new QueryWithLocale('page').optional().isNumeric().get(),
    new QueryWithLocale('limit').optional().isNumeric().get(),
    new QueryWithLocale('user_id').optional().isNumeric().get()
];

// Get media by ID validation
const getMediaByIdValidation = [
    new ParamWithLocale('id').notEmpty().isNumeric().get()
];

// Create media validation
const createMediaValidation = [
    new BodyWithLocale('name').notEmpty().isLength({ min: 1, max: 100 }).get(),
    new BodyWithLocale('url').notEmpty().isLength({ min: 5, max: 500 }).get(),
    new BodyWithLocale('type').notEmpty().isLength({ min: 3, max: 50 }).get(),
    new BodyWithLocale('user_id').isNumeric().get()
  
];

// Update media validation
const updateMediaValidation = [
  
    new ParamWithLocale('id').notEmpty().isNumeric().get(),
    new BodyWithLocale('name').isLength({ min: 1, max: 100 }).get(),
    new BodyWithLocale('url').isLength({ min: 5, max: 500 }).get(),
    new BodyWithLocale('type').isLength({ min: 3, max: 50 }).get()
];

// Delete media validation
const deleteMediaValidation = [
  [
    new ParamWithLocale('id').notEmpty().isNumeric().get()
  ]
];

module.exports = {
  getAllMediaValidation,
  getMediaByIdValidation,
  createMediaValidation,
  updateMediaValidation,
  deleteMediaValidation
};