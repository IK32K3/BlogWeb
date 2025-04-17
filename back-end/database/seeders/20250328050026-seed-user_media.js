'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('media', [
      {
        name: 'Sample Image 1',
        url: 'https://example.com/images/sample1.jpg',
        type: 'image',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sample Image 2',
        url: 'https://example.com/images/sample2.jpg',
        type: 'image',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sample Image 3',
        url: 'https://example.com/images/sample3.jpg',
        type: 'image',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    await queryInterface.bulkInsert('user_media', [
      {
        user_id: 1,
        media_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 1,
        media_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2,
        media_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_media', null, {});
    await queryInterface.bulkDelete('media', { type: 'image' }, {});
  }
};
