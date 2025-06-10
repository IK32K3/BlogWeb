'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('comments', [
      {
        post_id: 1,
        user_id: 2,
        content: 'Bài viết rất hay và hữu ích! Tôi đã học được nhiều điều từ nó.',
        created_at: new Date('2024-03-01T09:00:00Z'),
        updated_at: new Date('2024-03-01T09:00:00Z')
      },
      {
        post_id: 1,
        user_id: 1,
        content: 'Cảm ơn bạn đã đọc và góp ý. Chúng tôi sẽ cố gắng cải thiện nội dung tốt hơn nữa.',
        created_at: new Date('2024-03-01T09:30:00Z'),
        updated_at: new Date('2024-03-01T09:30:00Z')
      },
      {
        post_id: 2,
        user_id: 1,
        content: 'Hướng dẫn rất chi tiết và dễ hiểu. Tôi đã tích hợp Cloudinary thành công!',
        created_at: new Date('2024-03-15T11:00:00Z'),
        updated_at: new Date('2024-03-15T11:00:00Z')
      },
      {
        post_id: 3,
        user_id: 2,
        content: 'Bài viết về SEO rất hữu ích. Tôi đã áp dụng và thấy kết quả tốt hơn.',
        created_at: new Date('2024-03-20T15:00:00Z'),
        updated_at: new Date('2024-03-20T15:00:00Z')
      },
      {
        post_id: 4,
        user_id: 1,
        content: 'Tính năng đa ngôn ngữ thật tuyệt vời! Tôi có thể viết blog bằng nhiều ngôn ngữ khác nhau.',
        created_at: new Date('2024-03-25T10:00:00Z'),
        updated_at: new Date('2024-03-25T10:00:00Z')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comments', null, {});
  }
};
