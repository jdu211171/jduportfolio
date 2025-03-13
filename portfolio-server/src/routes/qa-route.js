const express = require('express');
const { param } = require('express-validator');
const QAController = require('../controllers/qaController');
const {
  validateQACreation,
  validateQAUpdate
} = require('../middlewares/qa-validation');

const router = express.Router();

// POST /api/qa
router.post('/', validateQACreation, QAController.createQA);

// GET /api/qa
router.get('/', QAController.getAllQA);

// GET /api/qa/:id
router.get('/:id', QAController.getQAById);

// PUT /api/qa/:id
router.put('/:id', validateQAUpdate, QAController.updateQA);

// DELETE /api/qa/:id
router.delete('/:id', QAController.deleteQA);

// GET /api/qa/category/:categoryId (category ID)
router.get('/category/:categoryId', QAController.findQAByCategory);

// GET /api/qa/student/:studentId (student ID)
router.get('/student/:studentId', QAController.findQAByStudentId);

// GET /api/qa/count (count of all QA entries)
router.get('/count', QAController.countQA);

module.exports = router;
