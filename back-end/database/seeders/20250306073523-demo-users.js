'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      {
        user_id :1,
        username: 'John Doe',
        password:12345678,
        email: 'daobadat2003@gmail.com',
        role: 'admin',
        language_id: 1,
        theme_id: 1,
        created_At: new Date(),
        updated_At: new Date()
     },
    {
      user_id :2,
      username: 'Jane Doe',
      password:12345678,
      email: 'daobaaa@gmai.com',
      role: 'user',
      language_id: 1,
      theme_id: 1,
      created_At: new Date(),
      updated_At: new Date()
     }
    ]); 
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
