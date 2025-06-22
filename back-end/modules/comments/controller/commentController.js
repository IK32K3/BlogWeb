const commentService = require('../service/commentService');
const responseUtils = require('utils/responseUtils');

module.exports = {
  getCommentsByPost: async (req, res) => {
    try {
      const { postId } = req.params;
      const result = await commentService.getCommentsByPost(postId, req.query);
      return responseUtils.success(res, result);
    } catch (error) {
      console.error('Get comments error:', error);
      if (error.message === 'Post not found') {
        return responseUtils.notFound(res);
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  addComment: async (req, res) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const comment = await commentService.addComment(postId, req.user.id, content);
      return responseUtils.success(res, {
        message: 'Comment added successfully',
        comment
      });
    } catch (error) {
      console.error('Add comment error:', error);
      if (error.message === 'Post not found') {
        return responseUtils.notFound(res);
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  updateComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const comment = await commentService.updateComment(
        commentId, 
        req.user.id, 
        req.user.role,
        content
      );
      return responseUtils.success(res, {
        message: 'Comment updated successfully',
        comment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      if (error.message === 'Comment not found') {
        return responseUtils.notFound(res);
      }
      if (error.message.includes('Unauthorized')) {
        return responseUtils.forbidden(res, error.message);
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      await commentService.deleteComment(commentId, req.user.id, req.user.role);
      return responseUtils.success(res, { message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Delete comment error:', error);
      if (error.message === 'Comment not found') {
        return responseUtils.notFound(res);
      }
      if (error.message.includes('Unauthorized')) {
        return responseUtils.forbidden(res, error.message);
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  getMyComments: async (req, res) => {
    try {
      const result = await commentService.getMyComments(req.user.id, req.query);
      return responseUtils.success(res, result);
    } catch (error) {
      console.error('Get my comments error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  getAllComments: async (req, res) => {
    try {
      const result = await commentService.getAllComments(req.query);
      return responseUtils.success(res, result);
    } catch (error) {
      console.error('Get all comments error:', error);
      return responseUtils.serverError(res, error.message);
    }
  }
};