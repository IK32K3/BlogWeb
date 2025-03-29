const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Role, setting, user_media, media } = require('models');
const { config } = require('configs');
const responseUtils = require('utils/responseUtils');

const userController = {
  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, search, role_id } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {};
      
      if (role_id) {
        whereClause.role_id = role_id;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }
      
      // Fetch users
      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [
          { 
            model: Role, 
            as: 'role',
            attributes: ['id', 'name'] 
          }
        ],
        attributes: { exclude: ['password'] }
      });
      
      const totalPages = Math.ceil(count / limit);
      
      return responseUtils.ok(res, {
        users,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id, {
        include: [
          { 
            model: Role, 
            as: 'role',
            attributes: ['id', 'name'] 
          },
          {
            model: user_media,
            include: [{ model: media }]
          },
          {
            model: setting
          }
        ],
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.ok(res, { user });
    } catch (error) {
      console.error('Get user by ID error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Create user (admin only)
  createUser: async (req, res) => {
    try {
      const { username, email, password, role_id, description, is_active } = req.body;
      
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
      
      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role_id,
        description: description || '',
        is_active: is_active === undefined ? true : is_active
      });
      
      // Get the user with role information
      const newUser = await User.findByPk(user.id, {
        include: [
          { 
            model: Role, 
            as: 'role',
            attributes: ['id', 'name'] 
          }
        ],
        attributes: { exclude: ['password'] }
      });
      
      return responseUtils.ok(res, {
        message: 'User created successfully',
        user: newUser
      });
    } catch (error) {
      console.error('Create user error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, password, role_id, description, is_active } = req.body;
      
      // Find user
      const user = await User.findByPk(id);
      
      if (!user) {
        return responseUtils.notFound(res);
      }
      
      // Check if username or email already exists
      if (username && username !== user.username) {
        const existingUsername = await User.findOne({
          where: { username }
        });
        
        if (existingUsername) {
          return responseUtils.invalidated(res, {
            errors: [{ message: 'Username already exists' }]
          });
        }
      }
      
      if (email && email !== user.email) {
        const existingEmail = await User.findOne({
          where: { email }
        });
        
        if (existingEmail) {
          return responseUtils.invalidated(res, {
            errors: [{ message: 'Email already exists' }]
          });
        }
      }
      
      // Prepare update data
      const updateData = {};
      
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (description !== undefined) updateData.description = description;
      if (role_id) updateData.role_id = role_id;
      if (is_active !== undefined) updateData.is_active = is_active;
      
      // Hash password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, config.hashing.bcrypt.rounds);
      }
      
      // Update user
      await user.update(updateData);
      
        // Get the updated user with role information
      const updatedUser = await User.findByPk(id, {
        include: [
          { 
            model: Role, 
            as: 'role',
            attributes: ['id', 'name'] 
          }
        ],
        attributes: { exclude: ['password'] }
      });
      
      return responseUtils.ok(res, {
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Delete user (admin only)
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find user
      const user = await User.findByPk(id);
      
      if (!user) {
        return responseUtils.notFound(res);
      }
      
      // Delete user
      await user.destroy();
      
      return responseUtils.ok(res, { message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const id = req.user.id;
      
      const user = await User.findByPk(id, {
        include: [
          { 
            model: Role, 
            as: 'role',
            attributes: ['id', 'name'] 
          },
          {
            model: user_media,
            include: [{ model: media }]
          },
          {
            model: setting
          }
        ],
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.ok(res, { user });
    } catch (error) {
      console.error('Get profile error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const id = req.user.id;
      const { username, email, password, description, current_password } = req.body;
      
      // Find user
      const user = await User.findByPk(id);
      
      if (!user) {
        return responseUtils.notFound(res);
      }
      
        // Check if current password is provided when updating password or other fields
      if ((username !== user.username || email !== user.email || password) && current_password) {
        const isPasswordValid = await bcrypt.compare(current_password, user.password);
        if (!isPasswordValid) {
          return responseUtils.unauthorized(res, 'Current password is incorrect');
        }
      }
      
      // Check if username or email already exists
      if (username && username !== user.username) {
        const existingUsername = await User.findOne({
          where: { username }
        });
        
        if (existingUsername) {
          return responseUtils.invalidated(res, {
            errors: [{ message: 'Username already exists' }]
          });
        }
      }
      
      if (email && email !== user.email) {
        const existingEmail = await User.findOne({
          where: { email }
        });
        
        if (existingEmail) {
          return responseUtils.invalidated(res, {
            errors: [{ message: 'Email already exists' }]
          });
        }
      }
      
      // Prepare update data
      const updateData = {};
      
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (description !== undefined) updateData.description = description;
      
        // Hash password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, config.hashing.bcrypt.rounds);
      }
      
      // Update user
      await user.update(updateData);
      
        // Get the updated user with role information
      const updatedUser = await User.findByPk(id, {
        include: [
          { 
            model: Role, 
            as: 'role',
            attributes: ['id', 'name'] 
          }
        ],
        attributes: { exclude: ['password'] }
      });
      
      return responseUtils.ok(res, {
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Save user settings
  saveSettings: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { settings } = req.body;
      
        // Validate settings
      const [userSettings, created] = await setting.findOrCreate({
        where: { user_id },
        defaults: {
          user_id,
          settings
        }
      });
      
        // If settings already exist, update them
      if (!created) {
        await userSettings.update({ settings });
      }
      
      return responseUtils.ok(res, {
        message: 'Settings saved successfully',
        settings: userSettings
      });
    } catch (error) {
      console.error('Save settings error:', error);
      return responseUtils.error(res, error.message);
    }
  }
};

module.exports = userController;