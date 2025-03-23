const express = require('express')
const router = express.Router()
const RecruiterController = require('../controllers/recruiterController')
const {
	validateRecruiterCreation,
} = require('../middlewares/recruiter-validation')

/**
 * @swagger
 * /api/recruiters:
 *   post:
 *     tags: [Recruiters]
 *     summary: Create a new recruiter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               company_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Recruiter created
 *       400:
 *         description: Validation error
 */
router.post('/', validateRecruiterCreation, RecruiterController.create)

/**
 * @swagger
 * /api/recruiters:
 *   get:
 *     tags: [Recruiters]
 *     summary: Get all recruiters
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional filter criteria
 *     responses:
 *       200:
 *         description: A list of recruiters
 *       400:
 *         description: Bad request
 */
router.get('/', RecruiterController.getAll)

/**
 * @swagger
 * /api/recruiters/{id}:
 *   get:
 *     tags: [Recruiters]
 *     summary: Get recruiter by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Recruiter ID
 *     responses:
 *       200:
 *         description: Recruiter data
 *       400:
 *         description: Bad request
 */
router.get('/:id', RecruiterController.getById)

/**
 * @swagger
 * /api/recruiters/{id}:
 *   put:
 *     tags: [Recruiters]
 *     summary: Update a recruiter
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Recruiter ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               company_name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Recruiter updated
 *       400:
 *         description: Bad request
 */
router.put('/:id', RecruiterController.update)

/**
 * @swagger
 * /api/recruiters/{id}:
 *   delete:
 *     tags: [Recruiters]
 *     summary: Delete a recruiter
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Recruiter ID
 *     responses:
 *       204:
 *         description: Recruiter deleted
 *       400:
 *         description: Bad request
 */
router.delete('/:id', RecruiterController.delete)

module.exports = router

