const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('models');
const { User, Role, Setting, UserMedia, Media } = db;
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
        { username: { [Op.iLike]: `%${search}%` } }, // Case-insensitive search
        { email: { [Op.iLike]: `%${search}%` } }
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
    
    return {
      users,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  },

  /**
   * Get user by ID with related data
   * @param {number} id - User ID
   * @param {boolean} [includeSensitive=false] - Include sensitive data
   * @returns {Promise<Object>} - User object
   */
  getUserById: async (id, includeSensitive = false) => {
    const attributes = { exclude: ['password'] };
    if (includeSensitive) {
      delete attributes.exclude;
    }
    
    const user = await User.findByPk(id, {
      include: [
        { 
          model: Role, 
          as: 'role',
          attributes: ['id', 'name'] 
        },
        {
          model: Setting,
          as: 'settings',
          attributes: ['id', 'settings']
        },
        {
          model: UserMedia,
          as: 'userMedia',
          include: [{
            model: Media,
            as: 'media',
            attributes: ['id', 'name', 'url', 'type']
          }]
        }
      ],
      attributes
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  },

  /**
   * Create a new user with optional media
   * @param {Object} userData - User data
   * @param {Array<number>} [mediaIds] - Array of media IDs
   * @returns {Promise<Object>} - Created user
   */
  createUser: async (userData) => {
    const transaction = await db.sequelize.transaction();
  
    try {
      const { username, email, password, role_id , description} = userData;
  
      // Kiểm tra xem email và username có tồn tại trong hệ thống không
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { username },
            { email }
          ]
        },
        transaction
      });
  
      if (existingUser) {
        // Nếu email hoặc username đã tồn tại, ném lỗi và rollback giao dịch
        await transaction.rollback(); // Đảm bảo rollback nếu có lỗi
        throw new Error(existingUser.email === email ? 'Email must be unique' : 'Username must be unique');
      }
  
      // Mã hóa password
      const hashedPassword = await bcrypt.hash(password, config.hashing.bcrypt.rounds);
  
      // Tạo người dùng mới
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role_id,
        description,
        is_active: true // Mặc định là true
      }, { transaction });
  
      // Commit giao dịch nếu tất cả các thao tác đều thành công
      await transaction.commit();
      
      return newUser;
    } catch (error) {
      // Nếu có lỗi xảy ra, rollback giao dịch nếu chưa commit
      if (transaction.finished !== 'commit') {
        await transaction.rollback();
      }
      throw error; // Ném lại lỗi để controller xử lý
    }
  },
  
  /**
   * Update user with transaction support
   * @param {number} id - User ID
   * @param {Object} updateData - Data to update
   * @param {Array<number>} [mediaIds] - New media IDs
   * @returns {Promise<Object>} - Updated user
   */
  updateUser: async (id, updateData, mediaIds) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const user = await User.findByPk(id, { transaction });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Validate username/email uniqueness
      if (updateData.username && updateData.username !== user.username) {
        const existing = await User.findOne({ 
          where: { username: updateData.username },
          transaction
        });
        if (existing) throw new Error('Username already exists');
      }
      
      if (updateData.email && updateData.email !== user.email) {
        const existing = await User.findOne({ 
          where: { email: updateData.email },
          transaction
        });
        if (existing) throw new Error('Email already exists');
      }
      
      // Hash new password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(
          updateData.password,
          config.hashing.bcrypt.rounds
        );
      }
      
      // Update user
      await user.update(updateData, { transaction });
      
      // Update media if provided
      if (Array.isArray(mediaIds)) {
        // Remove existing media
        await UserMedia.destroy({ 
          where: { user_id: id },
          transaction
        });
        
        // Add new media
        if (mediaIds.length > 0) {
          await UserMedia.bulkCreate(
            mediaIds.map(mediaId => ({
              user_id: id,
              media_id: mediaId
            })),
            { transaction }
          );
        }
      }
      
      await transaction.commit();
      return await userService.getUserById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  /**
   * Delete user and related data
   * @param {number} id - User ID
   * @returns {Promise<boolean>} - True if successful
   */
  deleteUser: async (id) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Delete related data first
      await Setting.destroy({ where: { user_id: id }, transaction });
      await UserMedia.destroy({ where: { user_id: id }, transaction });
      
      // Delete user
      const deleted = await User.destroy({ 
        where: { id },
        transaction
      });
      
      if (!deleted) {
        throw new Error('User not found');
      }
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
    /**
   * Get profile of currently authenticated user
   * @param {number} userId - ID of the user (from token)
   * @returns {Promise<Object>} - User profile
   */
    getProfile: async (userId) => {
      const user = await User.findByPk(userId, {
        include: [
          { 
            model: Role, 
            as: 'role',
            attributes: ['id', 'name'] 
          },
          {
            model: Setting,
            as: 'settings',
            attributes: ['id', 'settings']
          },
          {
            model: UserMedia,
            as: 'userMedia',
            include: [{
              model: Media,
              as: 'media',
              attributes: ['id', 'name', 'url', 'type']
            }]
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
   * Update user profile with password verification
   * @param {number} id - User ID
   * @param {Object} updateData - Profile data
   * @param {string} currentPassword - For sensitive changes
   * @returns {Promise<Object>} - Updated user
   */
  updateProfile: async (id, updateData, currentPassword = null) => {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    
    // Verify current password for sensitive changes
    if (currentPassword && (updateData.email || updateData.password)) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) throw new Error('Current password is incorrect');
    }
    
    return await userService.updateUser(id, updateData);
  },

  /**
   * Save user settings
   * @param {number} userId - User ID
   * @param {Object} settings - Settings data
   * @returns {Promise<Object>} - Updated settings
   */
  saveSettings: async (userId, settings) => {
    const [userSettings] = await Setting.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId, settings }
    });
    
    if (!userSettings.isNewRecord) {
      await userSettings.update({ settings });
    }
    
    return userSettings;
  },

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - True if successful
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error('Current password is incorrect');
    
    user.password = await bcrypt.hash(
      newPassword,
      config.hashing.bcrypt.rounds
    );
    
    await user.save();
    return true;
  }
};

module.exports = userService;