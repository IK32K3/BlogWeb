const { Op } = require('sequelize');
const { language } = require('models');
const responseUtils = require('utils/responseUtils');

const languageController = {
  // Get all languages
  getAllLanguages: async (req, res) => {
    try {
      const { page = 1, limit = 20, search, is_active } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {};
      
      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { locale: { [Op.like]: `%${search}%` } }
        ];
      }
      
      // Fetch languages
      const { count, rows: languages } = await language.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      });
      
      const totalPages = Math.ceil(count / limit);
      
      return responseUtils.ok(res, {
        languages,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get all languages error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Get language by ID
  getLanguageById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const lang = await language.findByPk(id);
      
      if (!lang) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.ok(res, { language: lang });
    } catch (error) {
      console.error('Get language by ID error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Create language
  createLanguage: async (req, res) => {
    try {
      const { name, locale, is_active = true } = req.body;
      
      // Check if language already exists
      const existingLanguage = await language.findOne({
        where: {
          [Op.or]: [{ name }, { locale }]
        }
      });
      
      if (existingLanguage) {
        return responseUtils.invalidated(res, {
          errors: [{ 
            message: existingLanguage.name === name ? 'Language name already exists' : 'Locale already exists' 
          }]
        });
      }
      
      // Create language
      const newLanguage = await language.create({
        name,
        locale,
        is_active
      });
      
      return responseUtils.ok(res, {
        message: 'Language created successfully',
        language: newLanguage
      });
    } catch (error) {
      console.error('Create language error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Update language
  updateLanguage: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, locale, is_active } = req.body;
      
      // Find language
      const lang = await language.findByPk(id);
      
      if (!lang) {
        return responseUtils.notFound(res);
      }
      
      // Check if name or locale already exists
      if (name && name !== lang.name) {
        const existingName = await language.findOne({
          where: { name }
        });
        
        if (existingName) {
          return responseUtils.invalidated(res, {
            errors: [{ message: 'Language name already exists' }]
          });
        }
      }
      
      if (locale && locale !== lang.locale) {
        const existingLocale = await language.findOne({
          where: { locale }
        });
        
        if (existingLocale) {
          return responseUtils.invalidated(res, {
            errors: [{ message: 'Locale already exists' }]
          });
        }
      }
      
      // Update language
      await lang.update({
        name: name || lang.name,
        locale: locale || lang.locale,
        is_active: is_active !== undefined ? is_active : lang.is_active
      });
      
      return responseUtils.ok(res, {
        message: 'Language updated successfully',
        language: lang
      });
    } catch (error) {
      console.error('Update language error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Delete language
  deleteLanguage: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find language
      const lang = await language.findByPk(id);
      
      if (!lang) {
        return responseUtils.notFound(res);
      }
      
      // Delete language
      await lang.destroy();
      
      return responseUtils.ok(res, { message: 'Language deleted successfully' });
    } catch (error) {
      console.error('Delete language error:', error);
      return responseUtils.error(res, error.message);
    }
  }
};

module.exports = languageController;