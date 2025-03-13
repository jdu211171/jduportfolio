const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staffController');
const { validateStaffCreation, validateStaffUpdate } = require('../middlewares/staff-validation');

// POST /api/staff
router.get('/', StaffController.getAllStaff);
router.get('/:id', StaffController.getStaffById);
router.put('/:id', validateStaffUpdate, StaffController.updateStaff);

module.exports = router;
