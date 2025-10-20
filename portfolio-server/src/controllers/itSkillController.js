const ItSkillService = require('../services/itSkillService')

class ItSkillController {
	static async createSkill(req, res) {
		try {
			const userType = req.user.userType.toLowerCase()
			if (userType !== 'admin' && userType !== 'staff') {
				return res.status(403).json({
					error: "Ruxsat yo'q. Faqat Admin va Staff ko'nikma yarata oladi.",
				})
			}
			const { name, color } = req.body
			if (!name || !color) {
				return res
					.status(400)
					.json({ error: "Ko'nikma nomi va rangi yuborilishi shart." })
			}
			const newSkill = await ItSkillService.createSkill({ name, color })
			res.status(201).json(newSkill)
		} catch (error) {
			res.status(400).json({ error: error.message })
		}
	}

	static async getAllSkills(req, res) {
		try {
			const { search } = req.query
			const skills = await ItSkillService.getAllSkills(search)
			res.status(200).json(skills)
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	}

	static async getSkill(req, res) {
		try {
			const { id } = req.params
			const skill = await ItSkillService.getSkillById(id)
			if (!skill) {
				return res.status(404).json({ error: "Ko'nikma topilmadi." })
			}
			res.status(200).json(skill)
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	}

	static async updateSkill(req, res) {
		try {
			const userType = req.user.userType.toLowerCase()
			if (userType !== 'admin' && userType !== 'staff') {
				return res.status(403).json({
					error:
						"Ruxsat yo'q. Faqat Admin va Staff ko'nikma yangilashi mumkin.",
				})
			}
			const { id } = req.params
			const updatedSkill = await ItSkillService.updateSkill(id, req.body)
			if (!updatedSkill) {
				return res.status(404).json({ error: "Ko'nikma topilmadi." })
			}
			res.status(200).json(updatedSkill)
		} catch (error) {
			res.status(400).json({ error: error.message })
		}
	}

	static async deleteSkill(req, res) {
		try {
			const userType = req.user.userType.toLowerCase()
			if (userType !== 'admin' && userType !== 'staff') {
				return res.status(403).json({
					error:
						"Ruxsat yo'q. Faqat Admin va Staff ko'nikma o'chirishi mumkin.",
				})
			}
			const { id } = req.params
			const deletedSkill = await ItSkillService.deleteSkill(id)
			if (!deletedSkill) {
				return res.status(404).json({ error: "Ko'nikma topilmadi." })
			}
			res.status(204).send()
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	}
}

module.exports = ItSkillController
