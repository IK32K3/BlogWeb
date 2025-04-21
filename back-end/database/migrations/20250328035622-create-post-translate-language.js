'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_translate_language', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      language_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT('long'),
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
      is_original: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    });
    await queryInterface.addConstraint('post_translate_language', {
      fields: ['post_id', 'language_id'],
      type: 'unique',
      name: 'unique_post_language'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('post_translate_language', 'unique_post_language');
    await queryInterface.dropTable('post_translate_language');
  }
};