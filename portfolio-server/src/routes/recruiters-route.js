const express = require('express');
const router = express.Router();
const RecruiterController = require('../controllers/recruiterController');
const { validateRecruiterCreation } = require('../middlewares/recruiter-validation');

// POST /api/recruiters/
router.post('/', validateRecruiterCreation, RecruiterController.create);

// Other routes with authentication and validation as needed
router.get('/', RecruiterController.getAll);
router.get('/:id', RecruiterController.getById);
router.put('/:id', RecruiterController.update);
router.delete('/:id', RecruiterController.delete);

module.exports = router;
