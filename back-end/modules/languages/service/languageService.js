const { Op } = require('sequelize');
const { Language } = require('models');

const languageService = {
  /**
   * Get all languages with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search term
   * @param {boolean} options.is_active - Active status filter
   * @returns {Promise<Object>} - Languages and pagination info
   */
  getAllLanguages: async ({ page = 1, limit = 20, search, is_active }) => {
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {};
    
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true' || is_active === true;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { locale: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Fetch languages
    const { count, rows: languages } = await Language.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    return {
      languages,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  },
  
  /**
   * Get language by ID
   * @param {number} id - Language ID
   * @returns {Promise<Object|null>} - Language object or null if not found
   */
  getLanguageById: async (id) => {
    return await Language.findByPk(id);
  },
  
  /**
   * Create a new language
   * @param {Object} languageData - Language data
   * @param {string} languageData.name - Language name
   * @param {string} languageData.locale - Language locale code
   * @param {boolean} [languageData.is_active=true] - Is language active
   * @returns {Promise<Object>} - Created language
   * @throws {Error} - If language name or locale already exists
   */
  createLanguage: async ({ name, locale, is_active = true }) => {
    // Check if language already exists
    const existingLanguage = await Language.findOne({
      where: {
        [Op.or]: [{ name }, { locale }]
      }
    });
    
    if (existingLanguage) {
      throw new Error(existingLanguage.name === name 
        ? 'Language name already exists' 
        : 'Locale already exists');
    }
    
    // Create language
    return await Language.create({
      name,
      locale,
      is_active
    });
  },
  
  /**
   * Update a language
   * @param {number} id - Language ID
   * @param {Object} languageData - Updated language data
   * @returns {Promise<Object|null>} - Updated language or null if not found
   * @throws {Error} - If language name or locale already exists
   */
  updateLanguage: async (id, { name, locale, is_active }) => {
    // Find language
    const language = await Language.findByPk(id);
    
    if (!language) {
      return null;
    }
    
    // Check for duplicate name/locale
    if (name && name !== language.name) {
      const existingName = await Language.findOne({
        where: { name }
      });
      
      if (existingName) {
        throw new Error('Language name already exists');
      }
    }
    
    if (locale && locale !== language.locale) {
      const existingLocale = await Language.findOne({
        where: { locale }
      });
      
      if (existingLocale) {
        throw new Error('Locale already exists');
      }
    }
    
    // Update language
    await language.update({
      name: name || language.name,
      locale: locale || language.locale,
      is_active: is_active !== undefined ? is_active : language.is_active
    });
    
    return language;
  },
  
  /**
   * Delete a language
   * @param {number} id - Language ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  deleteLanguage: async (id) => {
    // Find language
    const language = await Language.findByPk(id);
    
    if (!language) {
      return false;
    }
    
    // Delete language
    await language.destroy();
    
    return true;
  }
};

module.exports = languageService;