'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('post_media', [
      {
        post_id: 1,
        media_id: 1,
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        post_id: 1,
        media_id: 2,
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        post_id: 2,
        media_id: 3,
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('post_media', null, {});
  }
};
