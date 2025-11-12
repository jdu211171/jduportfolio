const { QA } = require('../models')

class QAService {
	// Service method to create a new QA entry
	static async createQA(qaData) {
		const newQA = await QA.create(qaData)
		return newQA
	}

	// Service method to retrieve all QA entries
	static async getAllQA() {
		const qa = await QA.findAll()
		return qa
	}

	// Service method to retrieve a QA entry by ID
	static async getQAById(qaId) {
		const qa = await QA.findByPk(qaId)
		return qa
	}

	// Service method to update a QA entry
	static async updateQA(qaId, qaData) {
		const qa = await QA.findByPk(qaId)
		if (!qa) {
			throw new Error('QA entry not found')
		}
		await qa.update({ qa_list: qaData })
		return qa
	}

	// Service method to delete a QA entry
	static async deleteQA(qaId) {
		const qa = await QA.findByPk(qaId)
		if (!qa) {
			throw new Error('QA entry not found')
		}
		await qa.destroy()
		return { message: 'QA entry deleted successfully' }
	}

	// Service method to find QA entries by category
	static async findQAByCategory(category) {
		const qaList = await QA.findAll({
			where: { category: category },
		})
		return qaList
	}

	// Service method to find QA entries by studentId
	static async findQAByStudentId(studentId) {
		const qaList = await QA.findAll({
			where: { studentId },
		})
		return qaList
	}

	// Service method to count QA entries
	static async countQA() {
		const count = await QA.count()
		return count
	}
}

module.exports = QAService
