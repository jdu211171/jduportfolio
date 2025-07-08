// controllers/imageController.js

const { uploadFile, deleteFile } = require('../utils/storageService');
const generateUniqueFilename = require('../utils/uniqueFilename');
const { Image } = require('../models');


exports.createImages = async (req, res) => {
    try {
        // req.files multer.array() orqali keladi
        if (!req.user || req.user.userType !== 'Admin') {
            return res.status(403).json({ message: 'Ruxsat yo\'q. Faqat administratorlar bu amalni bajara oladi.' });
        }

        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'Yuklash uchun rasm fayllari topilmadi.' });
        }

        const { type = 'general' } = req.body;
        const uploadedImages = [];

        for (const file of files) {
            const uniqueFilename = generateUniqueFilename(file.originalname);
            // Faylni S3 omboriga 'images/{type}/...' papkasiga saqlaymiz
            const result = await uploadFile(file.buffer, `images/${type}/${uniqueFilename}`);
            
            // Har bir rasm uchun ma'lumotlar bazasida yangi yozuv yaratamiz
            const newImage = await Image.create({
                type: type,
                image_url: result.Location,
            });
            uploadedImages.push(newImage);
        }

        res.status(201).json({ 
            message: `${uploadedImages.length} ta rasm muvaffaqiyatli yuklandi.`,
            images: uploadedImages 
        });

    } catch (error) {
        console.error('Rasmlarni yuklashda xatolik:', error);
        res.status(500).json({ message: 'Server xatoligi: rasmlarni yuklab bo‘lmadi.' });
    }
};

exports.getImagesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const images = await Image.findAll({ 
            where: { type },
            order: [['createdAt', 'ASC']] 
        });
        
        if (!images || images.length === 0) {
            return res.status(404).json({ message: `'${type}' turidagi rasmlar topilmadi.` });
        }

        res.status(200).json(images);

    } catch (error) {
        console.error('Rasmlarni olishda xatolik:', error);
        res.status(500).json({ message: 'Server xatoligi: rasmlarni olib bo‘lmadi.' });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        if (!req.user || req.user.userType !== 'Admin') {
            return res.status(403).json({ message: 'Ruxsat yo\'q. Faqat administratorlar bu amalni bajara oladi.' });
        }

        const { id } = req.params;
        const image = await Image.findByPk(id);

        if (!image) {
            return res.status(404).json({ message: 'Bu IDga ega rasm topilmadi.' });
        }

        // 1. Faylni S3 omboridan o'chirish
        await deleteFile(image.image_url);

        // 2. Yozuvni ma'lumotlar bazasidan o'chirish
        await image.destroy();

        res.status(200).json({ message: `ID:${id} bo'lgan rasm muvaffaqiyatli o'chirildi.` });

    } catch (error) {
        console.error('Rasmni o\'chirishda xatolik:', error);
        res.status(500).json({ message: 'Server xatoligi: rasmni o\'chirib bo‘lmadi.' });
    }
};