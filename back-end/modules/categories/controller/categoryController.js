const { Op } = require('sequelize');
const { categories, category_translate_language, language } = require('models');
const responseUtils = require('utils/responseUtils');

const categoryController = {
  // Get all categories
  getAllCategories: async (req, res) => {
    try {
      const { page = 1, limit = 50, search, language_id } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {};
      
      if (search) {
        whereClause.name = { [Op.like]: `%${search}%` };
      }
      
      // Fetch categories
      const { count, rows: allCategories } = await categories.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']],
        include: language_id ? [
          {
            model: category_translate_language,
            where: { language_id },
            required: false
          }
        ] : []
      });
      
      const totalPages = Math.ceil(count / limit);
      
      return responseUtils.ok(res, {
        categories: allCategories,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get all categories error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Get category by ID
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const category = await categories.findByPk(id, {
        include: [
          {
            model: category_translate_language,
            include: [{ model: language }]
          }
        ]
      });
      
      if (!category) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.ok(res, { category });
    } catch (error) {
      console.error('Get category by ID error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Create category
  createCategory: async (req, res) => {
    try {
      const { name, translations = [] } = req.body;
      
      // Create category
      const category = await categories.create({
        name
      });
      
        // Create translations if provided
      if (translations.length > 0) {
        const translationEntries = translations.map(translation => ({
          category_id: category.id,
          language_id: translation.language_id,
          name: translation.name,
          is_active: translation.is_active || true
        }));
        
        await category_translate_language.bulkCreate(translationEntries);
      }
      
        // Get the newly created category with translations
      const newCategory = await categories.findByPk(category.id, {
        include: [
          {
            model: category_translate_language,
            include: [{ model: language }]
          }
        ]
      });
      
      return responseUtils.ok(res, {
        message: 'Category created successfully',
        category: newCategory
      });
    } catch (error) {
      console.error('Create category error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Update category
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, translations = [] } = req.body;
      
      // Find category
      const category = await categories.findByPk(id);
      
      if (!category) {
        return responseUtils.notFound(res);
      }
      
      // Update category
      await category.update({
        name: name || category.name
      });
      
        // Update translations if provided
      if (translations.length > 0) {
        for (const translation of translations) {
          const [transRecord, created] = await category_translate_language.findOrCreate({
            where: {
              category_id: category.id,
              language_id: translation.language_id
            },
            defaults: {
              name: translation.name,
              is_active: translation.is_active || true
            }
          });
          
          if (!created) {
            await transRecord.update({
              name: translation.name,
              is_active: translation.is_active !== undefined ? translation.is_active : transRecord.is_active
            });
          }
        }
      }
      
        // Get the updated category with translations
      const updatedCategory = await categories.findByPk(id, {
        include: [
          {
            model: category_translate_language,
            include: [{ model: language }]
          }
        ]
      });
      
      return responseUtils.ok(res, {
        message: 'Category updated successfully',
        category: updatedCategory
      });
    } catch (error) {
      console.error('Update category error:', error);
      return responseUtils.error(res, error.message);
    }
  },
  
  // Delete category
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find category
      const category = await categories.findByPk(id);
      
      if (!category) {
        return responseUtils.notFound(res);
      }
        // Check if category has any posts
      await category.destroy();
      
      return responseUtils.ok(res, { message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      return responseUtils.error(res, error.message);
    }
  }
};

module.exports = categoryController;