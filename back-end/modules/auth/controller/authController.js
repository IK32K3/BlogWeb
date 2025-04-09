const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { config } = require('configs');
const { User, Role } = require('models');
const responseUtils = require('utils/responseUtils');
const jwtUtils = require('utils/jwtUtils');

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { username, email, password, description } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });
      
      if (existingUser) {
        return responseUtils.invalidated(res, {
          errors: [{ 
            message: existingUser.username === username ? 'Username already exists' : 'Email already exists' 
          }]
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, config.hashing.bcrypt.rounds);
      
      // Get viewer role (default role for new users)
      const viewerRole = await Role.findOne({ where: { name: 'Viewer' } });
      
      if (!viewerRole) {
        return responseUtils.error(res, 'Role configuration error');
      }
      
      // Create new user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role_id: viewerRole.id,
        description: description || '',
        is_active: true
      });
      
      // Generate JWT tokens
      const access_token = jwtUtils.sign(user.id, viewerRole.name);
      const refresh_token = jwtUtils.signRefreshToken(user.id, viewerRole.name);
      
      return responseUtils.ok(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: viewerRole.name
        },
        access_token,
        refresh_token
      });
    } catch (error) {
      console.error('Registration error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // User login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
        // Check if username and password are provided
      const user = await User.findOne({
        where: { username },
        include: [{
          model: Role,
          as: 'role'
        }]
      });
      
      if (!user) {
        return responseUtils.unauthorized(res, 'Invalid credentials');
      }
      
        // Check if user is active
      if (!user.is_active) {
        return responseUtils.unauthorized(res, 'Account is disabled');
      }
      
        // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return responseUtils.unauthorized(res, 'Invalid credentials');
      }
      
        // Generate JWT tokens
      const access_token = jwtUtils.sign(user.id, user.role.name);
      const refresh_token = jwtUtils.signRefreshToken(user.id, user.role.name);
      
      return responseUtils.ok(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role.name
        },
        access_token,
        refresh_token
      });
    } catch (error) {
      console.error('Login error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Request password reset
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
        // Check if email is provided
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return responseUtils.ok(res, { 
          message: 'If this email exists, a password reset link has been sent' 
        });
      }
      
        // Generate password reset token
      const resetToken = jwt.sign(
        { userId: user.id },
        config.jwt.secret,
        { expiresIn: '1h' }
      );
      
        // Send email with reset link (pseudo-code)
      return responseUtils.ok(res, { 
        message: 'Password reset email sent',
        resetToken 
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Reset password using token
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
        // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, config.jwt.secret);
      } catch (error) {
        return responseUtils.unauthorized(res, 'Invalid or expired token');
      }
      
      // Find user
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return responseUtils.notFound(res);
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.hashing.bcrypt.rounds);
      
        // Update user password
      await user.update({ password: hashedPassword });
      
      return responseUtils.ok(res, { message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
    // Refresh access token using refresh token
  refreshToken: async (req, res) => {
    try {
      const { refresh_token } = req.body;
      
        // Check if refresh token is provided
      let decoded;
      try {
        decoded = jwt.verify(refresh_token, config.jwt.secret);
      } catch (error) {
        return responseUtils.unauthorized(res, 'Invalid or expired refresh token');
      }
      
        // Find user
      const user = await User.findByPk(decoded.userId, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });
      
      if (!user) {
        return responseUtils.unauthorized(res, 'User not found');
      }
      
        // Check if user is active
      const access_token = jwtUtils.sign(user.id, user.role.name);
      
      return responseUtils.ok(res, { access_token });
    } catch (error) {
      console.error('Refresh token error:', error);
      return responseUtils.error(res, error.message);
    }
  }
};

module.exports = authController;