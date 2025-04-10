// Import the service
const authService = require('../service/authService'); // Adjust path as needed
const responseUtils = require('utils/responseUtils'); // Keep response utils

// Keep basic required field checks, but delegate core logic/validation
const authController = {
  /**
   * Register a new user
   */
  register: async (req, res) => {
    // Basic request validation
    const { username, email, password, description } = req.body;
    if (!username || !email || !password) {
      return responseUtils.badRequest(res, 'Username, email and password are required');
    }

    try {
      // Call the service
      const result = await authService.registerUser({ username, email, password, description });
      return responseUtils.created(res, result);

    } catch (error) {
      console.error('Registration Controller Error:', error.message);
      // Handle specific errors thrown by the service
      if (error.name === 'ConflictError') {
        return responseUtils.conflict(res, error.message);
      }
      if (error.name === 'AuthError') { // General validation errors from service
          return responseUtils.badRequest(res, error.message);
      }
      // Default to server error for unexpected issues
      return responseUtils.serverError(res, 'Registration failed');
    }
  },

  /**
   * User login
   */
  login: async (req, res) => {
    // Basic request validation
    const { username, password } = req.body;
    if (!username || !password) {
      return responseUtils.badRequest(res, 'Username and password are required');
    }

    try {
      // Call the service
      const result = await authService.loginUser(username, password);
      return responseUtils.success(res, result);

    } catch (error) {
      console.error('Login Controller Error:', error.message);
      if (error.name === 'UnauthorizedError') {
        return responseUtils.unauthorized(res, error.message);
      }
       if (error.name === 'ForbiddenError') {
        return responseUtils.forbidden(res, error.message);
      }
      // Default to server error
      return responseUtils.serverError(res, 'Login failed');
    }
  },

  /**
   * Request password reset
   */
  forgotPassword: async (req, res) => {
    // Basic request validation
    const { email } = req.body;
    if (!email) {
      return responseUtils.badRequest(res, 'Email is required');
    }

    try {
      const resetToken = await authService.requestPasswordReset(email);

      // --- Email Sending Logic ---
      if (resetToken) {
        // TODO: Call an EmailService here to send the actual email
        // Example: await emailService.sendPasswordReset(email, resetToken);
        console.log(`Password reset requested for ${email}. Token (dev only): ${resetToken}`); // Log for dev
      }

      // Always return success to prevent email enumeration
      return responseUtils.success(res, {
        message: 'If your email address exists in our system, you will receive a password reset link.'
      });

    } catch (error) {
      console.error('Forgot Password Controller Error:', error.message);
       if (error.name === 'AuthError') { // e.g., invalid email format
          return responseUtils.badRequest(res, error.message);
      }
      return responseUtils.serverError(res, 'Password reset request failed');
    }
  },

  /**
   * Reset password using token
   */
  resetPassword: async (req, res) => {
    // Basic request validation
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return responseUtils.badRequest(res, 'Token and new password are required');
    }

    try {
      await authService.performPasswordReset(token, newPassword);
      return responseUtils.success(res, {
        message: 'Password has been reset successfully'
      });

    } catch (error) {
      console.error('Reset Password Controller Error:', error.message);
      if (error.name === 'UnauthorizedError' || error.name === 'NotFoundError') {
        return responseUtils.unauthorized(res, error.message); // Treat NotFound as Unauthorized here
      }
       if (error.name === 'AuthError') { // e.g., password too short
          return responseUtils.badRequest(res, error.message);
      }
      return responseUtils.serverError(res, 'Password reset failed');
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (req, res) => {
    // Basic request validation
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return responseUtils.badRequest(res, 'Refresh token is required');
    }

    try {
      const accessToken = await authService.refreshAccessToken(refresh_token);
      return responseUtils.success(res, { access_token: accessToken });

    } catch (error) {
      console.error('Refresh Token Controller Error:', error.message);
      if (error.name === 'UnauthorizedError') {
        return responseUtils.unauthorized(res, error.message);
      }
      return responseUtils.serverError(res, 'Token refresh failed');
    }
  },
  
};

module.exports = authController; // Keep exporting the controller