'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CategoryTranslateLanguage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      CategoryTranslateLanguage.belongsTo(models.Categories, { foreignKey: 'category_id' });
      CategoryTranslateLanguage.belongsTo(models.Language, { as: 'language', foreignKey: 'language_id' });
    }
  }
  CategoryTranslateLanguage.init({
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    language_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'CategoryTranslateLanguage',
    tableName: 'category_translate_language',
    timestamps: true // Disable Sequelize's automatic timestamps
  });
  return CategoryTranslateLanguage;
};