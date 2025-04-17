'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('post_translate_languages', [
      {
        post_id: 1,
        language_id: 1, // English
        title: 'First Post Title',
        content: 'This is the content of the first post in English.',
        description: 'This is a short description for the first post in English.',
        is_original: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        post_id: 1,
        language_id: 2, // Vietnamese
        title: 'Tiêu đề bài viết đầu tiên',
        content: 'Đây là nội dung của bài viết đầu tiên bằng tiếng Việt.',
        description: 'Đây là mô tả ngắn gọn cho bài viết đầu tiên bằng tiếng Việt.',
        is_original: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        post_id: 2,
        language_id: 1, // English
        title: 'Second Post Title',
        content: 'This is the content of the second post in English.',
        description: 'This is a short description for the second post in English.',
        is_original: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('post_translate_languages', null, {});
  }
};
