'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('postTransLanguages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: 'languages',
        //   key: 'id'},
        // onUpdate: 'CASCADE',
        // onDelete: 'CASCADE'
      },
      language_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: 'languages',
        //   key: 'id'},
        // onUpdate: 'CASCADE',
        // onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addConstraint('postTransLanguages', {
      fields: ['post_id', 'language_id'],
      type: 'unique',
      name: 'unique_post_language'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('postTransLanguages');
  }
};