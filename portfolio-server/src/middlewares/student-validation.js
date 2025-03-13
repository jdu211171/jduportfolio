// validators/studentValidators.js

const { body } = require('express-validator');

// Validation middleware for creating a student
exports.validateStudentCreation = [
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('date_of_birth').isISO8601().toDate().withMessage('Date of birth must be a valid date'),
];

// Validation middleware for updating a student
exports.validateStudentUpdate = [
  body('email').isEmail().optional().withMessage('Email must be a valid email address'),
  body('date_of_birth').isISO8601().toDate().optional().withMessage('Date of birth must be a valid date'),
];
