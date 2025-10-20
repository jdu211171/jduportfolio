const SkillService = require('../services/skillService')

class SkillController {
	static async createSkill(req, res) {
		try {
			const userType = req.user.userType.toLowerCase()
			if (userType !== 'admin' && userType !== 'staff') {
				return res.status(403).json({
					error: "Ruxsat yo'q. Faqat Admin va Staff ko'nikma yarata oladi.",
				})
			}

			const { name } = req.body
			if (!name) {
				return res
					.status(400)
					.json({ error: "Ko'nikma nomi yuborilishi shart." })
			}
			const newSkill = await SkillService.createSkill({ name })
			res.status(201).json(newSkill)
		} catch (error) {
			res.status(400).json({ error: error.message })
		}
	}

	static async getAllSkills(req, res) {
		try {
			const { search } = req.query
			const skills = await SkillService.getAllSkills(search)
			res.status(200).json(skills)
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	}

	static async getSkill(req, res) {
		try {
			const { id } = req.params
			const skill = await SkillService.getSkillById(id)
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
					error: "Ruxsat yo'q. Faqat Admin va Staff ko'nikmani yangilay oladi.",
				})
			}

			const { id } = req.params
			const updatedSkill = await SkillService.updateSkill(id, req.body)
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
					error: "Ruxsat yo'q. Faqat Admin va Staff ko'nikmani o'chira oladi.",
				})
			}

			const { id } = req.params
			const deletedSkill = await SkillService.deleteSkill(id)
			if (!deletedSkill) {
				return res.status(404).json({ error: "Ko'nikma topilmadi." })
			}
			res.status(204).send()
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	}
}

module.exports = SkillController
