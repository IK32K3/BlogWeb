const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { config } = require('configs');
const { User, Role } = require('models');
const responseUtils = require('utils/responseUtils');
const jwtUtils = require('utils/jwtUtils');
const validator = require('validator');

const SALT_ROUNDS = config.hashing.bcrypt.rounds || 10;
const PASSWORD_MIN_LENGTH = 8;

const authController = {
  /**
   * Register a new user
   */
  register: async (req, res) => {
    try {
      const { username, email, password, description} = req.body;

      // Validate input
      if (!username || !email || !password) {
        return responseUtils.badRequest(res, 'Username, email and password are required');
      }

      if (!validator.isEmail(email)) {
        return responseUtils.badRequest(res, 'Invalid email format');
      }

      if (password.length < PASSWORD_MIN_LENGTH) {
        return responseUtils.badRequest(res, `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
      }

      // Check for existing user
      const existingUser = await User.findOne({
        where: { [Op.or]: [{ username }, { email }] }
      });

      if (existingUser) {
        const field = existingUser.username === username ? 'username' : 'email';
        return responseUtils.conflict(res, `${field} already exists`);
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Get default role (Viewer)
      const defaultRole = await Role.findOne({ where: { name: 'Viewer' } });
      if (!defaultRole) {
        return responseUtils.serverError(res, 'Default role not configured');
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role_id: defaultRole.id,
        description,
        is_active: true
      });

      // Generate tokens
      const tokens = {
        access_token: jwtUtils.sign(user.id, defaultRole.name),
        refresh_token: jwtUtils.signRefreshToken(user.id, defaultRole.name)
      };

      return responseUtils.created(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: defaultRole.name
        },
        tokens
      });

    } catch (error) {
      console.error('Registration error:', error);
      return responseUtils.serverError(res, 'Registration failed');
    }
  },

  /**
   * User login
   */
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return responseUtils.badRequest(res, 'Username and password are required');
      }

      // Find user with role
      const user = await User.findOne({
        where: { username },
        include: [{
          model: Role,
          as: 'role',
          attributes: ['name']
        }],
        attributes: ['id', 'username', 'email', 'password', 'is_active']
      });

      if (!user) {
        return responseUtils.unauthorized(res, 'Invalid credentials');
      }

      if (!user.is_active) {
        return responseUtils.forbidden(res, 'Account is disabled');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return responseUtils.unauthorized(res, 'Invalid credentials');
      }

      // Generate tokens
      const tokens = {
        access_token: jwtUtils.sign(user.id, user.role.name),
        refresh_token: jwtUtils.signRefreshToken(user.id, user.role.name)
      };

      return responseUtils.success(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role.name
        },
        tokens
      });

    } catch (error) {
      console.error('Login error:', error);
      return responseUtils.serverError(res, 'Login failed');
    }
  },

  /**
   * Request password reset
   */
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return responseUtils.badRequest(res, 'Email is required');
      }

      if (!validator.isEmail(email)) {
        return responseUtils.badRequest(res, 'Invalid email format');
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Return success to prevent email enumeration
        return responseUtils.success(res, { 
          message: 'If this email exists, a reset link has been sent' 
        });
      }

      // Generate reset token (expires in 15 minutes)
      const resetToken = jwt.sign(
        { userId: user.id, action: 'password_reset' },
        config.jwt.secret,
        { expiresIn: '15m' }
      );

      // TODO: Send email with reset link
      // await sendResetEmail(user.email, resetToken);

      return responseUtils.success(res, { 
        message: 'Password reset email sent',
        resetToken // Only include in development
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      return responseUtils.serverError(res, 'Password reset request failed');
    }
  },

  /**
   * Reset password using token
   */
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return responseUtils.badRequest(res, 'Token and new password are required');
      }

      if (newPassword.length < PASSWORD_MIN_LENGTH) {
        return responseUtils.badRequest(res, `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, config.jwt.secret);
        if (decoded.action !== 'password_reset') {
          return responseUtils.unauthorized(res, 'Invalid token');
        }
      } catch (error) {
        return responseUtils.unauthorized(res, 'Invalid or expired token');
      }

      // Find user
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return responseUtils.notFound(res, 'User not found');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Update password
      await user.update({ password: hashedPassword });

      return responseUtils.success(res, { 
        message: 'Password has been reset successfully' 
      });

    } catch (error) {
      console.error('Reset password error:', error);
      return responseUtils.serverError(res, 'Password reset failed');
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (req, res) => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return responseUtils.badRequest(res, 'Refresh token is required');
      }

      // Verify refresh token
      let decoded;
      try {
        decoded = jwt.verify(refresh_token, config.jwt.refreshSecret);
      } catch (error) {
        return responseUtils.unauthorized(res, 'Invalid or expired refresh token');
      }

      // Find user with role
      const user = await User.findByPk(decoded.userId, {
        include: [{
          model: Role,
          as: 'role',
          attributes: ['name']
        }],
        attributes: ['id', 'is_active']
      });

      if (!user || !user.is_active) {
        return responseUtils.unauthorized(res, 'User not found or inactive');
      }

      // Generate new access token
      const access_token = jwtUtils.sign(user.id, user.role.name);

      return responseUtils.success(res, { access_token });

    } catch (error) {
      console.error('Refresh token error:', error);
      return responseUtils.serverError(res, 'Token refresh failed');
    }
  }
};

module.exports = authController;