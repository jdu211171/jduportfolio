const { body } = require('express-validator');

// Validation middleware for creating a QA entry
exports.validateQACreation = [
  body('category').notEmpty().withMessage('Category is required'),
  body('question').notEmpty().withMessage('Question is required'),
  body('userId').isNumeric().withMessage('User ID must be numeric'),
];

// Validation middleware for updating a QA entry
exports.validateQAUpdate = [
  body('category').notEmpty().withMessage('Category is required'),
  body('question').notEmpty().withMessage('Question is required'),
  body('userId').isNumeric().withMessage('User ID must be numeric'),
];
