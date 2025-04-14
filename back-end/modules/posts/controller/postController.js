const postService = require('./postService');
const responseUtils = require('utils/responseUtils');

class PostController {
  // Get all posts
  async getAllPosts(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category_id, 
        search, 
        user_id,
        sort = 'latest' 
      } = req.query;
      
      const result = await postService.getAllPosts({
        page,
        limit,
        categoryId: category_id,
        search,
        userId: user_id,
        sort
      });
      
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error('Get all posts error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  // Get post by ID
  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const post = await postService.getPostById(id);
      
      if (!post) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.ok(res, { post });
    } catch (error) {
      console.error('Get post by ID error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  // Get post by slug
  async getPostBySlug(req, res) {
    try {
      const { slug } = req.params;
      const post = await postService.getPostBySlug(slug);
      
      if (!post) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.ok(res, { post });
    } catch (error) {
      console.error('Get post by slug error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  // Create new post
  async createPost(req, res) {
    try {
      const user_id = req.user.id;
      const postData = req.body;
      
      const post = await postService.createPost(user_id, postData);
      
      return responseUtils.created(res, { 
        message: 'Post created successfully',
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug
        }
      });
    } catch (error) {
      console.error('Create post error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  // Update post
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;
      const isAdmin = req.user.role === 'Admin';
      const updateData = req.body;
      
      const post = await postService.updatePost(id, user_id, isAdmin, updateData);
      
      if (!post) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.ok(res, { 
        message: 'Post updated successfully',
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug
        }
      });
    } catch (error) {
      console.error('Update post error:', error);
      if (error.message === 'Unauthorized to update this post') {
        return responseUtils.unauthorized(res, error.message);
      }
      return responseUtils.error(res, error.message);
    }
  }
  
  // Delete post
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;
      const isAdmin = req.user.role === 'Admin';
      
      const success = await postService.deletePost(id, user_id, isAdmin);
      
      if (!success) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.ok(res, { message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Delete post error:', error);
      if (error.message === 'Unauthorized to delete this post') {
        return responseUtils.unauthorized(res, error.message);
      }
      return responseUtils.error(res, error.message);
    }
  }
  // search posts
  async searchPosts(req, res) {
    try {
      const { 
        query,
        page = 1,
        limit = 10,
        category_id,
        user_id,
        status,
        sort,
        date_from,
        date_to
      } = req.query;

      // Only allow status filter for admins
      const finalStatus = req.user?.role === 'Admin' ? status : undefined;

      const result = await postService.searchPosts({
        query,
        page,
        limit,
        category_id,
        user_id,
        status: finalStatus,
        sort,
        date_from,
        date_to
      });

      return responseUtils.ok(res, {
        query,
        results: result.posts,
        pagination: result.pagination,
        filters: {
          category_id,
          user_id,
          status: finalStatus,
          date_range: { from: date_from, to: date_to }
        }
      });
    } catch (error) {
      console.error('Search posts error:', error);
      return responseUtils.error(res, 'Failed to search posts');
    }
  }
  // Get posts by author
  async getPostsByAuthor(req, res) {
    try {
      const { userId } = req.params;
      const { 
        page = 1,
        limit = 10,
        status,
        sort
      } = req.query;

      // Only allow status filter for admins or the author themselves
      const isAdmin = req.user?.role === 'Admin';
      const isOwner = req.user?.id === parseInt(userId);
      const finalStatus = (isAdmin || isOwner) ? status : 'published';

      const result = await postService.getPostsByAuthor({
        userId,
        page,
        limit,
        status: finalStatus,
        sort
      });

      return responseUtils.ok(res, {
        author_id: userId,
        posts: result.posts,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get posts by author error:', error);
      return responseUtils.error(res, 'Failed to get author posts');
    }
  }
  // Get posts by category
  async getPostsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await postService.getPostsByCategory(categoryId, { page, limit });
      
      if (!result) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error('Get posts by category error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  // Get user's own posts
  async getMyPosts(req, res) {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await postService.getUserPosts(user_id, { page, limit });
      
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error('Get my posts error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  // Get user's drafts
  async getMyDrafts(req, res) {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await postService.getUserPosts(user_id, { 
        page, 
        limit,
        includeDrafts: true
      });
      
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error('Get my drafts error:', error);
      return responseUtils.error(res, error.message);
    }
  }
}

module.exports = new PostController();