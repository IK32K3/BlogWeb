const { Comment, Post, User } = require('models');
const { Op } = require('sequelize');

module.exports = {
  /**
   * Bật/tắt bình luận cho bài post
   */
  setCommentsEnabled: async (postId, enabled) => {
    const post = await Post.findByPk(postId);
    if (!post) throw new Error('Post not found');
    await post.update({ allow_comments: !!enabled });
    return post;
  },

  /**
   * Get comments by post ID with pagination
   */
  getCommentsByPost: async (postId, { page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;
    
    // Verify post exists
    const postExists = await Post.findByPk(postId);
    if (!postExists) {
      throw new Error('Post not found');
    }
    
    // Nếu post không cho phép bình luận
    if (postExists.allow_comments === false) {
      return {
        comments: [],
        pagination: {
          total: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      };
    }
    
    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { post_id: postId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        { 
          model: User,
          as: 'user',
          attributes: ['id', 'username','avatar']
        }
      ]
    });
    
    return {
      comments,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  },

  /**
   * Add a new comment to a post
   */
  addComment: async (postId, userId, content) => {
    // Verify post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    
    // Nếu post không cho phép bình luận
    if (post.allow_comments === false) {
      throw new Error('Comments are disabled for this post');
    }
    
    const comment = await Comment.create({
      post_id: postId,
      user_id: userId,
      content
    });
    
    // Return comment with user info
    return Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
            as: 'user',
          attributes: ['id', 'username','avatar']
        }
      ]
    });
  },

  /**
   * Update an existing comment
   */
  updateComment: async (commentId, userId, userRole, content) => {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    // Check authorization
    if (comment.user_id !== userId && userRole !== 'Admin') {
      throw new Error('Unauthorized to update this comment');
    }
    
    await comment.update({ content });
    
    // Return updated comment with user info
    return Comment.findByPk(commentId, {
      include: [
        {
          model: User,
            as: 'user',
          attributes: ['id', 'username','avatar']
        }
      ]
    });
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId, userId, userRole) => {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    // Check if user is comment owner, post owner, or admin
    if (comment.user_id !== userId && userRole !== 'Admin') {
      const post = await Post.findByPk(comment.post_id);
      if (!post || post.user_id !== userId) {
        throw new Error('Unauthorized to delete this comment');
      }
    }
    
    await comment.destroy();
    return true;
  },

  /**
   * Get user's comments with pagination
   */
  getMyComments: async (userId, { page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;
    
    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { user_id: userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title', 'slug']
        }
      ]
    });
    
    return {
      comments,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  },

  /**
   * Get all comments with pagination (admin only)
   */
  getAllComments: async ({ page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;
    
    const { count, rows: comments } = await Comment.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username','avatar']
        },
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title', 'slug']
        }
      ]
    });
    
    return {
      comments,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  }
};