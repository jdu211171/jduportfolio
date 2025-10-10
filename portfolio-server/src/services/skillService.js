const { Skill } = require('../models')
const { Op } = require('sequelize')

class SkillService {
	static async createSkill(skillData) {
		try {
			const skill = await Skill.create(skillData)
			return skill
		} catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				throw new Error(`'${skillData.name}' nomli ko'nikma allaqachon mavjud.`)
			}
			throw error
		}
	}

	static async getAllSkills(searchQuery) {
		const options = {
			order: [['name', 'ASC']],
		}

		if (searchQuery) {
			options.where = {
				name: {
					[Op.iLike]: `%${searchQuery}%`,
				},
			}
		}

		const skills = await Skill.findAll(options)
		return skills
	}

	static async getSkillById(id) {
		const skill = await Skill.findByPk(id)
		return skill
	}

	static async updateSkill(id, updateData) {
		const skill = await Skill.findByPk(id)
		if (!skill) {
			return null
		}
		await skill.update(updateData)
		return skill
	}

	static async deleteSkill(id) {
		const skill = await Skill.findByPk(id)
		if (!skill) {
			return null
		}
		await skill.destroy()
		return skill
	}
}

module.exports = SkillService
