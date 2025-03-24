'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('postCategories', {
      category_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },  
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('postCategories');
  }
};