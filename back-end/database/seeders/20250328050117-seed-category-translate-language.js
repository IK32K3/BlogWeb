'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('category_translate_language', [
      {
        category_id: 1,
        language_id: 1, // English
        name: 'Technology',
        is_active: true,
        slug : 'technology',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 1,
        language_id: 2, // Vietnamese
        name: 'Công nghệ',
        slug : 'cong-nghe',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 2,
        language_id: 1, // English
        name: 'Health',
        slug : 'health',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 2,
        language_id: 2, // Vietnamese
        name: 'Sức khỏe',
        slug : 'suc-khoe',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 3,
        language_id: 1, // English
        name: 'Lifestyle',
        slug : 'lifestyle',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 3,
        language_id: 2, // Vietnamese
        name: 'Phong cách sống',
        slug : 'phong-cach-song',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('category_translate_language', null, {
      
    });
  }
};
