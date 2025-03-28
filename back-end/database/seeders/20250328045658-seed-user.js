'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        password: 'hashed_password_1', // Replace with actual hashed password
        email: 'admin@example.com',
        role_id: 1,
        description: 'Administrator account',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'user1',
        password: 'hashed_password_2', // Replace with actual hashed password
        email: 'user1@example.com',
        role_id: 2,
        description: 'Regular user account',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
