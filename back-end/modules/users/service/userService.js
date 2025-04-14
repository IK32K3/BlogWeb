const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Role, Setting, UserMedia, Media } = require('models');
const { config } = require('configs');

const userService = {
  /**
   * Get all users with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search term
   * @param {number} options.role_id - Role ID filter
   * @returns {Promise<Object>} - Users and pagination info
   */
  getAllUsers: async ({ page = 1, limit = 10, search, role_id }) => {
    const offset = (page - 1) * limit;
    
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
    
    return {
      users,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  },

  /**
   * Get user by ID with related data
   * @param {number} id - User ID
   * @returns {Promise<Object>} - User object
   */
  getUserById: async (id) => {
    const user = await User.findByPk(id, {
      include: [
        { 
          model: Role, 
          as: 'role',
          attributes: ['id', 'name'] 
        },
        {
          model: UserMedia,
          include: [{ model: Media }]
        },
        {
          model: Setting
        }
      ],
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @param {number} userData.role_id - Role ID
   * @param {string} [userData.description] - Description
   * @param {boolean} [userData.is_active] - Active status
   * @returns {Promise<Object>} - Created user
   */
  createUser: async ({ username, email, password, role_id, description = '', is_active = true }) => {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });
    
    if (existingUser) {
      throw new Error(existingUser.username === username ? 'Username already exists' : 'Email already exists');
    }
    
    const hashedPassword = await bcrypt.hash(password, config.hashing.bcrypt.rounds);
    
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role_id,
      description,
      is_active
    });
    
    return await User.findByPk(user.id, {
      include: [
        { 
          model: Role, 
          as: 'role',
          attributes: ['id', 'name'] 
        }
      ],
      attributes: { exclude: ['password'] }
    });
  },

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.username] - New username
   * @param {string} [updateData.email] - New email
   * @param {string} [updateData.password] - New password
   * @param {number} [updateData.role_id] - New role ID
   * @param {string} [updateData.description] - New description
   * @param {boolean} [updateData.is_active] - New active status
   * @returns {Promise<Object>} - Updated user
   */
  updateUser: async (id, { username, email, password, role_id, description, is_active }) => {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        throw new Error('Username already exists');
      }
    }
    
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }
    
    const updateData = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (description !== undefined) updateData.description = description;
    if (role_id) updateData.role_id = role_id;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, config.hashing.bcrypt.rounds);
    }
    
    await user.update(updateData);
    
    return await User.findByPk(id, {
      include: [
        { 
          model: Role, 
          as: 'role',
          attributes: ['id', 'name'] 
        }
      ],
      attributes: { exclude: ['password'] }
    });
  },

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  deleteUser: async (id) => {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    await user.destroy();
    return true;
  },

  /**
   * Get user profile with related data
   * @param {number} id - User ID
   * @returns {Promise<Object>} - User profile
   */
  getProfile: async (id) => {
    const user = await User.findByPk(id, {
      include: [
        { 
          model: Role, 
          as: 'role',
          attributes: ['id', 'name'] 
        },
        {
          model: UserMedia,
          include: [{ model: Media }]
        },
        {
          model: Setting
        }
      ],
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  },

  /**
   * Update user profile
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.username] - New username
   * @param {string} [updateData.email] - New email
   * @param {string} [updateData.password] - New password
   * @param {string} [updateData.description] - New description
   * @param {string} [updateData.current_password] - Current password for verification
   * @returns {Promise<Object>} - Updated user
   */
  updateProfile: async (id, { username, email, password, description, current_password }) => {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if ((username !== user.username || email !== user.email || password) && current_password) {
      const isPasswordValid = await bcrypt.compare(current_password, user.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
    }
    
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        throw new Error('Username already exists');
      }
    }
    
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }
    
    const updateData = {};
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (description !== undefined) updateData.description = description;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, config.hashing.bcrypt.rounds);
    }
    
    await user.update(updateData);
    
    return await User.findByPk(id, {
      include: [
        { 
          model: Role, 
          as: 'role',
          attributes: ['id', 'name'] 
        }
      ],
      attributes: { exclude: ['password'] }
    });
  },

  /**
   * Save user settings
   * @param {number} user_id - User ID
   * @param {Object} settings - Settings object
   * @returns {Promise<Object>} - Saved settings
   */
  saveSettings: async (user_id, settings) => {
    const [userSettings, created] = await Setting.findOrCreate({
      where: { user_id },
      defaults: {
        user_id,
        settings
      }
    });
    
    if (!created) {
      await userSettings.update({ settings });
    }
    
    return userSettings;
  },

  /**
   * Verify user credentials
   * @param {string} usernameOrEmail - Username or email
   * @param {string} password - Password
   * @returns {Promise<Object>} - User object without password if valid
   */
  verifyCredentials: async (usernameOrEmail, password) => {
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      },
      include: [
        { 
          model: Role, 
          as: 'role',
          attributes: ['id', 'name'] 
        }
      ]
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    
    const userJson = user.toJSON();
    delete userJson.password;
    return userJson;
  }
};

module.exports = userService;