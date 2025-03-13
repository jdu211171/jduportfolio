const express = require('express');
const NotificationController = require('../controllers/notificationController');
const router = express.Router();

router.post('/', NotificationController.createNotification);

// router.get('/:id', NotificationController.getNotificationById);

router.put('/:id', NotificationController.updateNotification);

router.delete('/:id', NotificationController.deleteNotification);

router.get('/', NotificationController.getAllNotifications);

router.get('/user', NotificationController.getNotificationsByUserId);

router.patch('/:notificationId/read', NotificationController.markNotificationAsRead);

router.get('/history', NotificationController.historyNotification);



module.exports = router;
