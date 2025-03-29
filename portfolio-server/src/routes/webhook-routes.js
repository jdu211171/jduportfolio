const express = require('express')
const router = express.Router()
const StaffController = require('../controllers/staffController')
const RecruiterController = require('../controllers/recruiterController')
const StudentController = require('../controllers/studentController')

/**
 * @swagger
 * /api/webhook/staff:
 *   post:
 *     tags: [Webhook]
 *     summary: Handle staff-related webhook events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffEvent:
 *                 type: string
 *                 description: Type of staff event
 *     responses:
 *       200:
 *         description: Successfully processed staff webhook
 *       400:
 *         description: Bad request
 */
router.post('/staff', StaffController.webhookHandler)

/**
 * @swagger
 * /api/webhook/recruiter:
 *   post:
 *     tags: [Webhook]
 *     summary: Handle recruiter-related webhook events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recruiterEvent:
 *                 type: string
 *                 description: Type of recruiter event
 *     responses:
 *       200:
 *         description: Successfully processed recruiter webhook
 *       400:
 *         description: Bad request
 */
router.post('/recruiter', RecruiterController.webhookHandler)

/**
 * @swagger
 * /api/webhook/student:
 *   post:
 *     tags: [Webhook]
 *     summary: Handle student-related webhook events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentEvent:
 *                 type: string
 *                 description: Type of student event
 *     responses:
 *       200:
 *         description: Successfully processed student webhook
 *       400:
 *         description: Bad request
 */
router.post('/student', StudentController.webhookHandler)
// router.post('/credits', StudentController.creditUpdater);

module.exports = router

