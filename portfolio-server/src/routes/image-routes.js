// routes/imageRoutes.js

const express = require('express')
const router = express.Router()
const multer = require('multer')
const imageController = require('../controllers/imageController')
const authMiddleware = require('../middlewares/auth-middleware') // Admin tekshiruvi uchun

// Fayl qabul qilish uchun multer'ni sozlash
// .array('images', 10) - 'images' nomli maydondan 10 tagacha fayl qabul qiladi
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

// POST /api/images - Bir yoki bir nechta rasmni yuklash
// Bu endpoint faqat Admin uchun ochiq bo'lishi mumkin
router.post(
	'/',
	authMiddleware,
	upload.array('images', 10),
	imageController.createImages
)

// GET /api/images/:type - Berilgan turdagi barcha rasmlarni olish
// Bu endpoint hammaga ochiq bo'lishi mumkin
router.get('/:type', imageController.getImagesByType)

// DELETE /api/images/:id - ID bo'yicha bitta rasmni o'chirish
// Bu endpoint faqat Admin uchun ochiq bo'lishi mumkin
router.delete('/:id', authMiddleware, imageController.deleteImage)

module.exports = router
