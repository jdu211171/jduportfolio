const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const RecruiterService = require('../services/recruiterService')
const { Recruiter } = require('../models')
const { sendRecruiterWelcomeEmail } = require('../utils/emailToRecruiter')
const generatePassword = require('generate-password')
class RecruiterController {
	// Webhook handler for Kintone events
	static async webhookHandler(req, res) {
		try {
			const { type, record, recordId } = req.body

			switch (type) {
				case 'ADD_RECORD': {
					const password = generatePassword.generate({
						length: 12,
						numbers: true,
						symbols: false,
						uppercase: true,
					})
					// Parse isPartner from Kintone
					let isPartner = false
					const isPartnerRaw = record.isPartner?.value
					if (Array.isArray(isPartnerRaw)) {
						isPartner = isPartnerRaw.map(v => String(v).toLowerCase()).includes('true')
					} else if (typeof isPartnerRaw === 'string') {
						isPartner = isPartnerRaw.toLowerCase() === 'true'
					}

					const data = {
						email: record.recruiterEmail?.value,
						password: password,
						first_name: record.recruiterFirstName?.value,
						last_name: record.recruiterLastName?.value,
						company_name: record.recruiterCompany?.value,
						phone: record.recruiterPhone?.value,
						kintone_id: record['$id']?.value,
						isPartner,
					}
					const newRecruiter = await RecruiterService.createRecruiter(data)
					if (newRecruiter) {
						await sendRecruiterWelcomeEmail(newRecruiter.email, password, newRecruiter.first_name, newRecruiter.last_name)
					}
					return res.status(201).json(newRecruiter)
				}
				case 'UPDATE_RECORD': {
					const isPartnerRaw = record.isPartner?.value
					let isPartner = false
					if (Array.isArray(isPartnerRaw)) {
						isPartner = isPartnerRaw.map(v => String(v).toLowerCase()).includes('true')
					} else if (typeof isPartnerRaw === 'string') {
						isPartner = isPartnerRaw.toLowerCase() === 'true'
					}

					const recruiterData = {
						email: record.recruiterEmail.value,
						first_name: record.recruiterFirstName.value,
						last_name: record.recruiterLastName.value,
						company_name: record.recruiterCompany.value,
						phone: record.recruiterPhone.value,
						kintone_id: record['$id'].value,
						isPartner,
					}
					const updatedRecruiter = await RecruiterService.updateRecruiterByKintoneId(record['$id']?.value, recruiterData)
					if (!updatedRecruiter) return res.status(404).json({ message: 'Recruiter not found' })
					return res.status(200).json({ message: 'Updated', recruiter: updatedRecruiter })
				}
				case 'DELETE_RECORD': {
					const deletedCount = await RecruiterService.deleteRecruiterByKintoneId(recordId)
					if (deletedCount === 0) return res.status(404).json({ message: 'Recruiter not found' })
					return res.status(204).send()
				}
				default:
					return res.status(400).json({ message: 'Invalid event type' })
			}
		} catch (error) {
			console.error('Recruiter webhook error:', error)
			return res.status(500).json({ message: 'Internal Server Error' })
		}
	}

	static async create(req, res, next) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() })
			}

			const newRecruiter = await RecruiterService.createRecruiter(req.body)
			res.status(201).json(newRecruiter)
		} catch (error) {
			next(error)
		}
	}

	static async getAll(req, res, next) {
		try {
			let filter = {}

			// Handle both filter and filter[key] formats
			if (req.query.filter) {
				try {
					filter = typeof req.query.filter === 'string' ? JSON.parse(req.query.filter) : req.query.filter
				} catch (e) {
					console.error('Failed to parse filter:', e.message)
					// If JSON parsing fails, treat it as a direct search value
					filter = { search: req.query.filter }
				}
			}

			// Handle URL query parameter format like filter[search]=Peter
			Object.keys(req.query).forEach(key => {
				if (key.startsWith('filter[') && key.endsWith(']')) {
					const filterKey = key.slice(7, -1) // Remove 'filter[' and ']'
					filter[filterKey] = req.query[key]
				}
			})

			const recruiters = await RecruiterService.getAllRecruiters(filter)

			// Set cache control headers to prevent 304 responses
			res.set({
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				Pragma: 'no-cache',
				Expires: '0',
			})

			res.status(200).json(recruiters)
		} catch (error) {
			console.error('Error in getAllRecruiters controller:', error.message, error.stack)

			// Return empty array instead of 500 error for better UX
			res.status(200).json([])
		}
	}

	static async getById(req, res, next) {
		try {
			const recruiter = await RecruiterService.getRecruiterById(req.params.id)
			res.status(200).json(recruiter)
		} catch (error) {
			next(error)
		}
	}

	static async update(req, res, next) {
		try {
			const { id } = req.params
			const recruiterData = req.body
			const { currentPassword, password, ...updateData } = req.body

			if (password) {
				const recruiter = await RecruiterService.getRecruiterById(id, true)
				if (!recruiter || !(await bcrypt.compare(currentPassword, recruiter.password))) {
					return res.status(400).json({ error: '現在のパスワードを入力してください' })
				}
			}

			const updatedRecruiter = await RecruiterService.updateRecruiter(id, {
				...updateData,
				password: password || undefined,
			})
			res.status(200).json(updatedRecruiter)
		} catch (error) {
			next(error)
		}
	}
}

module.exports = RecruiterController
