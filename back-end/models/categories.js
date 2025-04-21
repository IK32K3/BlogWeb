'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Example: categories.hasMany(models.Posts, { foreignKey: 'category_id' });
    }
  }
  Categories.init({
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    
  }, {
    sequelize,
    modelName: 'Categories',
    tableName: 'categories',
    timestamps: true,
  underscored: true,
  });
  return Categories;
};