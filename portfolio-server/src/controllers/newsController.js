const NewsService = require('../services/newsService')

class NewsController {
	static async create(req, res, next) {
		try {
			// Servisga req.body (matnli ma'lumotlar) va req.file (rasm) uzatiladi
			const newNews = await NewsService.createNews(req.body, req.file, req.user)
			res.status(201).json(newNews)
		} catch (err) {
			next(err)
		}
	}
	static async getAll(req, res, next) {
		try {
			const newsList = await NewsService.getNews(req.query, req.user)
			res.status(200).json(newsList)
		} catch (err) {
			next(err)
		}
	}
	static async update(req, res, next) {
		try {
			const updatedNews = await NewsService.updateNews(
				req.params.id,
				req.body,
				req.file,
				req.user
			)
			res.status(200).json(updatedNews)
		} catch (err) {
			next(err)
		}
	}
	static async delete(req, res, next) {
		try {
			const result = await NewsService.deleteNews(req.params.id, req.user)
			res.status(200).json(result)
		} catch (err) {
			next(err)
		}
	}
	static async moderate(req, res, next) {
		try {
			const { action, reason } = req.body
			if (!['approved', 'rejected'].includes(action)) {
				return res
					.status(400)
					.json({ message: "Action must be 'approved' or 'rejected'." })
			}
			if (action === 'rejected' && !reason) {
				return res
					.status(400)
					.json({ message: 'Rad etish sababi ko‘rsatilishi shart.' })
			}
			const updatedNews = await NewsService.moderateNews(
				req.params.id,
				action,
				reason,
				req.user
			)
			res.status(200).json(updatedNews)
		} catch (err) {
			next(err)
		}
	}

	static async getAllWithUnreadCount(req, res, next) {
		try {
			const { user } = req
			const filters = req.query

			const result = await NewsService.getNewsWithUnreadCount(filters, user)

			return res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}
}
module.exports = NewsController
