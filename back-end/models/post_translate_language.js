'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostTranslateLanguage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      PostTranslateLanguage.belongsTo(models.Post, {
        foreignKey: 'post_id',
        as: 'post'
      });
      
      PostTranslateLanguage.belongsTo(models.Language, {
        foreignKey: 'language_id',
        as: 'language'
      });
    }
  }
  PostTranslateLanguage.init({
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    language_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'languages',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PostTranslateLanguage',
    tableName: 'post_translate_language',
    timestamps: true,
    underscored: true, // This will use created_at and updated_at column names
    indexes: [
      {
        unique: true,
        fields: ['post_id', 'language_id']
      }
    ]
  });
  return PostTranslateLanguage;
};