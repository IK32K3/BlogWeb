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
      Post.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'author'
      });

      Post.belongsTo(models.Categories, {
        foreignKey: 'category_id',
        as: 'category'
      });

      Post.hasMany(models.Comment, {
        foreignKey: 'post_id',
        as: 'comments'
      });

      Post.belongsTo(models.Post, {
        foreignKey: 'id_post_original',
        as: 'originalPost'
      });

      Post.hasMany(models.Post, {
        foreignKey: 'id_post_original',
        as: 'translations'
      });

      // Add association with PostTranslateLanguage
      Post.hasMany(models.PostTranslateLanguage, {
        foreignKey: 'post_id',
        as: 'postTranslations'
      });
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
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true
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
      allowNull: false,
      unique: true
    },
    id_post_original: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { // Optional: Tự trỏ đến chính nó
        model: 'posts',
        key: 'id'
      },
    },
    
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true,
      // --- THÊM underscored ĐỂ KHỚP VỚI TÊN CỘT created_at/updated_at ---
      underscored: true, // Rất quan trọng nếu tên cột DB có dấu gạch dưới
    
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