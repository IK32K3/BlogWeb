'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('category_translate_languages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      language_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
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
        defaultValue: true,
      }
    });
    await queryInterface.addConstraint('Category_Translate_Languages', {
      fields: ['category_id', 'language_id'],
      type: 'unique',
      name: 'unique_category_language'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('category_translate_languages');
  }
};