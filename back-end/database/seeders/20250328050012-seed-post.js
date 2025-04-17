'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.bulkInsert('Posts', [ // Use the exact table name (case-sensitive depending on DB)
      {
        user_id: 1, // Must exist in 'users' table
        category_id: 1, // Must exist in 'categories' table
        title: 'First Post Title',
        content: 'This is the content of the first post. It can be longer text, potentially including basic HTML if your frontend renders it.',
        description: 'This is a short description for the first post, often used for previews or meta tags.',
        views: 100,
        status: 'published', // Must be one of 'draft', 'published', 'archived'
        slug: 'first-post-title', // Should be unique
        id_post_original: null, // Assuming this is not a translation/copy initially
        // Explicitly setting timestamps:
        created_at: new Date(),
        updated_at: new Date()
        // Note: If your migration defines defaultValue for timestamps,
        // you can omit created_at and updated_at here, and the DB will handle them.
      },
      {
        user_id: 2, // Must exist in 'users' table
        category_id: 2, // Must exist in 'categories' table
        title: 'Second Post About Technology',
        content: 'Content discussing the latest tech trends goes here. Lorem ipsum dolor sit amet...',
        description: 'A brief overview of the technology discussion in the second post.',
        views: 50,
        status: 'draft', // Must be one of 'draft', 'published', 'archived'
        slug: 'second-post-technology', // Should be unique
        id_post_original: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 1, // Same user as post 1
        category_id: 3, // Must exist in 'categories' table
        title: 'An Archived Post Example',
        content: 'This post discusses a topic that is no longer relevant or has been superseded, hence it is archived.',
        description: 'Description for the third post, which is archived.',
        views: 200,
        status: 'archived', // Must be one of 'draft', 'published', 'archived'
        slug: 'archived-post-example', // Should be unique
        id_post_original: null,
        created_at: new Date(), // Could set to an older date if needed: new Date('2023-01-15T10:00:00Z')
        updated_at: new Date()  // Could set to an older date: new Date('2023-05-20T12:30:00Z')
      }
      // Add more post objects here if needed
    ], {}); // The empty object {} is for options, usually not needed for basic inserts
  },

  async down(queryInterface, Sequelize) {
    // This will delete all the posts inserted above.
    await queryInterface.bulkDelete('Posts', null, {});
  }
};