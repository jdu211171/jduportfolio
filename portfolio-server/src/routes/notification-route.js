const express = require('express')
const NotificationController = require('../controllers/notificationController')
const router = express.Router()

/**
 * @swagger
 * tags:
 *   - name: Notification
 *     description: Manage notifications for different user roles
 */

/**
 * @swagger
 * /api/notification:
 *   post:
 *     tags: [Notification]
 *     summary: Create a new notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               user_role:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully
 *   get:
 *     tags: [Notification]
 *     summary: Retrieve all notifications (admin-only)
 *     responses:
 *       200:
 *         description: Returns a list of all notifications
 */

router.post('/', NotificationController.createNotification)

/**
 * @swagger
 * /api/notification/{id}:
 *   put:
 *     tags: [Notification]
 *     summary: Update a notification by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *   delete:
 *     tags: [Notification]
 *     summary: Delete a notification by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 */

router.put('/:id', NotificationController.updateNotification)

router.delete('/:id', NotificationController.deleteNotification)

/**
 * @swagger
 * /api/notification:
 *   get:
 *     tags: [Notification]
 *     summary: Retrieve all notifications (admin-only)
 *     responses:
 *       200:
 *         description: Returns a list of all notifications
 */

router.get('/', NotificationController.getAllNotifications)

/**
 * @swagger
 * /api/notification/user:
 *   get:
 *     tags: [Notification]
 *     summary: Get notifications by user info
 *     responses:
 *       200:
 *         description: Returns notifications for the current user
 */

router.get('/user', NotificationController.getNotificationsByUserId)

/**
 * @swagger
 * /api/notification/{notificationId}/read:
 *   patch:
 *     tags: [Notification]
 *     summary: Mark a notification as read
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */

router.patch(
	'/:notificationId/read',
	NotificationController.markNotificationAsRead
)

/**
 * @swagger
 * /api/notification/read-all:
 *   patch:
 *     tags: [Notification]
 *     summary: Mark all notifications as read for the current user
 *     responses:
 *       200:
 *         description: Notifications marked as read
 */
router.patch('/read-all', NotificationController.markNotificationAsReadAll)

/**
 * @swagger
 * /api/notification/history:
 *   get:
 *     tags: [Notification]
 *     summary: Retrieve all read (history) notifications for the current user
 *     responses:
 *       200:
 *         description: Returns read notifications
 */
router.get('/history', NotificationController.historyNotification)

module.exports = router
