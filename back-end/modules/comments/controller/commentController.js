const { comments, Post, User } = require('models');
const responseUtils = require('utils/responseUtils');

const commentController = {
  // Get comments for a post
  getCommentsByPost: async (req, res) => {
    try {
      const { postId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Check if post exists
      const post = await Post.findByPk(postId);
      
      if (!post) {
        return responseUtils.notFound(res);
      }
      
      // Fetch comments
      const { count, rows: postComments } = await comments.findAndCountAll({
        where: { post_id: postId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [
          { 
            model: User, 
            attributes: ['id', 'username'] 
          }
        ]
      });
      
      const totalPages = Math.ceil(count / limit);
      
      return responseUtils.ok(res, {
        comments: postComments,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get comments by post error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Add a comment to a post
  addComment: async (req, res) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const user_id = req.user.id;
      
      // Check if post exists
      const post = await Post.findByPk(postId);
      
      if (!post) {
        return responseUtils.notFound(res);
      }
      
      // Create comment
      const comment = await comments.create({
        post_id: postId,
        user_id,
        content
      });
      
      // Fetch the created comment with user info
      const newComment = await comments.findByPk(comment.id, {
        include: [
          { 
            model: User, 
            attributes: ['id', 'username'] 
          }
        ]
      });
      
      return responseUtils.ok(res, {
        message: 'Comment added successfully',
        comment: newComment
      });
    } catch (error) {
      console.error('Add comment error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Update a comment
  updateComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      
      // Find comment
      const comment = await comments.findByPk(commentId);
      
      if (!comment) {
        return responseUtils.notFound(res);
      }
      
      // Check if user is the owner or admin
      if (comment.user_id !== req.user.id && req.user.role !== 'Admin') {
        return responseUtils.unauthorized(res, 'You are not authorized to update this comment');
      }
      
      // Update comment
      await comment.update({ content });
      
      // Fetch the updated comment with user info
      const updatedComment = await comments.findByPk(commentId, {
        include: [
          { 
            model: User, 
            attributes: ['id', 'username'] 
          }
        ]
      });
      
      return responseUtils.ok(res, {
        message: 'Comment updated successfully',
        comment: updatedComment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Delete a comment
  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      
      // Find comment
      const comment = await comments.findByPk(commentId);
      
      if (!comment) {
        return responseUtils.notFound(res);
      }
      
      // Check if user is the owner, post owner, or admin
      if (comment.user_id !== req.user.id && req.user.role !== 'Admin') {
        // Check if user is the post owner
        const post = await Post.findByPk(comment.post_id);
        if (!post || post.user_id !== req.user.id) {
          return responseUtils.unauthorized(res, 'You are not authorized to delete this comment');
        }
      }
      
      // Delete comment
      await comment.destroy();
      
      return responseUtils.ok(res, { message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Delete comment error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Get user's own comments
  getMyComments: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Fetch comments
      const { count, rows: userComments } = await comments.findAndCountAll({
        where: { user_id },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [
          { 
            model: Post, 
            attributes: ['id', 'title', 'slug']
          }
        ]
      });
      
      const totalPages = Math.ceil(count / limit);
      
      return responseUtils.ok(res, {
        comments: userComments,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get my comments error:', error);
      return responseUtils.error(res, error.message);
    }
  }
};

module.exports = commentController;