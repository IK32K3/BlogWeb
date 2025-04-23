const { Op } = require('sequelize');
const { Categories, CategoryTranslateLanguage, Language } = require('models');
const responseUtils = require('utils/responseUtils');

const categoryController = {
  // Get all categories
  getAllCategories: async (req, res) => {
    try {const responseUtils = require('utils/responseUtils');
      const categoryService = require('../service/categoryService');
      
      const categoryController = {
        // Get all categories
        getAllCategories: async (req, res) => {
          try {
            const { page, limit, search, language_id } = req.query;
            
            const result = await categoryService.getAllCategories({
              page,
              limit,
              search,
              language_id
            });
            
            return responseUtils.success(res, result);
          } catch (error) {
            console.error('Get all categories error:', error);
            return responseUtils.serverError(res, error.message);
          }
        },
        
        // Get category by ID
        getCategoryById: async (req, res) => {
          try {
            const { id } = req.params;
            
            const category = await categoryService.getCategoryById(id);
            
            if (!category) {
              return responseUtils.notFound(res);
            }
            
            return responseUtils.success(res, { category });
          } catch (error) {
            console.error('Get category by ID error:', error);
            return responseUtils.serverError(res, error.message);
          }
        },
        
        // Create category
        createCategory: async (req, res) => {
          try {
            const category = await categoryService.createCategory(req.body);
            
            return responseUtils.success(res, {
              message: 'Category created successfully',
              category
            });
          } catch (error) {
            console.error('Create category error:', error);
            return responseUtils.serverError(res, error.message);
          }
        },
        
        // Update category
        updateCategory: async (req, res) => {
          try {
            const { id } = req.params;
            
            const updatedCategory = await categoryService.updateCategory(id, req.body);
            
            if (!updatedCategory) {
              return responseUtils.notFound(res);
            }
            
            return responseUtils.success(res, {
              message: 'Category updated successfully',
              category: updatedCategory
            });
          } catch (error) {
            console.error('Update category error:', error);
            return responseUtils.serverError(res, error.message);
          }
        },
        
        // Delete category
        deleteCategory: async (req, res) => {
          try {
            const { id } = req.params;
            
            const deleted = await categoryService.deleteCategory(id);
            
            if (!deleted) {
              return responseUtils.notFound(res);
            }
            
            return responseUtils.success(res, { message: 'Category deleted successfully' });
          } catch (error) {
            console.error('Delete category error:', error);
            return responseUtils.serverError(res, error.message);
          }
        }
      };
      
      module.exports = categoryController;
      const { page = 1, limit = 50, search, language_id } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {};
      
      if (search) {
        whereClause.name = { [Op.like]: `%${search}%` };
      }
      
      // Fetch categories
      const { count, rows: allCategories } = await Categories.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']],
        include: language_id ? [
          {
            model: CategoryTranslateLanguage,
            where: { language_id },
            required: false
          }
        ] : []
      });
      
      const totalPages = Math.ceil(count / limit);
      
      return responseUtils.success(res, {
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
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Get category by ID
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const category = await Categories.findByPk(id, {
        include: [
          {
            model: CategoryTranslateLanguage,
            include: [{ model: Language }]
          }
        ]
      });
      
      if (!category) {
        return responseUtils.notFound(res);
      }
      
      return responseUtils.success(res, { category });
    } catch (error) {
      console.error('Get category by ID error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Create category
  createCategory: async (req, res) => {
    try {
      const { name, translations = [] } = req.body;
      
      // Create category
      const category = await Categories.create({
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
        
        await CategoryTranslateLanguage.bulkCreate(translationEntries);
      }
      
        // Get the newly created category with translations
      const newCategory = await Categories.findByPk(category.id, {
        include: [
          {
            model: CategoryTranslateLanguage,
            include: [{ model: Language }]
          }
        ]
      });
      
      return responseUtils.success(res, {
        message: 'Category created successfully',
        category: newCategory
      });
    } catch (error) {
      console.error('Create category error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Update category
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, translations = [] } = req.body;
      
      // Find category
      const category = await Categories.findByPk(id);
      
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
          const [transRecord, created] = await CategoryTranslateLanguage.findOrCreate({
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
      const updatedCategory = await Categories.findByPk(id, {
        include: [
          {
            model: CategoryTranslateLanguage,
            include: [{ model: Language }]
          }
        ]
      });
      
      return responseUtils.success(res, {
        message: 'Category updated successfully',
        category: updatedCategory
      });
    } catch (error) {
      console.error('Update category error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },
  
  // Delete category
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find category
      const category = await Categories.findByPk(id);
      
      if (!category) {
        return responseUtils.notFound(res);
      }
        // Check if category has any posts
      await category.destroy();
      
      return responseUtils.success(res, { message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      return responseUtils.serverError(res, error.message);
    }
  }
};

module.exports = categoryController;