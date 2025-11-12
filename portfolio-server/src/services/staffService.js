const { Staff } = require('../models')
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
			console.error('Error creating staff:', error)
			throw error
		}
	}

	static async getAllStaff(filter) {
		const query = {}
		const searchableColumns = ['email', 'first_name', 'last_name', 'department', 'position']

		Object.keys(filter).forEach(key => {
			if (filter[key]) {
				if (key === 'search') {
					query[Op.or] = searchableColumns.map(column => {
						return { [column]: { [Op.iLike]: `%${filter[key]}%` } }
					})
				} else if (Array.isArray(filter[key])) {
					query[key] = { [Op.in]: filter[key] }
				} else if (typeof filter[key] === 'string') {
					query[key] = { [Op.like]: `%${filter[key]}%` }
				} else {
					query[key] = filter[key]
				}
			}
		})
		const staffList = await Staff.findAll({ where: query })
		return staffList
	}

	static async getStaffById(staffId) {
		const staff = await Staff.findByPk(staffId)
		if (!staff) {
			throw new Error('Staff not found')
		}
		return staff
	}

	static async updateStaff(staffId, staffData) {
		const staff = await Staff.findByPk(staffId, {
			attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
		})
		if (!staff) {
			throw new Error('Staff not found')
		}
		await staff.update(staffData)
		return staff
	}

	static async deleteStaff(staffId) {
		try {
			await Staff.destroy({ where: { kintone_id: staffId } })
		} catch (error) {
			console.error('Error deleting staff:', error)
			throw error
		}
	}

	static async updateStaffByKintoneId(kintoneId, staffData) {
		const staff = await Staff.findOne({ where: { kintone_id: kintoneId } })
		if (!staff) {
			throw new Error('Staff not found')
		}
		await staff.update(staffData)
		return staff
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

			if (!existingStaff) {
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
					emailTasks.push(formatStaffWelcomeEmail(newStaff.email, password, newStaff.first_name, newStaff.last_name))
				}
			}
		}

		console.log('Staff sinxronizatsiyasi yakunlandi.')
		return emailTasks
	}
}

module.exports = StaffService
