const responseUtils = require('utils/responseUtils');
const languageService = require('../service/languageService');

const languageController = {
  // Get all languages
  getAllLanguages: async (req, res) => {
    try {
      const { page, limit, search, is_active } = req.query;
      
      const result = await languageService.getAllLanguages({
        page,
        limit,
        search,
        is_active
      });
      
      return responseUtils.success(res, result);
    } catch (error) {
      console.error('Get all languages error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Get language by ID
  getLanguageById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const language = await languageService.getLanguageById(id);
      
      if (!language) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.success(res, { language });
    } catch (error) {
      console.error('Get language by ID error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Create language
  createLanguage: async (req, res) => {
    try {
      const { name, locale, is_active } = req.body;
      
      const language = await languageService.createLanguage({
        name,
        locale,
        is_active
      });
      
      return responseUtils.success(res, {
        message: 'Language created successfully',
        language
      });
    } catch (error) {
      console.error('Create language error:', error);
      
      if (error.message.includes('already exists')) {
        return responseUtils.conflict(res, error.message);
      }
      
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Update language
  updateLanguage: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, locale, is_active } = req.body;
      
      const language = await languageService.updateLanguage(id, {
        name,
        locale,
        is_active
      });
      
      if (!language) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.success(res, {
        message: 'Language updated successfully',
        language
      });
    } catch (error) {
      console.error('Update language error:', error);
      
      if (error.message.includes('already exists')) {
        return responseUtils.conflict(res, error.message);
      }
      
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Delete language
  deleteLanguage: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deleted = await languageService.deleteLanguage(id);
      
      if (!deleted) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.success(res, { message: 'Language deleted successfully' });
    } catch (error) {
      console.error('Delete language error:', error);
      return responseUtils.serverError(res, error.message);
    }
  }
};

module.exports = languageController;