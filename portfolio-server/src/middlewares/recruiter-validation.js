const { body, validationResult } = require('express-validator')

// Middleware to validate recruiter creation request
exports.validateRecruiterCreation = [
	body('email').isEmail().withMessage('Email must be a valid email address'),
	body('password').notEmpty().withMessage('Password is required'),
	body('company_name').notEmpty().withMessage('Company name is required'),
	body('phone').isNumeric().withMessage('Phone number must be numeric'),
	body('first_name').notEmpty().withMessage('First name is required'),
	body('last_name').notEmpty().withMessage('Last name is required'),
	body('date_of_birth')
		.isISO8601()
		.toDate()
		.withMessage('Date of birth must be a valid date'),
	(req, res, next) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		next()
	},
]

// Middleware to validate recruiter update request
exports.validateRecruiterUpdate = [
	body('email')
		.isEmail()
		.optional()
		.withMessage('Email must be a valid email address'),
	body('phone')
		.isNumeric()
		.optional()
		.withMessage('Phone number must be numeric'),
	body('date_of_birth')
		.isISO8601()
		.toDate()
		.optional()
		.withMessage('Date of birth must be a valid date'),
	body('company_Address')
		.optional()
		.isString()
		.withMessage('Company address must be a string'),
	body('established_Date')
		.optional()
		.isString()
		.withMessage('Established date must be a string'),
	body('employee_Count')
		.optional()
		.isString()
		.withMessage('Employee count must be a string'),
	body('business_overview')
		.optional()
		.isString()
		.withMessage('Business overview must be a string'),
	body('target_audience')
		.optional()
		.isString()
		.withMessage('Target audience must be a string'),
	body('required_skills')
		.optional()
		.isString()
		.withMessage('Required skills must be a string'),
	body('welcome_skills')
		.optional()
		.isString()
		.withMessage('Welcome skills must be a string'),
	body('work_location')
		.optional()
		.isString()
		.withMessage('Work location must be a string'),
	body('work_hours')
		.optional()
		.isString()
		.withMessage('Work hours must be a string'),
	body('salary').optional().isString().withMessage('Salary must be a string'),
	body('benefits')
		.optional()
		.isString()
		.withMessage('Benefits must be a string'),
	body('selection_process')
		.optional()
		.isString()
		.withMessage('Selection process must be a string'),
	(req, res, next) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		next()
	},
]
