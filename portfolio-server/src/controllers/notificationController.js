const NotificationService = require('../services/notificationService')
const { getStudentById } = require('../services/studentService')
const { Op } = require('sequelize')


class NotificationController {
	static async createNotification(req, res) {
		try {
			const notification = await NotificationService.create(req.body)
			return res.status(201).json(notification)
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	static async getNotificationsByUserId(req, res) {
		try {
			const { id, userType } = req.user

			if (!id || !userType) {
				return res.status(400).json({ error: 'User ID and user type are required' })
			}

			let user_id = id
			let user_role = userType.toLowerCase() 

			if (user_role === 'student') {
				const student = await getStudentById(id)
				if (!student) {
					return res.status(404).json({ error: 'Student not found' })
				}
				user_id = student.student_id
			}

		
			let filter = { user_id, status: { [Op.ne]: 'read' } }

			
			if (user_role === 'admin') {
				filter = { user_role: 'admin', status: { [Op.ne]: 'read' } }
			} else if (user_role === 'student') {
				filter.user_role = 'student'
			} else if (user_role === 'staff') {
				filter.user_role = 'staff'
			}

			const notifications = await NotificationService.getByUserId(user_id, filter)

			return res.status(200).json(notifications)
		} catch (error) {
			console.error('Error fetching notifications:', error)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}

	static async updateNotification(req, res) {
		try {
			const { id } = req.params
			const notification = await NotificationService.update(id, req.body)
			return res.status(200).json(notification)
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	static async deleteNotification(req, res) {
		try {
			const { id } = req.params
			const notification = await NotificationService.delete(id)
			return res
				.status(200)
				.json({ message: 'Notification deleted', notification })
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	static async getAllNotifications(req, res) {
		try {
			const { userType } = req.user
			if(	userType !== 'Admin') {
				return res.status(403).json({ error: 'Permission denied. Only admin can get all notifications.' })
			}
			const notifications = await NotificationService.getAll()
			return res.status(200).json(notifications)
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	static async historyNotification(req, res) {
		try {
			const { id, userType } = req.user

			if (!id || !userType) {
				return res
					.status(400)
					.json({ error: 'User ID and user type are required' })
			}

			let user_id = id
			

			if (userType === 'Student') {
				const student = await getStudentById(id)
				if (!student) {
					return res.status(404).json({ error: 'Student not found' })
				}
				user_id = student.student_id
			}

			const notifications = await NotificationService.getByUserId(user_id, {
				status: 'read',
			})

			return res.status(200).json({
				message: notifications.length
					? 'History notifications found'
					: 'No history notifications found',
				notifications,
			})
		} catch (error) {
			console.error('Error fetching history notifications:', error)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}

	static async markNotificationAsRead(req, res) {
		try {
			const { notificationId } = req.params
			const { id, userType } = req.user

			if (!notificationId) {
				return res.status(400).json({ error: 'Notification ID is required' })
			}

			let user_id = id

			if (userType === 'Student') {
				const student = await getStudentById(id)
				if (!student) {
					return res.status(404).json({ error: 'Student not found' })
				}
				user_id = student.student_id
			}

			const updatedNotification = await NotificationService.markOneAsRead(
				notificationId,
				user_id
			)

			if (!updatedNotification) {
				return res
					.status(404)
					.json({ error: 'Notification not found or access denied' })
			}

			return res
				.status(200)
				.json({ message: 'Notification marked as read', updatedNotification })
		} catch (error) {
			console.error('Error marking notification as read:', error)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}

	static async markNotificationAsReadAll(req, res) {
        try {
            const { id, userType } = req.user

            if (!id || !userType) {
                return res
                    .status(400)
                    .json({ error: 'User ID and user type are required' })
            }

            let user_id = id

            if (userType === 'Student') {
                const student = await getStudentById(id)
                if (!student) {
                    return res.status(404).json({ error: 'Student not found' })
                }
                user_id = student.student_id
            }

            const updatedCount = await NotificationService.markAllAsRead(user_id, userType);

            return res.status(200).json({
                message: `${updatedCount} notification(s) marked as read for this user.`,
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = NotificationController
