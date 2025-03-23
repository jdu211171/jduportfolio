const express = require('express')
const router = express.Router()
const StaffController = require('../controllers/staffController')
const {
	validateStaffCreation,
	validateStaffUpdate,
} = require('../middlewares/staff-validation')

/**
 * @swagger
 * /api/staff:
 *   get:
 *     tags: [Staff]
 *     summary: Retrieve all staff
 *     description: Fetch a list of staff records from the database.
 *     responses:
 *       200:
 *         description: Successful staff retrieval
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   department:
 *                     type: string
 *                   position:
 *                     type: string
 */

router.get('/', StaffController.getAllStaff)

/**
 * @swagger
 * /api/staff/{id}:
 *   get:
 *     tags: [Staff]
 *     summary: Retrieve a single staff member by ID
 *     description: Get detailed information for a specific staff record.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single staff record
 *       404:
 *         description: Staff not found
 *   put:
 *     tags: [Staff]
 *     summary: Update a staff member by ID
 *     description: Modify properties of an existing staff record.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date-time
 *               department:
 *                 type: string
 *               position:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       400:
 *         description: Validation error or incorrect current password
 *       404:
 *         description: Staff not found
 */

router.get('/:id', StaffController.getStaffById)
router.put('/:id', validateStaffUpdate, StaffController.updateStaff)

module.exports = router

