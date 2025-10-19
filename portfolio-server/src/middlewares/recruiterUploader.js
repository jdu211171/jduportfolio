// middlewares/recruiterUploader.js
const multer = require('multer')
const path = require('path')

const recruiterUploader = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 20 * 1024 * 1024, // 20MB per file (quota check is in controller)
		files: 3, // Max 3 files at once
	},
	fileFilter: (req, file, cb) => {
		// Fix encoding issues with non-ASCII filenames
		// Multer receives filenames in Latin-1 encoding by default
		// We need to convert them to UTF-8 for proper handling of Japanese characters
		try {
			// Convert from Latin-1 (ISO-8859-1) to UTF-8
			const latin1Buffer = Buffer.from(file.originalname, 'latin1')
			const utf8String = latin1Buffer.toString('utf8')

			// Check if conversion resulted in valid UTF-8
			// If the string contains replacement characters, use original
			if (!utf8String.includes('�')) {
				file.originalname = utf8String
				console.log('Filename converted to UTF-8:', file.originalname)
			}
		} catch (e) {
			console.log('Filename encoding conversion failed, using original')
		}

		const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx/
		const extension = allowedTypes.test(path.extname(file.originalname).toLowerCase())
		if (extension) {
			cb(null, true)
		} else {
			cb(new Error('Faqat PDF, Word, Excel, PowerPoint formatidagi fayllarga ruxsat etilgan!'), false)
		}
	},
})

module.exports = recruiterUploader
