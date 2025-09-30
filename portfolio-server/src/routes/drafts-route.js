const express = require('express')
const DraftController = require('../controllers/draftController')
const router = express.Router()
const multer = require('multer')

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // Har bir fayl uchun 5MB limit
})

router
	.route('/')
	// Talaba o'z qoralamasini yaratadi yoki yangilaydi (Upsert)
	.put(DraftController.upsertDraft)
	// Barcha qoralamalarni olish (xodimlar/adminlar uchun)
	.get(DraftController.getAllDrafts)

// Bitta yo'l ('/:id') uchun GET va DELETE metodlarini guruhlash
router
	.route('/:id')
	// Qoralamani o'zining IDsi bo'yicha olish
	.get(DraftController.getDraftById)
	// Qoralamani o'chirish (admin uchun)
	.delete(DraftController.deleteDraft)

// Qoralamani talabaning IDsi bo'yicha olish
router.get('/student/:student_id', DraftController.getDraftByStudentId)

// Xodim (Staff) qoralama statusini o'zgartiradi
router.put('/status/:id', DraftController.updateStatus)

// Talaba o'z qoralamasini tekshiruvga yuboradi
router.put('/:id/submit', DraftController.submitDraft)

module.exports = router
