const responseUtils = require('utils/responseUtils');
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