// routes/newsRoutes.js

const express = require('express')
const router = express.Router()
const NewsController = require('../controllers/newsController')
const authMiddleware = require('../middlewares/auth-middleware')
// const roleMiddleware = require('../middlewares/role-middleware');
const multer = require('multer')

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

router.get('/', authMiddleware, NewsController.getAll)
router.post('/', authMiddleware, upload.single('image'), NewsController.create)
router.put(
	'/:id',
	authMiddleware,
	upload.single('image'),
	NewsController.update
)
router.delete('/:id', authMiddleware, NewsController.delete)
router.get(
	'/with-unread-count',
	authMiddleware,
	NewsController.getAllWithUnreadCount
)

router.put('/:id/moderate', authMiddleware, NewsController.moderate)

module.exports = router
