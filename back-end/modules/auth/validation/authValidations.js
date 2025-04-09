const { BodyWithLocale } = require('kernels/rules');
const { User } = require('models');

// Registration validation
const registerValidation = [
  [
    new BodyWithLocale('username').notEmpty().isLength({ min: 3, max: 50 })
      .unique(User, 'username').get(),
    new BodyWithLocale('email').notEmpty().isEmail()
      .unique(User, 'email').get(),
    new BodyWithLocale('password').notEmpty().isLength({ min: 6, max: 100 }).get(),
    new BodyWithLocale('confirmPassword').notEmpty().confirmed('password').get(),
    new BodyWithLocale('description').get()
  ]
];

// Login validation
const loginValidation = [
  [
    new BodyWithLocale('username').notEmpty().get(),
    new BodyWithLocale('password').notEmpty().get()
  ]
];

// Forgot password validation
const forgotPasswordValidation = [
  [
    new BodyWithLocale('email').notEmpty().isEmail().get()
  ]
];

// Reset password validation
const resetPasswordValidation = [
  [
    new BodyWithLocale('token').notEmpty().get(),
    new BodyWithLocale('newPassword').notEmpty().isLength({ min: 6, max: 100 }).get(),
    new BodyWithLocale('confirmPassword').notEmpty().confirmed('newPassword').get()
  ]
];

// Refresh token validation
const refreshTokenValidation = [
  [
    new BodyWithLocale('refresh_token').notEmpty().get()
  ]
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation
};