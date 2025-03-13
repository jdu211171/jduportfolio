const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staffController');
const RecruiterController = require('../controllers/recruiterController');
const StudentController = require('../controllers/studentController');

router.post('/staff', StaffController.webhookHandler);
router.post('/recruiter', RecruiterController.webhookHandler);
router.post('/student', StudentController.webhookHandler);
// router.post('/credits', StudentController.creditUpdater);

module.exports = router;
