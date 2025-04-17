'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Tên bảng users trong DB
          key: 'id'
        },
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories', // Tên bảng categories trong DB
          key: 'id'
        },
      },
      title: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      views: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'), // Các trạng thái có thể
        allowNull: false,
        defaultValue: 'draft'
      },
      slug: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      id_post_original: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'posts', // Trỏ đến chính bảng posts
          key: 'id'
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
    });
    await queryInterface.addIndex('posts', ['user_id']);
    await queryInterface.addIndex('posts', ['category_id']);
    await queryInterface.addIndex('posts', ['status']);
    await queryInterface.addIndex('posts', ['created_at']);
  },
  async down(queryInterface, Sequelize) {
    
    
    await queryInterface.removeIndex('posts', ['user_id']);
    await queryInterface.removeIndex('posts', ['category_id']);
    await queryInterface.removeIndex('posts', ['status']);
    await queryInterface.removeIndex('posts', ['created_at']);
    
    await queryInterface.dropTable('Posts');
  }
};