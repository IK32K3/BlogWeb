const responseUtils = require('utils/responseUtils');
const mediaService = require('../service/mediaService');

const mediaController = {
  // Get all media
  getAllMedia: async (req, res) => {
    try {
      const { page, limit, search, type, user_id } = req.query;
      
      const result = await mediaService.getAllMedia({
        page,
        limit,
        search,
        type,
        user_id
      });
      
      return responseUtils.success(res, result);
    } catch (error) {
      console.error('Get all media error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Get media by ID
  getMediaById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const mediaItem = await mediaService.getMediaById(id);
      
      if (!mediaItem) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.success(res, { media: mediaItem });
    } catch (error) {
      console.error('Get media by ID error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Create media
  createMedia: async (req, res) => {
    try {
      const { name, url, type, user_id } = req.body;
      
      // Use authenticated user ID if no user_id provided
      const userId = user_id || (req.user ? req.user.id : null);
      
      const mediaItem = await mediaService.createMedia({
        name,
        url,
        type,
        user_id: userId
      });
      
      return responseUtils.success(res, {
        message: 'Media created successfully',
        media: mediaItem
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
      
      const mediaItem = await mediaService.updateMedia(id, {
        name,
        url,
        type
      });
      
      if (!mediaItem) {
        return responseUtils.notFound(res);
      }
      
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
      
      const deleted = await mediaService.deleteMedia(id);
      
      if (!deleted) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.success(res, { message: 'Media deleted successfully' });
    } catch (error) {
      console.error('Delete media error:', error);
      return responseUtils.serverError(res, error.message);
    }
  }
};

module.exports = mediaController;