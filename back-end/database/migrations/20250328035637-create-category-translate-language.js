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
      slug: {
        type: Sequelize.STRING(255),
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

    await queryInterface.addConstraint('category_translate_languages', {
      fields: ['category_id', 'language_id'],
      type: 'unique',
      name: 'unique_category_language'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('category_translate_languages', 'unique_category_language');
    await queryInterface.dropTable('category_translate_languages');
  }
};