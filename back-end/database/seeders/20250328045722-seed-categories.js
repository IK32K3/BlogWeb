'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      { name: 'Technology', created_at: new Date(), updated_at: new Date() },
      { name: 'Health', created_at: new Date(), updated_at: new Date() },
      { name: 'Lifestyle', created_at: new Date(), updated_at: new Date() },
      { name: 'Education', created_at: new Date(), updated_at: new Date() },
      { name: 'Travel', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
