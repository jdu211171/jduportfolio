const express = require('express')
const ItSkillController = require('../controllers/itSkillController')
// const { protect, restrictTo } = require('../middlewares/authMiddleware'); // Ruxsatlarni boshqarish uchun

const router = express.Router()

router
	.route('/')
	.post(ItSkillController.createSkill)
	.get(ItSkillController.getAllSkills)

router
	.route('/:id')
	.get(ItSkillController.getSkill)
	.patch(ItSkillController.updateSkill)
	.delete(ItSkillController.deleteSkill)

module.exports = router
