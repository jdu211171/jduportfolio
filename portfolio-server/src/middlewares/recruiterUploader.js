// middlewares/recruiterUploader.js
const multer = require('multer');
const path = require('path');

const recruiterUploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx/;
        const extension = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extension) {
            cb(null, true);
        } else {
            cb(new Error('Faqat PDF, Word, Excel, PowerPoint formatidagi fayllarga ruxsat etilgan!'), false);
        }
    }
});

module.exports = recruiterUploader;