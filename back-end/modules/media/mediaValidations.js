const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');

// Get all media validation
const getAllMediaValidation = [
  [
    new QueryWithLocale('page').isNumberic().get(),
    new QueryWithLocale('limit').isNumberic().get(),
    new QueryWithLocale('user_id').isNumberic().get()
  ]
];

// Get media by ID validation
const getMediaByIdValidation = [
  [
    new ParamWithLocale('id').notEmpty().isNumberic().get()
  ]
];

// Create media validation
const createMediaValidation = [
  [
    new BodyWithLocale('name').notEmpty().isLength({ min: 1, max: 100 }).get(),
    new BodyWithLocale('url').notEmpty().isLength({ min: 5, max: 500 }).get(),
    new BodyWithLocale('type').notEmpty().isLength({ min: 3, max: 50 }).get(),
    new BodyWithLocale('user_id').isNumberic().get()
  ]
];

// Update media validation
const updateMediaValidation = [
  [
    new ParamWithLocale('id').notEmpty().isNumberic().get(),
    new BodyWithLocale('name').isLength({ min: 1, max: 100 }).get(),
    new BodyWithLocale('url').isLength({ min: 5, max: 500 }).get(),
    new BodyWithLocale('type').isLength({ min: 3, max: 50 }).get()
  ]
];

// Delete media validation
const deleteMediaValidation = [
  [
    new ParamWithLocale('id').notEmpty().isNumberic().get()
  ]
];

module.exports = {
  getAllMediaValidation,
  getMediaByIdValidation,
  createMediaValidation,
  updateMediaValidation,
  deleteMediaValidation
};