const postService = require('../service/postService');
const responseUtils = require('../../../utils/responseUtils');

// Helper functions
const parseIntOrDefault = (value, defaultValue) => {
  if (value === undefined || value === null) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const parsePositiveInt = (value) => {
  if (value === undefined || value === null) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
};

class PostController {
  // [GET] /posts - Get all posts
  async getAllPosts(req, res) {
    try {
      const { page, limit, categoryId, search, status, sort, year, autocomplete, search_priority, relevance_sort } = req.query;

      // Xây dựng bộ lọc
      const filters = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        categoryId: parseInt(categoryId) || null,
        search: search || null,
        status: status || 'published', // Mặc định chỉ lấy bài đã published
        sort: sort || 'latest',
        search_priority: search_priority || null,
        relevance_sort: relevance_sort === 'true' || false,
      };

      // Xử lý bộ lọc theo năm
      if (req.query.date_from && req.query.date_to) {
        filters.dateFrom = new Date(req.query.date_from);
        filters.dateTo = new Date(req.query.date_to);
      } else if (year && !isNaN(parseInt(year))) {
        filters.dateFrom = new Date(`${year}-01-01T00:00:00Z`);
        filters.dateTo = new Date(`${year}-12-31T23:59:59Z`);
      }
      
      const result = await postService.getPosts(filters); // Gọi hàm đã hợp nhất

      // Nếu là autocomplete, chỉ trả về id, title, thumbnail
      if (autocomplete === 'true') {
        result.posts = result.posts.map(post => ({
          id: post.id,
          title: post.title,
          thumbnail: post.thumbnail
        }));
      }

      return responseUtils.success(res, result);
    } catch (error) {
      console.error('[PostController.getAllPosts] Error:', error);
      return responseUtils.serverError(res, 'Failed to retrieve posts');
    }
  }

  // [GET] /posts/my - Get current user's posts
  async getMyPosts(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }

      const { page, limit, includeDrafts } = req.query;

      const result = await postService.getUserPosts(userId, {
        page: parseIntOrDefault(page, 1),
        limit: parseIntOrDefault(limit, 10),
        includeDrafts: includeDrafts === 'true'
      });

      return responseUtils.success(res, result);
    } catch (error) {
      console.error('[PostController.getMyPosts] Error:', error);
      return responseUtils.serverError(res, 'Failed to retrieve your posts');
    }
  }

  // [GET] /posts/category/:categoryId - Get posts by category
  async getPostsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const parsedCategoryId = parsePositiveInt(categoryId);
      if (!parsedCategoryId) {
        return responseUtils.badRequest(res, 'Invalid category ID');
      }

      const { page, limit } = req.query;

      const result = await postService.getPostsByCategory(parsedCategoryId, {
        page: parseIntOrDefault(page, 1),
        limit: parseIntOrDefault(limit, 10)
      });

      if (!result) {
        return responseUtils.notFound(res, 'Category not found');
      }

      return responseUtils.success(res, result);
    } catch (error) {
      console.error('[PostController.getPostsByCategory] Error:', error);
      return responseUtils.serverError(res, 'Failed to retrieve category posts');
    }
  }

  // [GET] /posts/author/:userId - Get posts by author
  async getPostsByAuthor(req, res) {
    try {
      const { userId } = req.params;
      const parsedUserId = parsePositiveInt(userId);
      if (!parsedUserId) {
        return responseUtils.badRequest(res, 'Invalid user ID');
      }

      const { page, limit, status, sort } = req.query;

      // Check if requester is admin or the author
      const isAdmin = req.user?.role === 'Admin';
      const isOwner = req.user?.id === parsedUserId;
      const showAllStatuses = isAdmin || isOwner;

      const result = await postService.getPostsByAuthor({
        userId: parsedUserId,
        page: parseIntOrDefault(page, 1),
        limit: parseIntOrDefault(limit, 10),
        status: showAllStatuses ? status : 'published',
        sort: sort || 'newest'
      });

      return responseUtils.success(res, result);
    } catch (error) {
      console.error('[PostController.getPostsByAuthor] Error:', error);
      return responseUtils.serverError(res, 'Failed to get author posts');
    }
  }

  // [GET] /posts/:id - Get post by ID
  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const parsedId = parsePositiveInt(id);
      if (!parsedId) {
        return responseUtils.badRequest(res, 'Invalid post ID');
      }

      const post = await postService.getPostById(parsedId);
      if (!post) {
        return responseUtils.notFound(res);
      }

      return responseUtils.success(res, { post });
    } catch (error) {
      console.error('[PostController.getPostById] Error:', error);
      return responseUtils.serverError(res, 'Failed to retrieve post');
    }
  }

  // [GET] /posts/slug/:slug - Get post by slug
  async getPostBySlug(req, res) {
    try {
      const { slug } = req.params;
      if (!slug) {
        return responseUtils.badRequest(res, 'Slug is required');
      }

      const post = await postService.getPostBySlug(slug);
      if (!post) {
        return responseUtils.notFound(res);
      }

      return responseUtils.success(res, { post });
    } catch (error) {
      console.error('[PostController.getPostBySlug] Error:', error);
      return responseUtils.serverError(res, 'Failed to retrieve post');
    }
  }

  /**
   * [CẬP NHẬT] Tích hợp gửi file và bản dịch cho service
   */
  async createPost(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }
      
      // Tách dữ liệu
      const { translations, ...postData } = req.body;
      
      // Kiểm tra thumbnail file
      if (!req.files || !req.files.thumbnail || !req.files.thumbnail[0]) {
        return responseUtils.badRequest(res, 'Thumbnail image file is required');
      }

      const thumbnailFile = req.files.thumbnail[0];

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(thumbnailFile.mimetype)) {
        return responseUtils.badRequest(res, 'Invalid file type. Only JPEG, PNG, GIF, WEBP and SVG are allowed');
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (thumbnailFile.size > maxSize) {
        return responseUtils.badRequest(res, 'File size too large. Maximum size is 5MB');
      }

      // Gán user_id vào dữ liệu post
      postData.user_id = userId;

      // Validate translations format
      let parsedTranslations = [];
      if (translations) {
        if (typeof translations === 'string') {
          try {
            parsedTranslations = JSON.parse(translations);
          } catch (e) {
            return responseUtils.badRequest(res, 'Invalid translations format. Must be a valid JSON string.');
          }
        } else if (Array.isArray(translations)) {
          parsedTranslations = translations;
        } else {
          return responseUtils.badRequest(res, 'Translations must be either a JSON string or an array.');
        }

        // Validate each translation object
        if (!parsedTranslations.every(t => 
          typeof t === 'object' && 
          t !== null && 
          typeof t.locale === 'string' &&
          typeof t.title === 'string' &&
          typeof t.content === 'string' &&
          (t.description === undefined || typeof t.description === 'string')
        )) {
          return responseUtils.badRequest(res, 'Each translation must have locale, title, and content as strings.');
        }
      }

      const post = await postService.createPost(postData, parsedTranslations, thumbnailFile);
      return responseUtils.created(res, post, 'Post created successfully');
    } catch (error) {
      console.error('[PostController.createPost] Error:', error);
      if (error.message.includes('Invalid translations format') || 
          error.message.includes('Thumbnail image is required') ||
          error.message.includes('Failed to upload thumbnail image')) {
        return responseUtils.badRequest(res, error.message);
      }
      return responseUtils.serverError(res, 'Failed to create post');
    }
  }

  /**
   * [CẬP NHẬT] Tích hợp gửi file và bản dịch cho service
   */
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'Admin';

      if (!userId) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }

      const { translations, ...updateData } = req.body;
      const thumbnailFile = req.files && req.files.thumbnail ? req.files.thumbnail[0] : null;

      let parsedTranslations = [];
      if (translations) {
        try {
            parsedTranslations = JSON.parse(translations);
        } catch (e) {
            return responseUtils.badRequest(res, 'Invalid translations format. Must be a JSON string.');
        }
      }

      const post = await postService.updatePost(id, userId, isAdmin, updateData, parsedTranslations, thumbnailFile);
      if (!post) {
        return responseUtils.notFound(res, 'Post not found or you are not authorized');
      }
      
      return responseUtils.success(res, post, 'Post updated successfully');
    } catch (error) {
      console.error('[PostController.updatePost] Error:', error);
      if (error.message.includes('Unauthorized')) {
        return responseUtils.forbidden(res, error.message);
      }
      return responseUtils.serverError(res, 'Failed to update post');
    }
  }

  // [DELETE] /posts/:id - Delete post
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const parsedId = parsePositiveInt(id);
      if (!parsedId) {
        return responseUtils.badRequest(res, 'Invalid post ID');
      }

      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'Admin';
      if (!userId) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }

      // Call service
      const success = await postService.deletePost(parsedId, userId, isAdmin);
      if (!success) {
        return responseUtils.notFound(res);
      }

      return responseUtils.success(res, null, 'Post deleted successfully');
    } catch (error) {
      console.error('[PostController.deletePost] Error:', error);
      return responseUtils.serverError(res, 'Failed to delete post');
    }
  }

  // [PATCH] /posts/:id/status - Update post status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'Admin';

      if (!userId) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }
      if (!status || !['published', 'draft', 'scheduled'].includes(status.toLowerCase())) {
        return responseUtils.badRequest(res, 'Invalid status');
      }

      const updated = await postService.updateStatus(id, userId, isAdmin, status);
      if (!updated) {
        return responseUtils.notFound(res, 'Post not found or not authorized');
      }
      return responseUtils.success(res, null, 'Status updated successfully');
    } catch (error) {
      console.error('[PostController.updateStatus] Error:', error);
      return responseUtils.serverError(res, 'Failed to update status');
    }
  }
}

module.exports = new PostController();