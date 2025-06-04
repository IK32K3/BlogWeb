/**
 * Placeholder Contact Validations
 */
const { body } = require('express-validator');

exports.contactFormValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').optional().trim(), // Subject is optional
  body('message').notEmpty().withMessage('Message is required'),
]; 