'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
        {
            username: 'admin',
            email: 'admin@blogweb.com',
            password: '$2b$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX',
            role_id: 1, // nên để là số nguyên, không là chuỗi
            is_active: true,
            description: 'Admin account',
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            username: 'editor',
            email: 'editor@blogweb.com',
            password: '$2b$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX',
            role_id: 2,
            is_active: true,
            description: 'Editor account',
            created_at: new Date(),
            updated_at: new Date()
          }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
}; 