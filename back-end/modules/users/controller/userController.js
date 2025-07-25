const responseUtils = require('utils/responseUtils');
const userService = require('../service/userService');
const { User } = require('../../../models');
const cloudinary = require('cloudinary').v2;
const uploadService = require('../../upload/service/uploadService');

const userController = {
  // GET /api/users
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', role_id } = req.query;
      const result = await userService.getAllUsers({
        page: Number(page),
        limit: Number(limit),
        search,
        role_id
      });
      return responseUtils.success(res, result);
    } catch (error) {
      console.error('Get all users error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  // GET /api/users/:id
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      return responseUtils.success(res, { user });
    } catch (error) {
      console.error('Get user by ID error:', error);
      return error.message === 'User not found'
        ? responseUtils.notFound(res, 'User not found')
        : responseUtils.serverError(res, error.message);
    }
  },

  // POST /api/users
  createUser: async (req, res) => {
    try {
      const userData = req.body;
      // Provide a default avatar if one is not provided
      if (!userData.avatar) {
        userData.avatar = 'assets/images/default-avatar.jpg';
      }
      // Tạo người dùng mới
      const newUser = await userService.createUser(userData);
  
      // Trả về phản hồi thành công với thông tin người dùng mới
      return responseUtils.created(res, {
        message: 'User created successfully',
        user: newUser
      });
    } catch (error) {
      console.error('Create user error:', error);
  
      // Kiểm tra xem lỗi có phải là do người dùng đã tồn tại (username hoặc email)
      if (error.message.includes('already exists')) {
        return responseUtils.conflict(res, error.message); // Trả về mã lỗi 409 Conflict
      }
  
      // Nếu có lỗi khác, trả về mã lỗi 500 Server Error
      return responseUtils.serverError(res, error.message);
    }
  },
  

  // PUT /api/users/:id
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await userService.updateUser(id, req.body);
      return responseUtils.success(res, {
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

  // DELETE /api/users/:id
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      return responseUtils.success(res, { message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      return error.message === 'User not found'
        ? responseUtils.notFound(res, 'User not found')
        : responseUtils.serverError(res, error.message);
    }
  },

  // GET /api/users/me
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const user = await userService.getProfile(userId);
      return responseUtils.success(res, { user });
      
    } catch (error) {
      console.error('Get profile error:', error);
      
      if (error.message === 'User not found') {
        return responseUtils.notFound(res, 'User not found');
      }
      
      return responseUtils.serverError(res, error.message);
    }
  },

  // PUT /api/users/me
  updateProfile: async (req, res) => {
    try {
      const id = req.user.id;
      const updatedUser = await userService.updateProfile(id, req.body);
      return responseUtils.success(res, {
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.message === 'User not found') {
        return responseUtils.notFound(res, 'User not found');
      }
      if (error.message === 'Current password is incorrect') {
        return responseUtils.unauthorized(res, error.message);
      }
      if (error.message.includes('already exists')) {
        return responseUtils.conflict(res, error.message);
      }
      return responseUtils.serverError(res, error.message);
    }
  },
  /**
 * @desc Change current user's password
 * @route PUT /api/users/me/change-password
 * @access Private
 */
changePassword: async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    await userService.changePassword(userId, currentPassword, newPassword);

    return responseUtils.success(res, { message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    if (error.message === 'User not found') {
      return responseUtils.notFound(res, 'User not found');
    }
    if (error.message === 'Current password is incorrect') {
      return responseUtils.unauthorized(res, 'Current password is incorrect');
    }
    return responseUtils.serverError(res, error.message);
  }
},
  // POST /api/users/me/settings
  saveSettings: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { settings } = req.body;
      const savedSettings = await userService.saveSettings(user_id, settings);
      return responseUtils.success(res, {
        message: 'Settings saved successfully',
        settings: savedSettings
      });
    } catch (error) {
      console.error('Save settings error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  uploadAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return responseUtils.badRequest(res, 'No file uploaded');
      }
      // Upload lên Cloudinary
      const result = await uploadService.processCloudinaryUpload(req.file, { type: 'avatar' });
      const avatarUrl = result.secure_url || result.url;

      // Cập nhật avatar cho user hiện tại
      const userId = req.user.id;
      await User.update({ avatar: avatarUrl }, { where: { id: userId } });

      return responseUtils.success(res, { avatar: avatarUrl }, 'Avatar updated successfully');
    } catch (err) {
      return responseUtils.serverError(res, err.message);
    }
  },

  /**
   * @desc Delete current user's account
   * @route DELETE /api/users/me
   * @access Private
   */
  deleteAccount: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword } = req.body;

      if (!currentPassword) {
        return responseUtils.badRequest(res, 'Current password is required to delete account');
      }

      await userService.deleteAccount(userId, currentPassword);

      return responseUtils.success(res, { message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      if (error.message === 'User not found') {
        return responseUtils.notFound(res, 'User not found');
      }
      if (error.message === 'Current password is incorrect') {
        return responseUtils.unauthorized(res, 'Current password is incorrect');
      }
      if (error.message === 'Failed to delete user account') {
        return responseUtils.serverError(res, 'Failed to delete account. Please try again.');
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  // POST /api/users/:id/block
  blockUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userService.blockUser(id);
      return responseUtils.success(res, { message: 'User blocked successfully', user });
    } catch (error) {
      console.error('Block user error:', error);
      if (error.message === 'User not found') {
        return responseUtils.notFound(res, 'User not found');
      }
      if (error.message === 'User is already blocked') {
        return responseUtils.conflict(res, 'User is already blocked');
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  // POST /api/users/:id/unblock
  unblockUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userService.unblockUser(id);
      return responseUtils.success(res, { message: 'User unblocked successfully', user });
    } catch (error) {
      console.error('Unblock user error:', error);
      if (error.message === 'User not found') {
        return responseUtils.notFound(res, 'User not found');
      }
      if (error.message === 'User is already active') {
        return responseUtils.conflict(res, 'User is already active');
      }
      return responseUtils.serverError(res, error.message);
    }
  },
};

module.exports = userController;
