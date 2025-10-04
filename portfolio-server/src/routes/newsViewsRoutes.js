const express = require('express')
const NewsViewsController = require('../controllers/newsViewsController')
const authMiddleware = require('../middlewares/auth-middleware')
const router = express.Router()

/**
 * @swagger
 * tags:
 *   - name: NewsViews
 *     description: Track and manage news reading status
 */

/**
 * @swagger
 * /api/news-views/{newsId}/read:
 *   post:
 *     tags: [NewsViews]
 *     summary: Mark a news article as read
 *     parameters:
 *       - in: path
 *         name: newsId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: News marked as read successfully
 */
router.post('/:newsId/read', authMiddleware, NewsViewsController.markNewsAsRead)

/**
 * @swagger
 * /api/news-views/unread-count:
 *   get:
 *     tags: [NewsViews]
 *     summary: Get unread news count for current user
 *     responses:
 *       200:
 *         description: Returns unread news count
 */
router.get('/unread-count', authMiddleware, NewsViewsController.getUnreadNewsCount)

/**
 * @swagger
 * /api/news-views/viewed:
 *   get:
 *     tags: [NewsViews]
 *     summary: Get all viewed news for current user
 *     responses:
 *       200:
 *         description: Returns list of viewed news
 */
router.get('/viewed', authMiddleware, NewsViewsController.getViewedNews)

/**
 * @swagger
 * /api/news-views/with-status:
 *   get:
 *     tags: [NewsViews]
 *     summary: Get all news with view status for current user
 *     responses:
 *       200:
 *         description: Returns news with isViewed flag
 */
router.get('/with-status', authMiddleware, NewsViewsController.getNewsWithViewStatus)

module.exports = router