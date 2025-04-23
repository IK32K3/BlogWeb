const { Op } = require('sequelize');
const { Media, UserMedia } = require('models');

const mediaService = {
  /**
   * Get all media with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search term
   * @param {string} options.type - Media type filter
   * @param {number} options.user_id - User ID filter
   * @returns {Promise<Object>} - Media items and pagination info
   */
  getAllMedia: async ({ page = 1, limit = 20, search, type, user_id }) => {
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
        model: UserMedia,
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
    
    return {
      media: mediaItems,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  },
  
  /**
   * Get media by ID
   * @param {number} id - Media ID
   * @returns {Promise<Object|null>} - Media item or null if not found
   */
  getMediaById: async (id) => {
    return await Media.findByPk(id);
  },
  
  /**
   * Create a new media item and optionally associate with a user
   * @param {Object} mediaData - Media data
   * @param {string} mediaData.name - Media name
   * @param {string} mediaData.url - Media URL
   * @param {string} mediaData.type - Media type
   * @param {number} [mediaData.user_id] - User ID to associate with
   * @returns {Promise<Object>} - Created media item
   */
  createMedia: async ({ name, url, type, user_id }) => {
    // Create media
    const mediaItem = await Media.create({
      name,
      url,
      type
    });
    
    // Associate with user if provided
    if (user_id) {
      await UserMedia.create({
        user_id,
        media_id: mediaItem.id
      });
    }
    
    return mediaItem;
  },
  
  /**
   * Update a media item
   * @param {number} id - Media ID
   * @param {Object} mediaData - Updated media data
   * @returns {Promise<Object|null>} - Updated media item or null if not found
   */
  updateMedia: async (id, { name, url, type }) => {
    // Find media
    const mediaItem = await Media.findByPk(id);
    
    if (!mediaItem) {
      return null;
    }
    
    // Update media
    await mediaItem.update({
      name: name || mediaItem.name,
      url: url || mediaItem.url,
      type: type || mediaItem.type
    });
    
    return mediaItem;
  },
  
  /**
   * Delete a media item
   * @param {number} id - Media ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  deleteMedia: async (id) => {
    // Find media
    const mediaItem = await Media.findByPk(id);
    
    if (!mediaItem) {
      return false;
    }
    
    // Delete media
    await mediaItem.destroy();
    
    return true;
  }
};

module.exports = mediaService;