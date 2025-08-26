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
        .optional({ nullable: true })
        .withMessage('Email must be a valid email address'),
    body('phone')
        .isNumeric()
        .optional({ nullable: true })
        .withMessage('Phone number must be numeric'),
    body('company_Address')
        .optional({ nullable: true })
        .isString()
        .withMessage('Company address must be a string'),
    body('established_Date')
        .optional({ nullable: true })
        .isString()
        .withMessage('Established date must be a string'),
    body('employee_Count')
        .optional({ nullable: true })
        .isString()
        .withMessage('Employee count must be a string'),
    body('business_overview')
        .optional({ nullable: true })
        .isString()
        .withMessage('Business overview must be a string'),
    body('target_audience')
        .optional({ nullable: true })
        .isString()
        .withMessage('Target audience must be a string'),
    body('required_skills')
        .optional({ nullable: true })
        .isString()
        .withMessage('Required skills must be a string'),
    body('welcome_skills')
        .optional({ nullable: true })
        .isString()
        .withMessage('Welcome skills must be a string'),
    body('work_location')
        .optional({ nullable: true })
        .isString()
        .withMessage('Work location must be a string'),
    body('work_hours')
        .optional({ nullable: true })
        .isString()
        .withMessage('Work hours must be a string'),
    body('salary').optional({ nullable: true }).isString().withMessage('Salary must be a string'),
    body('benefits')
        .optional({ nullable: true })
        .isString()
        .withMessage('Benefits must be a string'),
    body('selection_process')
        .optional({ nullable: true })
        .isString()
        .withMessage('Selection process must be a string'),
	// New fields - optional validations
    body('company_website')
        .optional({ nullable: true })
        .isString()
        .withMessage('Website must be a string'),
    body('company_capital').optional({ nullable: true }).isString().withMessage('Capital must be a string'),
    body('company_revenue').optional({ nullable: true }).isString().withMessage('Revenue must be a string'),
    body('company_representative')
        .optional({ nullable: true })
        .isString()
        .withMessage('Representative must be a string'),
    body('tagline').optional({ nullable: true }).isString().withMessage('Tagline must be a string'),
    body('job_title').optional({ nullable: true }).isString().withMessage('Job title must be a string'),
    body('job_description')
        .optional({ nullable: true })
        .isString()
        .withMessage('Job description must be a string'),
    body('number_of_openings')
        .optional({ nullable: true })
        .isString()
        .withMessage('Number of openings must be a string'),
    body('employment_type')
        .optional({ nullable: true })
        .isString()
        .withMessage('Employment type must be a string'),
    body('probation_period')
        .optional({ nullable: true })
        .isString()
        .withMessage('Probation period must be a string'),
    body('employment_period')
        .optional({ nullable: true })
        .isString()
        .withMessage('Employment period must be a string'),
    body('recommended_skills')
        .optional({ nullable: true })
        .isString()
        .withMessage('Recommended skills must be a string'),
    body('recommended_licenses')
        .optional({ nullable: true })
        .isString()
        .withMessage('Recommended licenses must be a string'),
    body('recommended_other')
        .optional({ nullable: true })
        .isString()
        .withMessage('Recommended other must be a string'),
    body('salary_increase')
        .optional({ nullable: true })
        .isString()
        .withMessage('Salary increase must be a string'),
    body('bonus').optional({ nullable: true }).isString().withMessage('Bonus must be a string'),
    body('allowances').optional({ nullable: true }).isString().withMessage('Allowances must be a string'),
    body('holidays_vacation')
        .optional({ nullable: true })
        .isString()
        .withMessage('Holidays/vacation must be a string'),
    body('other_notes').optional({ nullable: true }).isString().withMessage('Other notes must be a string'),
    body('interview_method')
        .optional({ nullable: true })
        .isString()
        .withMessage('Interview method must be a string'),

    // Additional fields
    body('japanese_level').optional({ nullable: true }).isString().withMessage('Japanese level must be a string'),
    body('application_requirements_other').optional({ nullable: true }).isString().withMessage('Other requirements must be a string'),
    body('retirement_benefit').optional({ nullable: true }).isString().withMessage('Retirement benefit must be a string'),
    body('telework_availability').optional({ nullable: true }).isString().withMessage('Telework availability must be a string'),
    body('housing_availability').optional({ nullable: true }).isString().withMessage('Housing availability must be a string'),
    body('relocation_support').optional({ nullable: true }).isString().withMessage('Relocation support must be a string'),
    body('airport_pickup').optional({ nullable: true }).isString().withMessage('Airport pickup must be a string'),
    body('intro_page_thumbnail').optional({ nullable: true }).isString().withMessage('Intro page thumbnail must be a string'),
	(req, res, next) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		next()
	},
]
