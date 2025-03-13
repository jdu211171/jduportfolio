const express = require('express');
const DraftController = require('../controllers/draftController');
const router = express.Router();
// router.use(express.json({ strict: false }));

router.post('/', DraftController.createDraft);          // student create qiladi
router.get('/', DraftController.getAllDrafts);                // Get all drafts
router.get('/id/:id', DraftController.getDraftById);          // Get draft by ID
router.get('/student/:student_id', DraftController.getDraftByStudentId); // Get drafts by student_id
router.put('/:id', DraftController.updateDraft);      // student update qiladi 
router.delete('/:id', DraftController.deleteDraft);
router.put('/:id/submit',DraftController.submitDraft);   // submit qilish va submit_countni oshirish
router.put('/status/:id', DraftController.updateStatus); // statusni ozgaritirish 

module.exports = router;
