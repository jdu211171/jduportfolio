const express = require('express')
const { param } = require('express-validator')
const QAController = require('../controllers/qaController')
const {
	validateQACreation,
	validateQAUpdate,
} = require('../middlewares/qa-validation')

const router = express.Router()

/**
 * @swagger
 * /api/qa:
 *   post:
 *     tags: [QA]
 *     summary: Create a new QA entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *               studentId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: QA entries created successfully
 *       400:
 *         description: Invalid request data
 *
 *   get:
 *     tags: [QA]
 *     summary: Retrieve all QA entries
 *     responses:
 *       200:
 *         description: A list of QA entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   category:
 *                     type: string
 *                   qa_list:
 *                     type: string
 *                   studentId:
 *                     type: integer
 */

/**
 * @swagger
 * /api/qa/{id}:
 *   get:
 *     tags: [QA]
 *     summary: Retrieve a QA entry by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Found the QA entry
 *       404:
 *         description: QA entry not found
 *
 *   put:
 *     tags: [QA]
 *     summary: Update a QA entry by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: QA entry updated
 *       404:
 *         description: QA entry not found
 *
 *   delete:
 *     tags: [QA]
 *     summary: Delete a QA entry by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: QA entry deleted
 *       404:
 *         description: QA entry not found
 */

/**
 * @swagger
 * /api/qa/category/{categoryId}:
 *   get:
 *     tags: [QA]
 *     summary: Retrieve QA entries by category
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: A list of QA entries for the given category
 */

/**
 * @swagger
 * /api/qa/student/{studentId}:
 *   get:
 *     tags: [QA]
 *     summary: Retrieve QA entries by student ID
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: QA entries related to the given student ID
 */

/**
 * @swagger
 * /api/qa/count:
 *   get:
 *     tags: [QA]
 *     summary: Get total number of QA entries
 *     responses:
 *       200:
 *         description: Returns the count of all QA entries
 */

// POST /api/qa
router.post('/', validateQACreation, QAController.createQA)

// GET /api/qa
router.get('/', QAController.getAllQA)

// GET /api/qa/:id
router.get('/:id', QAController.getQAById)

// PUT /api/qa/:id
router.put('/:id', validateQAUpdate, QAController.updateQA)

// DELETE /api/qa/:id
router.delete('/:id', QAController.deleteQA)

// GET /api/qa/category/:categoryId (category ID)
router.get('/category/:categoryId', QAController.findQAByCategory)

// GET /api/qa/student/:studentId (student ID)
router.get('/student/:studentId', QAController.findQAByStudentId)

// GET /api/qa/count (count of all QA entries)
router.get('/count', QAController.countQA)

module.exports = router

