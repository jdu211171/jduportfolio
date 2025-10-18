const { Staff } = require('../models') // Assuming your model file is properly exported
const generatePassword = require('generate-password')
const bcrypt = require('bcrypt')
const { Op } = require('sequelize')
const { formatStaffWelcomeEmail } = require('../utils/emailToStaff')

class StaffService {
	static async createStaff(data) {
		try {
			const newStaff = await Staff.create(data)
			return newStaff
		} catch (error) {
			console.error('Error creating staff:', error) // Log any errors
			throw error
		}
	}

	static async getAllStaff(filter) {
		try {
			let query = {} // Initialize an empty query object
			const searchableColumns = ['email', 'first_name', 'last_name', 'department', 'position'] // Example list of searchable columns

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
			const staffList = await Staff.findAll({ where: query })
			return staffList
		} catch (error) {
			throw error
		}
	}

	static async getStaffById(staffId) {
		try {
			const staff = await Staff.findByPk(staffId)
			if (!staff) {
				throw new Error('Staff not found')
			}
			return staff
		} catch (error) {
			throw error
		}
	}

	static async updateStaff(staffId, staffData) {
		try {
			const staff = await Staff.findByPk(staffId, {
				attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
			})
			if (!staff) {
				throw new Error('Staff not found')
			}
			await staff.update(staffData)
			return staff
		} catch (error) {
			throw error
		}
	}

	static async deleteStaff(staffId) {
		try {
			await Staff.destroy({ where: { kintone_id: staffId } })
		} catch (error) {
			console.error('Error deleting staff:', error) // Log any errors
			throw error
		}
	}

	static async updateStaffByKintoneId(kintoneId, staffData) {
		try {
			const staff = await Staff.findOne({ where: { kintone_id: kintoneId } })
			if (!staff) {
				throw new Error('Staff not found')
			}
			await staff.update(staffData)
			return staff
		} catch (error) {
			throw error
		}
	}

	static async deleteStaffByKintoneId(kintoneId) {
		return await Staff.destroy({ where: { kintone_id: kintoneId } })
	}

	/**
	 * Kintone'dan kelgan xodimlar ro'yxatini sinxronizatsiya qiladi.
	 * @param {Array} staffRecords - Kintone'dan olingan xodimlar ro'yxati.
	 * @returns {Array} Yangi xodimlar uchun email vazifalari massivi.
	 */
	static async syncStaffData(staffRecords) {
		console.log(`Staff sinxronizatsiyasi boshlandi: ${staffRecords.length} ta yozuv topildi.`)
		const emailTasks = []

		for (const record of staffRecords) {
			const kintoneId = record['$id']?.value
			if (!kintoneId) continue

			const existingStaff = await Staff.findOne({
				where: { kintone_id: kintoneId },
			})
			// console.log(`Kintone ID: ${kintoneId}, Mavjud xodim: ${!!existingStaff}`);
			if (!existingStaff) {
				// console.log(`Yangi xodim topildi: Kintone ID ${ typeof(kintoneId)}. Bazaga qo'shilmoqda...`);
				const password = generatePassword.generate({
					length: 12,
					numbers: true,
					symbols: false,
					uppercase: true,
				})

				const staffData = {
					email: record.staffEmail?.value,
					password: password,
					first_name: record.staffFirstName?.value,
					last_name: record.staffLastName?.value,
					department: record.staffDepartment?.value,
					position: record.staffPosition?.value,
					kintone_id: kintoneId,
					active: true,
				}

				const newStaff = await this.createStaff(staffData)

				if (newStaff) {
					// >>> O'ZGARISH: Email vazifasini ro'yxatga qo'shamiz <<<
					emailTasks.push(formatStaffWelcomeEmail(newStaff.email, password, newStaff.first_name, newStaff.last_name))
				}
			}
		}

		console.log('Staff sinxronizatsiyasi yakunlandi.')
		return emailTasks
	}
}

module.exports = StaffService
