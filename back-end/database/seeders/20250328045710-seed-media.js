'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('media', [
      {
        name: 'Sample Image 1',
        url: 'https://example.com/sample1.jpg',
        type: 'image',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sample Video 1',
        url: 'https://example.com/sample1.mp4',
        type: 'video',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sample Audio 1',
        url: 'https://example.com/sample1.mp3',
        type: 'audio',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('media', null, {});
  }
};
