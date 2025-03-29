const express = require('express');
const imageController = require('../controllers/imageController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
// Rasmni yuklash (Create)
router.post('/images', imageController.createImage);

// Barcha rasmlarni olish (Read)
router.get('/images', imageController.getAllImages);

// ID bo'yicha rasmni olish (Read)
router.get('/images/:id', imageController.getImageById);

// Rasmni yangilash (Update)
router.put('/images/:id', imageController.updateImage);

// Rasmni o'chirish (Delete)
router.delete('/images/:id', imageController.deleteImage);

module.exports = router;