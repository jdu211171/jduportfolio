const { News, Staff, Recruiter, Admin } = require('../models');
const { Op } = require('sequelize');
const { uploadFile, deleteFile } = require('../utils/storageService');
const generateUniqueFilename = require('../utils/uniqueFilename');

class NewsService {

    // createNews, updateNews, deleteNews metodlari o'zgarishsiz qoladi...

    /**
     * Yangilik yaratish. Ruxsatlarni tekshiradi va statusni avtomatik belgilaydi.
     */
    static async createNews(newsData, file, user) {
        if (!file) {
            throw { status: 400, message: 'Yangilik uchun rasm majburiy.' };
        }
        const uniqueFilename = generateUniqueFilename(file.originalname);
        const s3Path = `news/${user.userType.toLowerCase()}/${uniqueFilename}`;
        const uploadResult = await uploadFile(file.buffer, s3Path);
        const dataToCreate = { ...newsData };
        dataToCreate.image_url = uploadResult.Location;
        dataToCreate.authorId = user.id;
        dataToCreate.authorType = user.userType;
        if (user.userType === 'Admin' || user.userType === 'Staff') {
            dataToCreate.type = 'university';
            dataToCreate.status = 'approved';
        } else if (user.userType === 'Recruiter') {
            dataToCreate.type = 'company';
            dataToCreate.status = 'pending';
        } else {
            throw { status: 403, message: 'Yangilik yaratish uchun ruxsat yo‘q.' };
        }
        if (typeof dataToCreate.hashtags === 'string') {
            try {
                dataToCreate.hashtags = JSON.parse(dataToCreate.hashtags);
            } catch (e) {
                dataToCreate.hashtags = dataToCreate.hashtags.split(',').map(tag => tag.trim());
            }
        }
        return await News.create(dataToCreate);
    }

    /**
     * Yangilikni tahrirlash. Faqat muallif yoki Admin/Staff tahrirlay oladi.
     */
    static async updateNews(newsId, updateData, file, user) {
        const news = await News.findByPk(newsId);
        if (!news) throw { status: 404, message: 'Yangilik topilmadi.' };
        const isOwner = (news.authorId === user.id && news.authorType === user.userType);
        const isAdminOrStaff = (user.userType === 'Admin' || user.userType === 'Staff');
        if (!isOwner && !isAdminOrStaff) {
            throw { status: 403, message: 'Bu amal uchun sizda ruxsat yo\'q.' };
        }
        if (file) {
            await deleteFile(news.image_url);
            const uniqueFilename = generateUniqueFilename(file.originalname);
            const s3Path = `news/${user.userType.toLowerCase()}/${uniqueFilename}`;
            const uploadResult = await uploadFile(file.buffer, s3Path);
            updateData.image_url = uploadResult.Location;
        }
        if (isOwner && user.userType === 'Recruiter' && news.status === 'rejected') {
            updateData.status = 'pending';
            updateData.rejection_reason = null;
            updateData.moderatorId = null;
            updateData.moderatorType = null;
        }
        if (!isOwner && isAdminOrStaff) {
            delete updateData.status;
        }
        await news.update(updateData);
        return news;
    }

    /**
     * Yangilikni o'chirish. Faqat muallif yoki Admin/Staff o'chira oladi.
     */
    static async deleteNews(newsId, user) {
        const news = await News.findByPk(newsId);
        if (!news) throw { status: 404, message: 'Yangilik topilmadi.' };
        const isOwner = (news.authorId === user.id && news.authorType === user.userType);
        const isAdminOrStaff = (user.userType === 'Admin' || user.userType === 'Staff');
        if (!isOwner && !isAdminOrStaff) {
            throw { status: 403, message: 'Bu amal uchun sizda ruxsat yo\'q.' };
        }
        await deleteFile(news.image_url);
        await news.destroy();
        return { message: 'Yangilik muvaffaqiyatli o\'chirildi.' };
    }
    
