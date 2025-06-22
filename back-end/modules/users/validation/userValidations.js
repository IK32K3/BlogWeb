const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require('kernels/rules');
const { User } = require('models');

// Get all users validation
const getAllUsersValidation = [
  new QueryWithLocale('page').optional().isNumeric().withMessage('Page must be a number').get(),
  new QueryWithLocale('limit').optional().isNumeric().withMessage('Limit must be a number').get(),
  new QueryWithLocale('role_id').optional().isNumeric().get()  // Đặt optional để tránh lỗi khi không truyền
];

// Get user by ID validation
const getUserByIdValidation = [
  new ParamWithLocale('id').notEmpty().isNumeric().get()
];

// Create user validation
const createUserValidation = [
  new BodyWithLocale('username').notEmpty().isLength({ min: 3, max: 50 }).unique(User, 'username').get(),
  new BodyWithLocale('email').notEmpty().isEmail().unique(User, 'email').get(),
  new BodyWithLocale('password').notEmpty().isLength({ min: 6, max: 100 }).get(),
  new BodyWithLocale('role_id').notEmpty().isNumeric().get(),
  new BodyWithLocale('description').get()
];

// Update user validation
const updateUserValidation = [
  new ParamWithLocale('id').notEmpty().isNumeric().get(),
  new BodyWithLocale('username').optional().isLength({ min: 3, max: 50 }).get(),
  new BodyWithLocale('email').optional().isEmail().get(),
  new BodyWithLocale('role_id').optional().isNumeric().get()
];

// Update profile validation
const updateProfileValidation = [
  new BodyWithLocale('username').optional().isLength({ min: 3, max: 50 }).get(),
  new BodyWithLocale('email').optional().isEmail().get(),
  new BodyWithLocale('password').optional().isLength({ min: 6, max: 100 }).get(),
  new BodyWithLocale('current_password').optional().get()
];

// Save settings validation
const saveSettingsValidation = [
  new BodyWithLocale('settings').notEmpty().get()
];
changePasswordValidation = [
  new BodyWithLocale('current_password').optional().notEmpty().get(),
  new BodyWithLocale('new_password').optional().notEmpty().isLength({ min: 6, max: 100 }).get()
];

// Delete account validation
const deleteAccountValidation = [
  new BodyWithLocale('currentPassword').notEmpty().withMessage('Current password is required to delete account').get()
];

module.exports = {
  getAllUsersValidation,
  getUserByIdValidation,
  createUserValidation,
  updateUserValidation,
  updateProfileValidation,
  saveSettingsValidation,
  changePasswordValidation,
  deleteAccountValidation,
};
