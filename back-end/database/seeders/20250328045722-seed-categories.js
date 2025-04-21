'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      { name: 'Technology',slug:'Technology', created_at: new Date(), updated_at: new Date() },
      { name: 'Health', slug:'Health', created_at: new Date(), updated_at: new Date() },
      { name: 'Lifestyle',slug:'Lifestyle',  created_at: new Date(), updated_at: new Date() },
      { name: 'Education',slug:'Education',  created_at: new Date(), updated_at: new Date() },
      { name: 'Travel',slug:'Travel',  created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
