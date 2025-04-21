const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');
const { User } = require('models');

// Get all users validation
const getAllUsersValidation = [
  [
    new QueryWithLocale('page').isNumeric().get(),
    new QueryWithLocale('limit').isNumeric().get(),
    new QueryWithLocale('role_id').isNumeric().get()
  ]
];

// Get user by ID validation
const getUserByIdValidation = [
  [
    new ParamWithLocale('id').notEmpty().isNumeric().get()
  ]
];

// Create user validation
const createUserValidation = [
  [
    new BodyWithLocale('username').notEmpty().isLength({ min: 3, max: 50 })
      .unique(User, 'username').get(),
    new BodyWithLocale('email').notEmpty().isEmail()
      .unique(User, 'email').get(),
    new BodyWithLocale('password').notEmpty().isLength({ min: 6, max: 100 }).get(),
    new BodyWithLocale('role_id').notEmpty().isNumeric().get(),
    new BodyWithLocale('description').get()
  ]
];

// Update user validation
const updateUserValidation = [
  [
    new ParamWithLocale('id').notEmpty().isNumeric().get(),
    new BodyWithLocale('username').isLength({ min: 3, max: 50 }).get(),
    new BodyWithLocale('email').isEmail().get(),
    new BodyWithLocale('role_id').isNumeric().get()
  ]
];

// Delete user validation
const deleteUserValidation = [
  [
    new ParamWithLocale('id').notEmpty().isNumeric().get()
  ]
];

// Update profile validation
const updateProfileValidation = [
  [
    new BodyWithLocale('username').isLength({ min: 3, max: 50 }).get(),
    new BodyWithLocale('email').isEmail().get(),
    new BodyWithLocale('password').isLength({ min: 6, max: 100 }).get(),
    new BodyWithLocale('current_password').get()
  ]
];

// Save settings validation
const saveSettingsValidation = [
  [
    new BodyWithLocale('settings').notEmpty().get()
  ]
];

module.exports = {
  getAllUsersValidation,
  getUserByIdValidation,
  createUserValidation,
  updateUserValidation,
  deleteUserValidation,
  updateProfileValidation,
  saveSettingsValidation
};