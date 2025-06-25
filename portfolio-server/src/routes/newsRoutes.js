// routes/newsRoutes.js

const express = require('express');
const router = express.Router();
const NewsController = require('../controllers/newsController');
const authMiddleware = require('../middlewares/auth-middleware');
// const roleMiddleware = require('../middlewares/role-middleware');
const multer = require('multer');

// Multer'ni sozlaymiz. Har bir yangilik uchun bitta rasm yuklanadi.
const upload = multer({
storage: multer.memoryStorage(),
limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET /api/news - Barcha (tasdiqlangan) yangiliklarni olish
router.get('/', authMiddleware, NewsController.getAll);

// \>\>\> O'ZGARISH: Yangilik yaratish endpoint'iga `upload.single('image')` qo'shildi \<\<\<
// Frontend 'image' nomli maydonda rasm jo'natishi kerak.
router.post('/', authMiddleware, upload.single('image'), NewsController.create);

// Yangilikni tahrirlash (bu yerda ham rasm yangilanishi mumkin, shuning uchun multer qo'shish mumkin)
router.put('/:id', authMiddleware, upload.single('image'), NewsController.update);

// Yangilikni o'chirish
router.delete('/:id', authMiddleware, NewsController.delete);

// Moderatsiya
router.put(
'/:id/moderate',
authMiddleware,
NewsController.moderate
);

module.exports = router;