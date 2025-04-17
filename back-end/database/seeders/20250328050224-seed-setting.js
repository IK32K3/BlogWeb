'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('settings', [
      {
        user_id: 1,
        settings: JSON.stringify({
          theme: 'dark',
          notifications: true,
          language: 'en'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2,
        settings: JSON.stringify({
          theme: 'light',
          notifications: false,
          language: 'vi'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 3,
        settings: JSON.stringify({
          theme: 'dark',
          notifications: true,
          language: 'fr'
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('settings', null, {});
  }
};
