const express = require('express');
const StudentController = require('../controllers/studentController');
const {
  validateStudentCreation,
  validateStudentUpdate
} = require('../middlewares/student-validation');

const router = express.Router();

// POST /api/students
router.post('/', validateStudentCreation, StudentController.createStudent);

// GET /api/students
router.get('/', StudentController.getAllStudents);

// GET /api/students/:id
router.get('/:id', StudentController.getStudentById);

// PUT /api/students/:id
router.put('/:id', validateStudentUpdate, StudentController.updateStudent);

// DELETE /api/students/:id
router.delete('/:id', StudentController.deleteStudent);

// GET Pending status drafts
router.get('/pending-drafts', StudentController.getStudentsWithPendingDrafts);

module.exports = router;
