'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      Post.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Post.belongsTo(models.Categories, { foreignKey: 'category_id' , as: 'categories' });
      Post.hasMany(models.PostTranslateLanguage, { foreignKey: 'post_id' , as: 'post_translate_language' });
    }
  }
  Post.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { // Optional: Khai báo ràng buộc khóa ngoại ở mức model
        model: 'users', // Tên bảng users trong database
        key: 'id'
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { // Optional: Khai báo ràng buộc khóa ngoại ở mức model
        model: 'categories', // Tên bảng categories trong database
        key: 'id'
      },
    },
    title: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'), // Có thể thêm các trạng thái khác nếu cần
      allowNull: false,
      defaultValue: 'draft'
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    slug: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    id_post_original: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { // Optional: Tự trỏ đến chính nó
        model: 'posts',
        key: 'id'
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: false, // Disable Sequelize's automatic timestamps
    
    indexes: [
      { unique: true, fields: ['slug'] },
      { fields: ['user_id'] },
      { fields: ['category_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
    ]
  });
  return Post;
};