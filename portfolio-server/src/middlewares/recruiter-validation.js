const { body, validationResult } = require('express-validator');

// Middleware to validate recruiter creation request
exports.validateRecruiterCreation = [
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  body('company_name').notEmpty().withMessage('Company name is required'),
  body('phone_number').isNumeric().withMessage('Phone number must be numeric'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('date_of_birth').isISO8601().toDate().withMessage('Date of birth must be a valid date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Middleware to validate recruiter update request
exports.validateRecruiterUpdate = [
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
