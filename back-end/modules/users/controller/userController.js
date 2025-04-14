const responseUtils = require('utils/responseUtils');
const userService = require('../service/userService');

const userController = {
  /**
   * @desc Get all users with pagination
   * @route GET /api/users
   * @access Admin
   */
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, search, role_id } = req.query;
      const result = await userService.getAllUsers({ 
        page: parseInt(page), 
        limit: parseInt(limit), 
        search, 
        role_id 
      });
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error('Get all users error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  /**
   * @desc Get user by ID
   * @route GET /api/users/:id
   * @access Public/Admin
   */
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      return responseUtils.ok(res, { user });
    } catch (error) {
      console.error('Get user by ID error:', error);
      if (error.message === 'User not found') {
        return responseUtils.notFound(res, 'User not found');
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  /**
   * @desc Create new user
   * @route POST /api/users
   * @access Admin
   */
  createUser: async (req, res) => {
    try {
      const userData = req.body;
      const newUser = await userService.createUser(userData);
      return responseUtils.created(res, {
        message: 'User created successfully',
        user: newUser
      });
    } catch (error) {
      console.error('Create user error:', error);
      if (error.message.includes('already exists')) {
        return responseUtils.conflict(res, error.message);
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  /**
   * @desc Update user
   * @route PUT /api/users/:id
   * @access Admin
   */
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedUser = await userService.updateUser(id, updateData);
      return responseUtils.ok(res, {
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      if (error.message === 'User not found') {
        return responseUtils.notFound(res, 'User not found');
      }
      if (error.message.includes('already exists')) {
        return responseUtils.conflict(res, error.message);
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  /**
   * @desc Delete user
   * @route DELETE /api/users/:id
   * @access Admin
   */
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      return responseUtils.ok(res, { message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      if (error.message === 'User not found') {
        return responseUtils.notFound(res, 'User not found');
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  /**
   * @desc Get current user profile
   * @route GET /api/users/me
   * @access Private
   */
  getProfile: async (req, res) => {
    try {
      const id = req.user.id;
      const user = await userService.getProfile(id);
      return responseUtils.ok(res, { user });
    } catch (error) {
      console.error('Get profile error:', error);
      if (error.message === 'User not found') {
        return responseUtils.notFound(res, 'User not found');
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  /**
   * @desc Update current user profile
   * @route PUT /api/users/me
   * @access Private
   */
  updateProfile: async (req, res) => {
    try {
      const id = req.user.id;
      const updateData = req.body;
      const updatedUser = await userService.updateProfile(id, updateData);
      return responseUtils.ok(res, {
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.message === 'User not found') {
        return responseUtils.notFound(res, 'User not found');
      }
      if (error.message === 'Current password is incorrect') {
        return responseUtils.unauthorized(res, 'Current password is incorrect');
      }
      if (error.message.includes('already exists')) {
        return responseUtils.conflict(res, error.message);
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  /**
   * @desc Save user settings
   * @route POST /api/users/me/settings
   * @access Private
   */
  saveSettings: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { settings } = req.body;
      const userSettings = await userService.saveSettings(user_id, settings);
      return responseUtils.ok(res, {
        message: 'Settings saved successfully',
        settings: userSettings
      });
    } catch (error) {
      console.error('Save settings error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  /**
   * @desc Authenticate user
   * @route POST /api/users/login
   * @access Public
   */
  login: async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;
      const user = await userService.verifyCredentials(usernameOrEmail, password);
      return responseUtils.ok(res, {
        message: 'Login successful',
        user
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'User not found' || error.message === 'Invalid password') {
        return responseUtils.unauthorized(res, 'Invalid credentials');
      }
      return responseUtils.serverError(res, error.message);
    }
  }
};

module.exports = userController;