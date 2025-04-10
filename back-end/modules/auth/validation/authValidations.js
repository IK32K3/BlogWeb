const { BodyWithLocale } = require('kernels/rules'); // Assuming this path is correct
const { User } = require('models'); // Assuming this path is correct

// Registration validation - Removed the outer array brackets []
const registerValidation = [
  // Each rule is now a direct element of this array
  new BodyWithLocale('username').notEmpty().isLength({ min: 3, max: 50 })
    .unique(User, 'username').get(),
  new BodyWithLocale('email').notEmpty().isEmail()
    .unique(User, 'email').get(),
  new BodyWithLocale('password').notEmpty().isLength({ min: 6, max: 100 }).get(),
  new BodyWithLocale('confirmPassword').notEmpty().confirmed('password').get(),
  new BodyWithLocale('description').get() // Assuming you want to validate/sanitize description, even if just checking existence
];

// Login validation - Removed the outer array brackets []
const loginValidation = [
  new BodyWithLocale('username').notEmpty().get(),
  new BodyWithLocale('password').notEmpty().get()
];

// Forgot password validation - Removed the outer array brackets []
const forgotPasswordValidation = [
  new BodyWithLocale('email').notEmpty().isEmail().get()
];

// Reset password validation - Removed the outer array brackets []
const resetPasswordValidation = [
  new BodyWithLocale('token').notEmpty().get(),
  new BodyWithLocale('newPassword').notEmpty().isLength({ min: 6, max: 100 }).get(),
  new BodyWithLocale('confirmPassword').notEmpty().confirmed('newPassword').get()
];

// Refresh token validation - Removed the outer array brackets []
const refreshTokenValidation = [
  new BodyWithLocale('refresh_token').notEmpty().get()
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation
};