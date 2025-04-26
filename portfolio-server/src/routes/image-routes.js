const express = require('express');
const multer = require('multer');
const { Image } = require('../models');
const { uploadImage } = require('../services/s3');
const authMiddleware = require('../middlewares/auth-middleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Faqat rasm fayllari ruxsat etiladi'));
    }
    cb(null, true);
  },
});

// Rasmni yangilash (Admin uchun)
router.post('/admin/update-image',authMiddleware,  upload.single('image'), async (req, res) => {
  try {

    console.log('tekshiruvvvvvvvvvvv', req.user);
    // Admin tekshiruvi
    if (req.user.userType !== 'Admin') {
      return res.status(403).json({ message: 'Faqat adminlar uchun' });
    }

    const { type } = req.body; // 'login_page' yoki 'home_page'
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Rasm fayli yuklanmadi' });
    }

    if (!['login_page', 'home_page'].includes(type)) {
      return res.status(400).json({ message: 'Noto\'g\'ri rasm turi' });
    }

    const key = `${type}_image.jpg`;
    const imageUrl = await uploadImage(file.buffer, key, file.mimetype);

    let image = await Image.findOne({ where: { type } });
    if (!image) {
      image = await Image.create({
        type,
        image_url: imageUrl,
        image_version: 1,
      });
    } else {
      await image.update({ image_version: image.image_version + 1 });
    }

    res.json({
      success: true,
      image: {
        type: image.type,
        image_url: `${image.image_url}?v=${image.image_version}`,
        image_version: image.image_version,
      },
    });
  } catch (error) {
    console.error('Rasm yuklashda xatolik:', error);
    res.status(500).json({ message: error.message || 'Rasm yuklashda xatolik yuz berdi' });
  }
});

// Rasmlarni olish
router.get('/images/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const image = await Image.findOne({ where: { type } });
    if (!image) {
      return res.status(404).json({ message: 'Rasm topilmadi' });
    }
    res.json({ image_url: `${image.image_url}?v=${image.image_version}` });
  } catch (error) {
    console.error('Rasm olishda xatolik:', error);
    res.status(500).json({ message: 'Rasm olishda xatolik yuz berdi' });
  }
});

module.exports = router;