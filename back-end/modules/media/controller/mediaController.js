const { Op } = require('sequelize');
const { Media, user_media } = require('models');
const responseUtils = require('utils/responseUtils');

const mediaController = {
  // Get all media
  getAllMedia: async (req, res) => {
    try {
      const { page = 1, limit = 20, search, type, user_id } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {};
      
      if (type) {
        whereClause.type = type;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { url: { [Op.like]: `%${search}%` } }
        ];
      }
      
      // Include if filtering by user
      const include = [];
      if (user_id) {
        include.push({
          model: user_media,
          where: { user_id }
        });
      }
      
      // Fetch media
      const { count, rows: mediaItems } = await Media.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include
      });
      
      const totalPages = Math.ceil(count / limit);
      
      return responseUtils.success(res, {
        media: mediaItems,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get all media error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Get media by ID
  getMediaById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const mediaItem = await Media.findByPk(id);
      
      if (!mediaItem) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.success(res, { Media: mediaItem });
    } catch (error) {
      console.error('Get media by ID error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Create media
  createMedia: async (req, res) => {
    try {
      const { name, url, type, user_id } = req.body;
      
      // Create media
      const mediaItem = await Media.create({
        name,
        url,
        type
      });
      
      // Associate with user if provided
      if (user_id) {
        await user_media.create({
          user_id,
          media_id: mediaItem.id
        });
      }
      
      return responseUtils.success(res, {
        message: 'Media created successfully',
        Media: mediaItem
      });
    } catch (error) {
      console.error('Create media error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Update media
  updateMedia: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, url, type } = req.body;
      
      // Find media
      const mediaItem = await Media.findByPk(id);
      
      if (!mediaItem) {
        return responseUtils.notFound(res);
      }
      
      // Update media
      await mediaItem.update({
        name: name || mediaItem.name,
        url: url || mediaItem.url,
        type: type || mediaItem.type
      });
      
      return responseUtils.success(res, {
        message: 'Media updated successfully',
        media: mediaItem
      });
    } catch (error) {
      console.error('Update media error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Delete media
  deleteMedia: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find Media
      const mediaItem = await Media.findByPk(id);
      
      if (!mediaItem) {
        return responseUtils.notFound(res);
      }
      
      // Delete media
      await mediaItem.destroy();
      
      return responseUtils.success(res, { message: 'Media deleted successfully' });
    } catch (error) {
      console.error('Delete media error:', error);
      return responseUtils.serverError(res, error.message);
    }
  }
};

module.exports = mediaController;