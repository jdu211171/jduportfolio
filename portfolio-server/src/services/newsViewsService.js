const { News, NewsViews } = require('../models')
const { Op } = require('sequelize')

class NewsViewsService {
    static async getUnreadNewsCount(userId, userRole) {
        try {
            console.log('Getting unread count for:', { userId, userRole })

            if (!News || !NewsViews) {
                console.error('Models not loaded properly:', { News: !!News, NewsViews: !!NewsViews })
                throw new Error('Models not available')
            }

            // Get all approved news
            const allNews = await News.findAll({
                where: { status: 'approved' },
                attributes: ['id']
            })

            console.log('Total approved news:', allNews.length)

            if (allNews.length === 0) {
                return 0
            }

            const newsIds = allNews.map(news => news.id)

            // Get viewed news by this user
            const viewedNews = await NewsViews.findAll({
                where: {
                    user_id: userId,
                    user_role: userRole,
                    news_id: { [Op.in]: newsIds },
                },
                attributes: ['news_id']
            })

            console.log('Viewed news:', viewedNews.length)

            const viewedNewsIds = viewedNews.map(view => view.news_id)
            const unreadCount = allNews.length - viewedNewsIds.length

            console.log('Unread count:', unreadCount)

            return unreadCount

        } catch (error) {
            console.error('Error getting unread news count:', error)
            throw error
        }
    }

    static async markAsViewed(newsId, userId, userRole) {
        try {
            console.log('Marking as viewed:', { newsId, userId, userRole })

            const [newsView, created] = await NewsViews.findOrCreate({
                where: {
                    news_id: parseInt(newsId),
                    user_id: userId,
                    user_role: userRole
                },
                defaults: {
                    news_id: parseInt(newsId),
                    user_id: userId,
                    user_role: userRole,
                    viewed_at: new Date()
                }
            })

            if (!created) {
                // Update viewed_at if already exists
                await newsView.update({ viewed_at: new Date() })
            }

            return { newsView, created }

        } catch (error) {
            console.error('Error marking news as viewed:', error)
            throw error
        }
    }

    static async getViewedNewsByUser(userId, userRole) {
        try {
            console.log('Getting viewed news for:', { userId, userRole })

            const viewedNews = await NewsViews.findAll({
                where: {
                    user_id: userId,
                    user_role: userRole
                },
                include: [{
                    model: News,
                    as: 'news',
                    where: { status: 'approved' }
                }],
                order: [['viewed_at', 'DESC']]
            })

            return viewedNews

        } catch (error) {
            console.error('Error getting viewed news:', error)
            throw error
        }
    }

    static async getNewsWithViewStatus(userId, userRole, filters = {}) {
        try {
            console.log('Getting news with view status for:', { userId, userRole, filters })

            // Build where clause for news
            let newsWhere = { status: 'approved' }
            
            if (filters.search) {
                newsWhere.title = { [require('sequelize').Op.iLike]: `%${filters.search}%` }
            }
            
            if (filters.type) {
                newsWhere.type = filters.type
            }

            // Get all approved news
            const news = await News.findAll({
                where: newsWhere,
                order: [['createdAt', 'DESC']],
            })

            console.log('Found news:', news.length)

            if (news.length === 0) {
                return []
            }

            const newsIds = news.map(n => n.id)

            // Get viewed news by this user
            const viewedNews = await NewsViews.findAll({
                where: {
                    user_id: userId,
                    user_role: userRole,
                    news_id: { [Op.in]: newsIds },
                },
                attributes: ['news_id']
            })

            const viewedNewsIds = new Set(viewedNews.map(view => view.news_id))

            // Add isViewed property to each news
            // Add isViewed and viewCount properties to each news
            const newsWithStatus = await Promise.all(news.map(async (newsItem) => {
            const newsData = newsItem.toJSON()
            newsData.isViewed = viewedNewsIds.has(newsData.id)

            // Add view count for this news
            newsData.viewCount = await NewsViews.count({
                where: { news_id: newsData.id }
            })

            return newsData
}))

            console.log('News with status:', newsWithStatus.length)

            return newsWithStatus

        } catch (error) {
            console.error('Error getting news with view status:', error)
            throw error
        }
    }

    // Returns unread count limited to provided newsIds
    static async getUnreadCountForNewsIds(userId, userRole, newsIds = []) {
        try {
            if (!Array.isArray(newsIds) || newsIds.length === 0) return 0

            const viewed = await NewsViews.findAll({
                where: {
                    user_id: String(userId),
                    user_role: userRole,
                    news_id: { [Op.in]: newsIds },
                },
                attributes: ['news_id'],
            })

            const viewedCount = viewed.length
            return Math.max(0, newsIds.length - viewedCount)
        } catch (error) {
            console.error('Error in getUnreadCountForNewsIds:', error)
            throw error
        }
    }
}

module.exports = NewsViewsService
