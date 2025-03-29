const express = require('express')
const router = express.Router()
const KintoneController = require('../controllers/kintoneController')

/**
 * @swagger
 * /api/kintone:
 *   get:
 *     tags: [Kintone]
 *     summary: Retrieve all records from Kintone
 *     responses:
 *       200:
 *         description: Returns a list of records
 *   post:
 *     tags: [Kintone]
 *     summary: Create a record in Kintone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Successfully created a new record
 *
 * /api/kintone/getby:
 *   post:
 *     tags: [Kintone]
 *     summary: Retrieve records by specific column and value
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Matching records returned
 *
 * /api/kintone/sync:
 *   post:
 *     tags: [Kintone]
 *     summary: Synchronize data from Kintone to the local database
 *     responses:
 *       204:
 *         description: Data synchronized successfully
 *
 * /api/kintone/{id}:
 *   put:
 *     tags: [Kintone]
 *     summary: Update a specified record by its ID
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
 *     responses:
 *       200:
 *         description: Updated record
 *   delete:
 *     tags: [Kintone]
 *     summary: Delete a specified record by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Record deleted successfully
 */

router.get('/', KintoneController.getAll)
router.post('/getby', KintoneController.getBy)
router.post('/', KintoneController.create)
router.post('/sync', KintoneController.sync)
router.put('/:id', KintoneController.update)
router.delete('/:id', KintoneController.delete)

module.exports = router

