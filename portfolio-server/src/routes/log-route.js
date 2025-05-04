const express = require('express')
const LogController = require('../controllers/logController')

const router = express.Router()

/**
 * @swagger
 * /api/log:
 *   post:
 *     tags: [Log]
 *     summary: Create a new log entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               level:
 *                 type: string
 *             example:
 *               message: "User login event"
 *               level: "info"
 *     responses:
 *       201:
 *         description: Log created successfully
 *       400:
 *         description: Bad request
 *   get:
 *     tags: [Log]
 *     summary: Retrieve all log entries
 *     responses:
 *       200:
 *         description: A list of logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *
 * /api/log/{id}:
 *   get:
 *     tags: [Log]
 *     summary: Retrieve a log entry by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The requested log entry
 *       404:
 *         description: Log not found
 *   put:
 *     tags: [Log]
 *     summary: Update a log entry by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Log updated successfully
 *       400:
 *         description: Bad request
 *   delete:
 *     tags: [Log]
 *     summary: Delete a log entry by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Log deleted successfully
 *       400:
 *         description: Bad request
 */

router.post('/', LogController.createLog)

router.get('/:id', LogController.getLogById)

router.put('/:id', LogController.updateLog)

router.delete('/:id', LogController.deleteLog)

router.get('/', LogController.getAllLogs)

module.exports = router
