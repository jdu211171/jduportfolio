const { body, validationResult } = require('express-validator')

// Validation error handler
const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			errors: errors.array().map(err => ({
				field: err.path,
				message: err.msg,
				value: err.value,
			})),
		})
	}
	next()
}

// Education validator
exports.validateEducation = [body('cv_education').isArray({ min: 0 }).withMessage('cv_education must be an array'), body('cv_education.*.year').isInt({ min: 1900, max: 2100 }).withMessage('Year must be between 1900 and 2100'), body('cv_education.*.month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'), body('cv_education.*.institution').notEmpty().trim().isLength({ max: 255 }).withMessage('Institution name is required and must be less than 255 characters'), body('cv_education.*.status').notEmpty().trim().isLength({ max: 50 }).withMessage('Status is required and must be less than 50 characters'), handleValidationErrors]

// Work Experience validator
exports.validateWorkExperience = [body('cv_work_experience').isArray({ min: 0 }).withMessage('cv_work_experience must be an array'), body('cv_work_experience.*.company').notEmpty().trim().isLength({ max: 255 }).withMessage('Company name is required and must be less than 255 characters'), body('cv_work_experience.*.role').notEmpty().trim().isLength({ max: 255 }).withMessage('Role is required and must be less than 255 characters'), body('cv_work_experience.*.from').notEmpty().isISO8601().withMessage('Start date is required and must be a valid date'), body('cv_work_experience.*.to').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid date'), body('cv_work_experience.*.details').optional().trim().isLength({ max: 1000 }).withMessage('Details must be less than 1000 characters'), handleValidationErrors]

// Licenses validator
exports.validateLicenses = [body('cv_licenses').isArray({ min: 0 }).withMessage('cv_licenses must be an array'), body('cv_licenses.*.year').isInt({ min: 1900, max: 2100 }).withMessage('Year must be between 1900 and 2100'), body('cv_licenses.*.month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'), body('cv_licenses.*.certifacateName').notEmpty().trim().isLength({ max: 255 }).withMessage('Certificate name is required and must be less than 255 characters'), handleValidationErrors]

// Projects validator
exports.validateProjects = [body('cv_projects').isArray({ min: 0 }).withMessage('cv_projects must be an array'), body('cv_projects.*.title').notEmpty().trim().isLength({ max: 255 }).withMessage('Project title is required and must be less than 255 characters'), body('cv_projects.*.description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'), body('cv_projects.*.technologies').optional().isArray().withMessage('Technologies must be an array'), body('cv_projects.*.url').optional().trim().isURL().withMessage('URL must be valid'), body('cv_projects.*.startDate').optional().isISO8601().withMessage('Start date must be valid'), body('cv_projects.*.endDate').optional().isISO8601().withMessage('End date must be valid'), handleValidationErrors]

// Additional Info validator
exports.validateAdditionalInfo = [body('cv_additional_info').isObject().withMessage('cv_additional_info must be an object'), body('cv_additional_info.addressFurigana').optional().trim().isLength({ max: 255 }).withMessage('Address furigana must be less than 255 characters'), body('cv_additional_info.indeks').optional().trim().isLength({ max: 20 }).withMessage('Indeks must be less than 20 characters'), body('cv_additional_info.additionalAddress').optional().trim().isLength({ max: 500 }).withMessage('Additional address must be less than 500 characters'), body('cv_additional_info.additionalAddressFurigana').optional().trim().isLength({ max: 255 }).withMessage('Additional address furigana must be less than 255 characters'), body('cv_additional_info.additionalIndeks').optional().trim().isLength({ max: 20 }).withMessage('Additional indeks must be less than 20 characters'), body('cv_additional_info.additionalEmail').optional().trim().isEmail().withMessage('Additional email must be valid'), body('cv_additional_info.transportation').optional().trim().isLength({ max: 100 }).withMessage('Transportation must be less than 100 characters'), body('cv_additional_info.commuteTime').optional().isInt({ min: 0, max: 300 }).withMessage('Commute time must be between 0 and 300 minutes'), body('cv_additional_info.numDependents').optional().isInt({ min: 0 }).withMessage('Number of dependents must be 0 or greater'), body('cv_additional_info.isMarried').optional().isBoolean().withMessage('Married status must be boolean'), body('cv_additional_info.spousalSupportObligation').optional().isBoolean().withMessage('Spousal support obligation must be boolean'), body('cv_additional_info.hopes').optional().trim().isLength({ max: 2000 }).withMessage('Hopes must be less than 2000 characters'), body('cv_additional_info.languageUzbek').optional().trim().isLength({ max: 50 }).withMessage('Language level must be less than 50 characters'), body('cv_additional_info.languageEnglish').optional().trim().isLength({ max: 50 }), body('cv_additional_info.languageRussian').optional().trim().isLength({ max: 50 }), body('cv_additional_info.tools').optional().isArray().withMessage('Tools must be an array'), body('cv_additional_info.databases').optional().isArray().withMessage('Databases must be an array'), body('cv_additional_info.arubatio').optional().isArray().withMessage('Arubatio must be an array'), handleValidationErrors]

// Address validator
exports.validateAddress = [body('address').optional().trim().isLength({ max: 500 }).withMessage('Address must be less than 500 characters'), body('address_furigana').optional().trim().isLength({ max: 255 }).withMessage('Address furigana must be less than 255 characters'), body('postal_code').optional().trim().isLength({ max: 20 }).withMessage('Postal code must be less than 20 characters'), handleValidationErrors]