    /**
     * Yangiliklarni olish (QIDIRUV FUNKSIYASI BILAN).
     */
    static async getNews(filters, user) {
        const { type, status, search } = filters;
        
        const finalConditions = [];

        // 1. ROLGA QARAB ASOSIY KO'RISH HUQUQLARINI O'RNATAMIZ
        if (user.userType === 'Admin' || user.userType === 'Staff') {
            if (status) finalConditions.push({ status: status });
        } else if (user.userType === 'Recruiter') {
            finalConditions.push({
                [Op.or]: [
                    { status: 'approved' },
                    {
                        authorId: user.id,
                        authorType: 'Recruiter',
                        status: { [Op.in]: ['pending', 'rejected'] }
                    }
                ]
            });
        } else { // Student va boshqa barcha holatlar
            finalConditions.push({ status: 'approved' });
        }

        // 2. QO'SHIMCHA FILTRLARNI `finalConditions`ga QO'SHAMIZ
        if (type) {
            finalConditions.push({ type: type });
        }

        if (search) {
            const searchQuery = { [Op.iLike]: `%${search}%` };
            const searchOrConditions = [
                { title: searchQuery },
                { hashtags: { [Op.contains]: [search] } }
            ];
            if (user.userType !== 'Student') {
                 searchOrConditions.push({ '$authorRecruiter.company_name$': searchQuery });
            }
            finalConditions.push({ [Op.or]: searchOrConditions });
        }
        
        // 3. YAKUNIY SO'ROVNI YUBORAMIZ
        const newsListWithIncludes = await News.findAll({
            where: {
                [Op.and]: finalConditions
            },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Admin, as: 'authorAdmin', attributes: ['id', 'first_name', 'last_name'], required: false },
                { model: Staff, as: 'authorStaff', attributes: ['id', 'first_name', 'last_name'], required: false },
                { model: Recruiter, as: 'authorRecruiter', attributes: ['id', 'company_name'], required: false },
                { model: Admin, as: 'moderatorAdmin', attributes: ['id', 'first_name', 'last_name'], required: false },
                { model: Staff, as: 'moderatorStaff', attributes: ['id', 'first_name', 'last_name'], required: false }
            ]
        });
        
        // 4. JAVOBNI TOZALAB QAYTARAMIZ
        const cleanNewsList = newsListWithIncludes.map(newsItem => {
            const newsJson = newsItem.toJSON();
            let author = null;
            if (newsJson.authorType === 'Admin' && newsJson.authorAdmin) author = newsJson.authorAdmin;
            else if (newsJson.authorType === 'Staff' && newsJson.authorStaff) author = newsJson.authorStaff;
            else if (newsJson.authorType === 'Recruiter' && newsJson.authorRecruiter) author = newsJson.authorRecruiter;
            let moderator = null;
            if (newsJson.moderatorType === 'Admin' && newsJson.moderatorAdmin) moderator = newsJson.moderatorAdmin;
            else if (newsJson.moderatorType === 'Staff' && newsJson.moderatorStaff) moderator = newsJson.moderatorStaff;
            delete newsJson.authorAdmin;
            delete newsJson.authorStaff;
            delete newsJson.authorRecruiter;
            delete newsJson.moderatorAdmin;
            delete newsJson.moderatorStaff;
            newsJson.author = author;
            newsJson.moderator = moderator;
            return newsJson;
        });
        
        return cleanNewsList;
    }


    /**
     * Yangilikni tasdiqlash yoki rad etish (faqat Admin/Staff uchun).
     */
    static async moderateNews(newsId, action, reason, moderator) {
        if (moderator.userType !== 'Admin' && moderator.userType !== 'Staff') {
            throw { status: 403, message: 'Sizda bu amalni bajarish uchun ruxsat yo‘q.' };
        }
        const news = await News.findByPk(newsId);
        if (!news) throw { status: 404, message: 'Yangilik topilmadi.' };
        if (news.type !== 'company') throw { status: 400, message: 'Faqat kompaniya yangiliklarini moderatsiya qilish mumkin.' };
        news.status = action;
        news.moderatorId = moderator.id;
        news.moderatorType = moderator.userType;
        news.rejection_reason = action === 'rejected' ? reason : null;
        await news.save();
        return news;
    }
}

module.exports = NewsService;