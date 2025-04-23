const { Op } = require('sequelize');
const { Categories, CategoryTranslateLanguage, Language } = require('models');

const categoryService = {
  /**
   * Get all categories with pagination and filtering
   * @param {Object} options - Query parameters
   * @returns {Promise<Object>} Categories and pagination info
   */
  getAllCategories: async ({ page = 1, limit = 50, search, language_id }) => {
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
    
    return {
      categories: allCategories,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  },
  
  /**
   * Get category by ID with translations
   * @param {number} id - Category ID 
   * @returns {Promise<Object>} Category with translations
   */
  getCategoryById: async (id) => {
    const category = await Categories.findByPk(id, {
      include: [
        {
          model: CategoryTranslateLanguage,
          include: [{ model: Language }]
        }
      ]
    });
    
    if (!category) {
      return null;
    }
    
    return category;
  },
  
  /**
   * Create a new category with optional translations
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category with translations
   */
  createCategory: async (categoryData) => {
    const { name, translations = [] } = categoryData;
    
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
    
    return newCategory;
  },
  
  /**
   * Update category and its translations
   * @param {number} id - Category ID
   * @param {Object} categoryData - Updated category data 
   * @returns {Promise<Object>} Updated category with translations
   */
  updateCategory: async (id, categoryData) => {
    const { name, translations = [] } = categoryData;
    
    // Find category
    const category = await Categories.findByPk(id);
    
    if (!category) {
      return null;
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
            is_active: translation.is_active !== undefined 
              ? translation.is_active 
              : transRecord.is_active
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
    
    return updatedCategory;
  },
  
  /**
   * Delete a category and its translations
   * @param {number} id - Category ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  deleteCategory: async (id) => {
    // Find category
    const category = await Categories.findByPk(id);
    
    if (!category) {
      return false;
    }
    
    // Delete category (associated translations will be deleted by CASCADE)
    await category.destroy();
    
    return true;
  }
};

module.exports = categoryService;