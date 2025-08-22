const express = require('express');
const SkillController = require('../controllers/skillController');
const router = express.Router();

router.get('/', SkillController.getAllSkills);
router.get('/:id', SkillController.getSkill);


router.post('/', SkillController.createSkill);
router.patch('/:id', SkillController.updateSkill);
router.delete('/:id', SkillController.deleteSkill);

module.exports = router;