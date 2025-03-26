const express = require('express')
const DraftController = require('../controllers/draftController')
const router = express.Router()
// router.use(express.json({ strict: false }));

router.post('/', DraftController.createDraft) // student create qiladi
router.get('/', DraftController.getAllDrafts) // Get all drafts
router.get('/id/:id', DraftController.getDraftById) // Get draft by ID
router.get('/student/:student_id', DraftController.getDraftByStudentId) // Get drafts by student_id
router.put('/:id', DraftController.updateDraft) // student update qiladi
router.delete('/:id', DraftController.deleteDraft)
router.put('/:id/submit', DraftController.submitDraft) // submit qilish va submit_countni oshirish
router.put('/status/:id', DraftController.updateStatus) // statusni ozgaritirish

module.exports = router

/**
 * @swagger
 * tags:
 *   - name: Drafts
 *     description: Draft management
 */

/**
 * @swagger
 * /api/draft:
 *   post:
 *     tags: [Drafts]
 *     summary: Create a new draft
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               student_id:
 *                 type: string
 *               profile_data:
 *                 type: object
 *               comments:
 *                 type: string
 *               status:
 *                 type: string
 *               reviewed_by:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Draft created successfully
 *       400:
 *         description: Bad request
 * /api/draft:
 *   get:
 *     tags: [Drafts]
 *     summary: Get all drafts
 *     responses:
 *       200:
 *         description: All drafts retrieved
 */

/**
 * @swagger
 * /api/draft/id/{id}:
 *   get:
 *     tags: [Drafts]
 *     summary: Get draft by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Draft object
 *       404:
 *         description: Draft not found
 */

/**
 * @swagger
 * /api/draft/student/{student_id}:
 *   get:
 *     tags: [Drafts]
 *     summary: Get draft by student_id
 *     parameters:
 *       - in: path
 *         name: student_id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Drafts for specific student
 *       404:
 *         description: Student not found or no drafts
 */

/**
 * @swagger
 * /api/draft/{id}:
 *   put:
 *     tags: [Drafts]
 *     summary: Update a draft
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
 *               profile_data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Draft updated
 *       404:
 *         description: Draft not found
 */

/**
 * @swagger
 * /api/draft/{id}:
 *   delete:
 *     tags: [Drafts]
 *     summary: Delete a draft
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Draft deleted
 *       404:
 *         description: Draft not found
 */

/**
 * @swagger
 * /api/draft/{id}/submit:
 *   put:
 *     tags: [Drafts]
 *     summary: Submit a draft for review
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staff_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Draft submitted successfully
 *       404:
 *         description: Draft not found
 */

/**
 * @swagger
 * /api/draft/status/{id}:
 *   put:
 *     tags: [Drafts]
 *     summary: Update draft status
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
 *               status:
 *                 type: string
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Draft status updated
 *       404:
 *         description: Draft not found
 */
