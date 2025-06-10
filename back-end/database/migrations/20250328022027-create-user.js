'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles', // Đảm bảo tên bảng đúng
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      avatar : {
        type: Sequelize.STRING(255),
        allowNull: true,
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
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    });

  },
  
  async down(queryInterface, Sequelize) {
    
    await queryInterface.removeConstraint('post_translate_languages', 'post_translate_languages_post_id_fkey');
    await queryInterface.dropTable('post_translate_languages');
    await queryInterface.dropTable('comments');
    await queryInterface.dropTable('setting');
    
    // Xóa các bảng khác có phụ thuộc
    await queryInterface.dropTable('posts');
    await queryInterface.dropTable('categories');   
    // Cuối cùng mới xóa bảng users
    await queryInterface.dropTable('users');
    
    
  }
};