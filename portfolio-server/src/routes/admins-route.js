const express = require('express')
const AdminController = require('../controllers/adminController')
const authMiddleware = require('../middlewares/auth-middleware')
const router = express.Router()

/**
 * @swagger
 * tags:
 *   - name: Admins
 *     description: Admin management
 *
 * /api/admin:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Bad request
 *
 * /api/admin/{id}:
 *   get:
 *     summary: Get an admin by ID
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin retrieved successfully
 *       404:
 *         description: Admin not found
 *   put:
 *     summary: Update an admin by ID
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Admin updated successfully
 *       400:
 *         description: Bad request
 *   delete:
 *     summary: Delete an admin by ID
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Admin deleted successfully
 *       400:
 *         description: Bad request
 */

router.get('/student-password/:studentId', authMiddleware, AdminController.getStudentPassword)
router.patch('/reset-student-password/:studentId', authMiddleware, AdminController.resetStudentPassword)
router.post('/', AdminController.create)
router.get('/:id', AdminController.getById)
router.put('/:id', AdminController.update)
router.delete('/:id', AdminController.delete)

module.exports = router
