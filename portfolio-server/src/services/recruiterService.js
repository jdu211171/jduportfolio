const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const { Recruiter } = require('../models')
const { formatRecruiterWelcomeEmail } = require('../utils/emailToRecruiter')
const generatePassword = require('generate-password')

class RecruiterService {
	// Service method to create a new recruiter
	static async createRecruiter(recruiterData) {
		try {
			const newRecruiter = await Recruiter.create(recruiterData)
			return newRecruiter
		} catch (error) {
			throw error // Throw the error for the controller to handle
		}
		å
	}

	// Service method to retrieve all recruiters
	static async getAllRecruiters(filter) {
		try {
			let query = {} // Initialize an empty query object
			const searchableColumns = [
				'email',
				'first_name',
				'last_name',
				'company_name',
				'company_description',
				'phone',
				'company_Address',
				'business_overview',
				'target_audience',
				'required_skills',
				'welcome_skills',
				'work_location',
				'work_hours',
				'salary',
				'benefits',
				'selection_process',
			] // Example list of searchable columns

			// Iterate through filter keys
			Object.keys(filter).forEach(key => {
				if (filter[key]) {
					// Handle different types of filter values
					if (key === 'search') {
						// Search across all searchable columns
						query[Op.or] = searchableColumns.map(column => {
							// Use Op.iLike for case insensitive search on other columns
							return { [column]: { [Op.iLike]: `%${filter[key]}%` } }
						})
					} else if (Array.isArray(filter[key])) {
						// If filter value is an array, use $in operator
						query[key] = { [Op.in]: filter[key] }
					} else if (typeof filter[key] === 'string') {
						query[key] = { [Op.like]: `%${filter[key]}%` }
					} else {
						// Handle other types of filter values as needed
						query[key] = filter[key]
					}
				}
			})
			const recruiters = await Recruiter.findAll({ where: query })
			return recruiters
		} catch (error) {
			throw error
		}
	}

	// Service method to retrieve a recruiter by ID
	static async getRecruiterById(recruiterId, password = false) {
		try {
			let excluded = ['createdAt', 'updatedAt']
			if (!password) {
				excluded.push('password')
			}
			const recruiter = await Recruiter.findByPk(recruiterId, {
				attributes: { exclude: excluded },
			})
			if (!recruiter) {
				throw new Error('Recruiter not found')
			}
			return recruiter
		} catch (error) {
			throw error
		}
	}

	static async getRecruiterByIdWithPassword(recruiterId) {
		try {
			const recruiter = await Recruiter.findByPk(recruiterId)
			if (!recruiter) {
				throw new Error('Recruiter not found')
			}
			return recruiter
		} catch (error) {
			throw error
		}
	}

	static async updateRecruiter(id, data) {
		try {
			const recruiter = await Recruiter.findByPk(id)
			if (!recruiter) {
				throw new Error('Recruiter not found')
			}

			const updatedData = {
				first_name: data.first_name,
				last_name: data.last_name,
				phone: data.phone,
				email: data.email,
				company_name: data.company_name,
				company_description: data.company_description,
				gallery: data.gallery,
				photo: data.photo,
				date_of_birth: data.date_of_birth,
				active: data.active,
				kintone_id: data.kintone_id,
				company_Address: data.company_Address,
				established_Date: data.established_Date,
				employee_Count: data.employee_Count,
				business_overview: data.business_overview,
				target_audience: data.target_audience,
				required_skills: data.required_skills,
				welcome_skills: data.welcome_skills,
				work_location: data.work_location,
				work_hours: data.work_hours,
				salary: data.salary,
				benefits: data.benefits,
				selection_process: data.selection_process,
			}

			if (data.password) {
				updatedData.password = data.password
			}

			return await recruiter.update(updatedData)
		} catch (error) {
			throw error
		}
	}

	static async updateRecruiterByKintoneId(kintoneId, data) {
		const [affectedRows, updatedRecruiters] = await Recruiter.update(data, {
			where: { kintone_id: kintoneId },
			returning: true,
		})
		return updatedRecruiters ? updatedRecruiters[0] : null
	}

	static async deleteRecruiterByKintoneId(kintoneId) {
		return await Recruiter.destroy({ where: { kintone_id: kintoneId } })
	}

	/**
	 * Kintone'dan kelgan rekruterlar ro'yxatini sinxronizatsiya qiladi.
	 * @param {Array} recruiterRecords - Kintone'dan olingan rekruterlar ro'yxati.
	 * @returns {Array} Yangi rekruterlar uchun email vazifalari massivi.
	 */
	static async syncRecruiterData(recruiterRecords) {
		console.log(
			`Rekruter sinxronizatsiyasi boshlandi: ${recruiterRecords.length} ta yozuv topildi.`
		)
		const emailTasks = []
		for (const record of recruiterRecords) {
			const kintoneId = record['$id']?.value
			if (!kintoneId) continue

			const existingRecruiter = await Recruiter.findOne({
				where: { kintone_id: kintoneId },
			})
			// console.log(`Kintone ID: ${typeof kintoneId}, Mavjud rekruter: ${!!existingRecruiter}`);
			if (!existingRecruiter) {
				console.log(
					`Yangi rekruter topildi: Kintone ID ${kintoneId}. Bazaga qo'shilmoqda...`
				)
				const password = generatePassword.generate({
					length: 12,
					numbers: true,
					symbols: false,
					uppercase: true,
				})

				const recruiterData = {
					email: record.recruiterEmail?.value,
					password: password,
					first_name: record.recruiterFirstName?.value,
					last_name: record.recruiterLastName?.value,
					company_name: record.recruiterCompany?.value,
					phone: record.recruiterPhone?.value,
					kintone_id: kintoneId,
					active: true,
				}

				const newRecruiter = await this.createRecruiter(recruiterData)

				if (newRecruiter) {
					// >>> O'ZGARISH: Email vazifasini ro'yxatga qo'shamiz <<<
					emailTasks.push(
						formatRecruiterWelcomeEmail(
							newRecruiter.email,
							password,
							newRecruiter.first_name,
							newRecruiter.last_name
						)
					)
				}
			}
		}
		console.log('Rekruter sinxronizatsiyasi yakunlandi.')
		return emailTasks
	}
}

module.exports = RecruiterService
