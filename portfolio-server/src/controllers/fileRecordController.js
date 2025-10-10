// src/controllers/fileRecordController.js

const { UserFile } = require('../models')
const { deleteFile } = require('../utils/storageService')

class FileRecordController {
	/**
	 * Foydalanuvchining o'ziga tegishli fayllarini olish
	 */
	static async getMyFiles(req, res) {
		// authMiddleware orqali kelgan foydalanuvchi ma'lumotlari
		const { id: owner_id, userType: owner_type } = req.user
		const { imageType } = req.query // So'rovdan 'purpose' olinadi (masalan: ?purpose=photo)

		try {
			const whereClause = { owner_id, owner_type }
			if (imageType) {
				whereClause.imageType = imageType
			}

			const files = await UserFile.findAll({
				where: whereClause,
				order: [['createdAt', 'DESC']],
			})

			return res.status(200).json(files)
		} catch (error) {
			console.error('Foydalanuvchi fayllarini olishda xatolik:', error)
			return res.status(500).json({ error: 'Fayllarni olib bo‘lmadi' })
		}
	}

	/**
	 * Faylni S3'dan va ma'lumotlar bazasidan o'chirish
	 */
	static async deleteFileRecord(req, res) {
		const { fileId } = req.params
		const { id: owner_id, userType: owner_type } = req.user

		try {
			// Fayl joriy foydalanuvchiga tegishli ekanligini tekshirish
			const fileRecord = await UserFile.findOne({
				where: {
					id: fileId,
					owner_id: owner_id,
					owner_type: owner_type,
				},
			})

			if (!fileRecord) {
				return res
					.status(404)
					.json({
						error: "Fayl topilmadi yoki uni o'chirishga ruxsatingiz yo'q.",
					})
			}

			// 1. Faylni S3 omboridan o'chirish
			await deleteFile(fileRecord.file_url)

			// 2. Ma'lumotlar bazasidan yozuvni o'chirish
			await fileRecord.destroy()

			return res.status(200).json({ message: "Fayl muvaffaqiyatli o'chirildi" })
		} catch (error) {
			console.error("Faylni o'chirishda xatolik:", error)
			return res.status(500).json({ error: "Faylni o'chirib bo‘lmadi" })
		}
	}
}

module.exports = FileRecordController
