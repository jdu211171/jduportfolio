// controllers/recruiterFileController.js
const { UserFile } = require('../models')
const { uploadFile, deleteFile, getFile } = require('../utils/storageService')
const generateUniqueFilename = require('../utils/uniqueFilename')
const path = require('path')

exports.uploadRecruiterFiles = async (req, res) => {
	try {
		if (req.user.userType !== 'Recruiter') {
			return res
				.status(403)
				.json({ message: "Ruxsat yo'q. Faqat rekuterlar fayl yuklay oladi." })
		}

		const recruiterId = req.user.id
		const filesToUpload = req.files

		if (!filesToUpload || filesToUpload.length === 0) {
			return res.status(400).send('Yuklash uchun fayllar topilmadi.')
		}

		const existingFilesCount = await UserFile.count({
			where: { owner_id: recruiterId, owner_type: 'Recruiter' },
		})

		if (existingFilesCount + filesToUpload.length > 3) {
			return res.status(400).json({
				message: `Siz jami 3 tagacha fayl yuklay olasiz. Sizda allaqachon ${existingFilesCount} ta fayl mavjud.`,
			})
		}

		// Check total size quota (20MB)
		const MAX_TOTAL_SIZE = 20 * 1024 * 1024 // 20MB
		const existingFiles = await UserFile.findAll({
			where: { owner_id: recruiterId, owner_type: 'Recruiter' },
		})
		const existingTotalSize = existingFiles.reduce(
			(sum, file) => sum + (file.file_size || 0),
			0
		)
		const newFilesTotalSize = filesToUpload.reduce(
			(sum, file) => sum + file.size,
			0
		)

		if (existingTotalSize + newFilesTotalSize > MAX_TOTAL_SIZE) {
			const remainingSpace = MAX_TOTAL_SIZE - existingTotalSize
			const remainingMB = (remainingSpace / 1024 / 1024).toFixed(1)
			return res.status(400).json({
				message: `Jami hajm 20MB dan oshmasligi kerak. Mavjud bo'sh joy: ${remainingMB}MB`,
			})
		}

		const uploadedFileRecords = []
		for (const file of filesToUpload) {
			console.log('Processing file:', {
				originalname: file.originalname,
				originalnameHex: Buffer.from(file.originalname).toString('hex'),
				mimetype: file.mimetype,
				size: file.size,
				bufferLength: file.buffer ? file.buffer.length : 0,
			})

			const fileBuffer = file.buffer
			const uniqueFilename = generateUniqueFilename(file.originalname)
			const objectName = `Recruiter/${recruiterId}/documents/${uniqueFilename}`
			const uploadedS3Info = await uploadFile(fileBuffer, objectName)

			const newFileRecord = await UserFile.create({
				file_url: uploadedS3Info.Location,
				object_name: objectName,
				original_filename: file.originalname,
				imageType: 'recruiter_document',
				owner_id: recruiterId,
				owner_type: 'Recruiter',
				file_size: file.size,
			})
			uploadedFileRecords.push(newFileRecord)
		}

		res.status(201).json(uploadedFileRecords)
	} catch (error) {
		console.error('Rekruter faylini yuklashda xatolik:', error)
		res.status(500).send('Fayllarni qayta ishlashda server xatoligi yuz berdi.')
	}
}
exports.getRecruiterFiles = async (req, res) => {
	try {
		// Allow Admin, Staff, Student to view recruiter files
		const allowedRoles = ['Admin', 'Staff', 'Student', 'Recruiter']
		if (!allowedRoles.includes(req.user.userType)) {
			return res.status(403).json({ message: "Ruxsat yo'q." })
		}

		// For non-recruiters, get recruiterId from query params
		let recruiterId
		if (req.user.userType === 'Recruiter') {
			recruiterId = req.user.id
		} else {
			recruiterId = req.query.recruiterId
			if (!recruiterId) {
				return res.status(400).json({ message: 'recruiterId parametri kerak.' })
			}
		}

		const files = await UserFile.findAll({
			where: { owner_id: recruiterId, owner_type: 'Recruiter' },
			order: [['createdAt', 'DESC']],
		})

		// Calculate total size
		const totalSize = files.reduce(
			(sum, file) => sum + (file.file_size || 0),
			0
		)

		res.status(200).json({
			files,
			totalSize,
			maxSize: 20 * 1024 * 1024, // 20MB
		})
	} catch (error) {
		console.error('Rekruter fayllarini olishda xatolik:', error)
		res.status(500).json({ error: 'Fayllarni olib bo‘lmadi' })
	}
}
exports.updateRecruiterFile = async (req, res) => {
	try {
		if (req.user.userType !== 'Recruiter') {
			return res.status(403).json({ message: "Ruxsat yo'q." })
		}

		const { id: fileId } = req.params
		const recruiterId = req.user.id
		const newFile = req.file

		if (!newFile) {
			return res.status(400).send('Yangilash uchun fayl topilmadi.')
		}

		const oldFileRecord = await UserFile.findOne({
			where: { id: fileId, owner_id: recruiterId, owner_type: 'Recruiter' },
		})
		if (!oldFileRecord) {
			return res.status(404).json({
				error: "Fayl topilmadi yoki uni yangilashga ruxsatingiz yo'q.",
			})
		}

		// 1. Eski faylni ombordan o'chiramiz
		await deleteFile(oldFileRecord.object_name)

		// 2. Yangi faylni yuklaymiz
		const fileBuffer = newFile.buffer
		const uniqueFilename = generateUniqueFilename(newFile.originalname)
		const objectName = `Recruiter/${recruiterId}/documents/${uniqueFilename}`
		const uploadedS3Info = await uploadFile(fileBuffer, objectName)

		// 3. Bazadagi yozuvni yangilaymiz
		oldFileRecord.file_url = uploadedS3Info.Location
		oldFileRecord.object_name = objectName
		oldFileRecord.original_filename = newFile.originalname
		oldFileRecord.file_size = newFile.size
		await oldFileRecord.save()

		res.status(200).json(oldFileRecord)
	} catch (error) {
		console.error('Rekruter faylini yangilashda xatolik:', error)
		res.status(500).json({ error: 'Faylni yangilab bo‘lmadi' })
	}
}
exports.deleteRecruiterFile = async (req, res) => {
	try {
		if (req.user.userType !== 'Recruiter') {
			return res.status(403).json({ message: "Ruxsat yo'q." })
		}

		const { id: fileId } = req.params
		const recruiterId = req.user.id

		const fileRecord = await UserFile.findOne({
			where: { id: fileId, owner_id: recruiterId, owner_type: 'Recruiter' },
		})
		if (!fileRecord) {
			return res.status(404).json({
				error: "Fayl topilmadi yoki uni o'chirishga ruxsatingiz yo'q.",
			})
		}

		// Delete from database first (faster response)
		await fileRecord.destroy()

		// Send success response immediately
		res.status(200).json({ message: "Fayl muvaffaqiyatli o'chirildi." })

		// Delete from storage asynchronously (after response)
		deleteFile(fileRecord.object_name).catch(err => {
			console.error('Storage deletion error (non-blocking):', err)
		})
	} catch (error) {
		console.error("Rekruter faylini o'chirishda xatolik:", error)
		res.status(500).json({ error: "Faylni o'chirib bo'lmadi" })
	}
}
exports.downloadRecruiterFile = async (req, res) => {
	try {
		// Allow Admin, Staff, Student to download recruiter files
		const allowedRoles = ['Admin', 'Staff', 'Student', 'Recruiter']
		if (!allowedRoles.includes(req.user.userType)) {
			return res.status(403).json({ message: "Ruxsat yo'q." })
		}

		const { id: fileId } = req.params

		// For recruiters, verify they own the file
		// For others, just check if file exists
		let fileRecord
		if (req.user.userType === 'Recruiter') {
			fileRecord = await UserFile.findOne({
				where: { id: fileId, owner_id: req.user.id, owner_type: 'Recruiter' },
			})
		} else {
			fileRecord = await UserFile.findOne({
				where: { id: fileId, owner_type: 'Recruiter' },
			})
		}

		if (!fileRecord) {
			return res.status(404).json({
				error: "Fayl topilmadi yoki uni yuklab olishga ruxsatingiz yo'q.",
			})
		}

		// Properly encode filename for Unicode support (RFC 5987)
		const encodedFilename = encodeURIComponent(fileRecord.original_filename)
		const asciiFilename = fileRecord.original_filename.replace(
			/[^\x00-\x7F]/g,
			'_'
		)

		// Set Content-Disposition with both ASCII fallback and UTF-8 encoded name
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`
		)
		res.redirect(fileRecord.file_url)
	} catch (error) {
		console.error('Rekruter faylini yuklab olishda xatolik:', error)
		res.status(500).json({ error: "Faylni yuklab bo'lmadi" })
	}
}
