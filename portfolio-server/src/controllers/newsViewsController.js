const NewsViewsService = require('../services/newsViewsService')
const { getStudentById } = require('../services/studentService')

class NewsViewsController {
	static async getUnreadNewsCount(req, res) {
		try {
			const { id, userType } = req.user

			if (!id || !userType) {
				return res.status(400).json({ error: 'User ID and user type are required' })
			}

			let userId = id
			const userRole = userType.toLowerCase()

			console.log('Original user:', { id, userType })

			// Map Student to business ID (student_id) to keep parity with notifications
			if (userRole === 'student') {
				const student = await getStudentById(id)
				if (!student) {
					return res.status(404).json({ error: 'Student not found' })
				}
				userId = student.student_id
			} else {
				userId = String(id)
			}

			console.log('Processed user:', { userId, userRole })

			const unreadCount = await NewsViewsService.getUnreadNewsCount(userId, userRole)

			return res.status(200).json({
				unreadCount,
				userId: userId,
				userRole: userRole,
			})
		} catch (error) {
			console.error('Error getting unread news count:', error)
			return res.status(500).json({
				error: 'Internal Server Error',
				details: error.message,
			})
		}
	}

	static async markNewsAsRead(req, res) {
		try {
			const { newsId } = req.params
			const { id, userType } = req.user

			if (!newsId) {
				return res.status(400).json({ error: 'News ID is required' })
			}

			if (!id || !userType) {
				return res.status(400).json({ error: 'User ID and user type are required' })
			}

			let userId = String(id)
			const userRole = userType.toLowerCase()

			// Map Student to business ID
			if (userRole === 'student') {
				const student = await getStudentById(id)
				if (!student) {
					return res.status(404).json({ error: 'Student not found' })
				}
				userId = String(student.student_id)
			}

			const { newsView, created } = await NewsViewsService.markAsViewed(newsId, userId, userRole)

			const message = created ? 'News marked as read' : 'News view updated'

			return res.status(200).json({
				message,
				newsView,
				alreadyViewed: !created,
			})
		} catch (error) {
			console.error('Error marking news as read:', error)
			return res.status(500).json({
				error: 'Internal Server Error',
				details: error.message,
			})
		}
	}

	static async getViewedNews(req, res) {
		try {
			const { id, userType } = req.user

			if (!id || !userType) {
				return res.status(400).json({ error: 'User ID and user type are required' })
			}

			let userId = String(id)
			const userRole = userType.toLowerCase()

			// Map Student to business ID
			if (userRole === 'student') {
				const student = await getStudentById(id)
				if (!student) {
					return res.status(404).json({ error: 'Student not found' })
				}
				userId = String(student.student_id)
			}

			const viewedNews = await NewsViewsService.getViewedNewsByUser(userId, userRole)

			return res.status(200).json({
				viewedNews,
				count: viewedNews.length,
			})
		} catch (error) {
			console.error('Error getting viewed news:', error)
			return res.status(500).json({
				error: 'Internal Server Error',
				details: error.message,
			})
		}
	}

	static async getNewsWithViewStatus(req, res) {
		try {
			const { id, userType } = req.user

			if (!id || !userType) {
				return res.status(400).json({ error: 'User ID and user type are required' })
			}

			let userId = String(id)
			const userRole = userType.toLowerCase()

			// Map Student to business ID
			if (userRole === 'student') {
				const student = await getStudentById(id)
				if (!student) {
					return res.status(404).json({ error: 'Student not found' })
				}
				userId = String(student.student_id)
			}

			// Get filters from query params
			const filters = {}
			if (req.query.search) filters.search = req.query.search
			if (req.query.type) filters.type = req.query.type

			const newsWithStatus = await NewsViewsService.getNewsWithViewStatus(userId, userRole, filters)

			const unreadCount = newsWithStatus.filter(news => !news.isViewed).length

			return res.status(200).json({
				news: newsWithStatus,
				unreadCount,
				totalCount: newsWithStatus.length,
			})
		} catch (error) {
			console.error('Error getting news with view status:', error)
			return res.status(500).json({
				error: 'Internal Server Error',
				details: error.message,
			})
		}
	}

	static async markAllAsRead(req, res) {
		try {
			const { id, userType } = req.user

			if (!id || !userType) {
				return res.status(400).json({ error: 'User ID and user type are required' })
			}

			let userId = String(id)
			const userRole = userType.toLowerCase()

			// Map Student to business ID
			if (userRole === 'student') {
				const student = await getStudentById(id)
				if (!student) {
					return res.status(404).json({ error: 'Student not found' })
				}
				userId = String(student.student_id)
			}

			const result = await NewsViewsService.markAllAsViewed(userId, userRole)

			return res.status(200).json({
				message: 'All news marked as read',
				...result,
			})
		} catch (error) {
			console.error('Error marking all news as read:', error)
			return res.status(500).json({
				error: 'Internal Server Error',
				details: error.message,
			})
		}
	}
}

module.exports = NewsViewsController
