const { BodyWithLocale } = require('kernels/rules'); // Assuming this path is correct
const { User } = require('models'); // Assuming this path is correct

// Registration validation - Removed the outer array brackets []
const registerValidation = [
  // Username: bắt buộc, từ 3 đến 50 ký tự, duy nhất
  new BodyWithLocale('username')
    .notEmpty()
    .matches(/^[a-zA-Z]+$/, 'Tên người dùng chỉ được chứa chữ cái (không dấu, không số, không ký tự đặc biệt)')
    .isLength({ min: 3, max: 50 })
    .unique(User, 'username', 'Tên người dùng đã được sử dụng')
    .get(),

  // Email: bắt buộc, đúng định dạng, duy nhất
  new BodyWithLocale('email')
    .notEmpty()
    .isEmail().matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .unique(User, 'email', 'Email đã được sử dụng')
    .get(),

  // Password: bắt buộc, từ 6 đến 100 ký tự
  new BodyWithLocale('password')
    .notEmpty()
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/,
    'Mật khẩu phải chứa ít nhất một số và một ký tự đặc biệt')
    .isLength({ min: 6, max: 100 })
    .get(),

  // Confirm Password: bắt buộc, giống với password
  new BodyWithLocale('confirmPassword')
    .notEmpty()
    .confirmed('password', 'Xác nhận mật khẩu không khớp')
    .get(),
];

// Login validation - Removed the outer array brackets []
const loginValidation = [
  new BodyWithLocale('usernameOrEmail').notEmpty().get().isLength({min : 3,max:50}).trim(),
  new BodyWithLocale('password').notEmpty().get().isLength({min : 6,max: 100})
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