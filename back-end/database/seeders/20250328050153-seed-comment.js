'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('comments', [
      {
        post_id: 1,
        user_id: 1,
        content: 'This is the first comment on the first post.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        post_id: 1,
        user_id: 2,
        content: 'This is another comment on the first post.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        post_id: 2,
        user_id: 3,
        content: 'This is a comment on the second post.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comments', null, {});
  }
};
