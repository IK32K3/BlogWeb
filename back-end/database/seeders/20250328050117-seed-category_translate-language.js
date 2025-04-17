'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('category_translate_languages', [
      {
        category_id: 1,
        language_id: 1, // English
        name: 'Technology',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 1,
        language_id: 2, // Vietnamese
        name: 'Công nghệ',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 2,
        language_id: 1, // English
        name: 'Health',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 2,
        language_id: 2, // Vietnamese
        name: 'Sức khỏe',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 3,
        language_id: 1, // English
        name: 'Lifestyle',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 3,
        language_id: 2, // Vietnamese
        name: 'Phong cách sống',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('category_translate_languages', null, {});
  }
};
