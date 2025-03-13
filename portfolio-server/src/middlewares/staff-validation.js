const { body, validationResult } = require('express-validator');

exports.validateStaffCreation = [
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('phone_number').isNumeric().withMessage('Phone number must be numeric'),
  body('date_of_birth').isISO8601().toDate().withMessage('Date of birth must be a valid date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateStaffUpdate = [
  body('email').isEmail().optional().withMessage('Email must be a valid email address'),
  body('phone_number').isNumeric().optional().withMessage('Phone number must be numeric'),
  body('date_of_birth').isISO8601().toDate().optional().withMessage('Date of birth must be a valid date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
