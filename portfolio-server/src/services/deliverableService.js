// services/deliverableService.js

const { Draft } = require('../models')
const _ = require('lodash')
const { uploadFile, deleteFile } = require('../utils/storageService')
const generateUniqueFilename = require('../utils/uniqueFilename')

/**
 * Talaba uchun mavjud draftni topadi yoki yangisini yaratadi.
 * Bu funksiya `upsertDraft`'dan farqli o'laroq, `profile_data`'ni o'zgartirmaydi.
 * @param {string} studentId - Talabaning ID raqami.
 * @returns {Promise<Draft>} Topilgan yoki yaratilgan draft obyekti.
 */
const _getOrCreateDraft = async studentId => {
	if (!studentId) {
		throw { status: 400, message: 'Talaba ID raqami topilmadi.' }
	}
	let draft = await Draft.findOne({ where: { student_id: studentId } })
	if (!draft) {
		draft = await Draft.create({
			student_id: studentId,
			profile_data: {}, // Boshlang'ich bo'sh ma'lumot
			status: 'draft',
		})
	}
	return draft
}

class DeliverableService {
	/**
	 * Draft'ga yangi ish namunasini (bir nechta rasm bilan) qo'shadi.
	 */
	static async addDeliverable(studentId, deliverableData, files) {
		if (!files || files.length === 0) {
			throw {
				status: 400,
				message: 'Ish namunasi uchun kamida bitta rasm majburiy.',
			}
		}

		const uploadPromises = files.map(file => {
			const uniqueFilename = generateUniqueFilename(file.originalname)
			const s3Path = `students/${studentId}/deliverables/${uniqueFilename}`
			return uploadFile(file.buffer, s3Path)
		})

		const uploadResults = await Promise.all(uploadPromises)
		const imageUrls = uploadResults.map(result => result.Location)

		const newDeliverable = {
			id: Date.now(),
			...deliverableData,
			image_urls: imageUrls,
		}

		// >>> ASOSIY O'ZGARISH: Endi `upsertDraft` o'rniga yordamchi funksiyadan foydalanamiz <<<
		const draft = await _getOrCreateDraft(studentId)

		const currentDeliverables = draft.profile_data.deliverables || []
		const updatedDeliverables = [...currentDeliverables, newDeliverable]

		// `profile_data`'ni to'liq almashtirmasdan, faqat `deliverables` qismini yangilaymiz
		draft.set('profile_data.deliverables', updatedDeliverables)

		draft.changed_fields = _.union(draft.changed_fields || [], ['deliverables'])
		if (draft.status !== 'draft') draft.status = 'draft'

		await draft.save()
		return draft
	}

	/**
	 * Mavjud ish namunasini tahrirlaydi.
	 */
	static async updateDeliverable(studentId, deliverableId, updateData, files) {
		const draft = await _getOrCreateDraft(studentId)
		let deliverables = draft.profile_data.deliverables || []

		const deliverableIndex = deliverables.findIndex(d => d.id == deliverableId)
		if (deliverableIndex === -1) {
			throw { status: 404, message: 'Bu IDga ega ish namunasi topilmadi.' }
		}

		const deliverableToUpdate = deliverables[deliverableIndex]

		if (files && files.length > 0) {
			if (deliverableToUpdate.image_urls) {
				await Promise.all(
					deliverableToUpdate.image_urls.map(url => deleteFile(url))
				)
			}
			const uploadPromises = files.map(file => {
				const uniqueFilename = generateUniqueFilename(file.originalname)
				const s3Path = `students/${studentId}/deliverables/${uniqueFilename}`
				return uploadFile(file.buffer, s3Path)
			})
			const uploadResults = await Promise.all(uploadPromises)
			deliverableToUpdate.image_urls = uploadResults.map(
				result => result.Location
			)
		}

		Object.assign(deliverableToUpdate, updateData)
		deliverables[deliverableIndex] = deliverableToUpdate

		draft.set('profile_data.deliverables', deliverables)
		draft.changed_fields = _.union(draft.changed_fields || [], ['deliverables'])
		if (draft.status !== 'draft') draft.status = 'draft'

		await draft.save()
		return draft
	}

	/**
	 * Ish namunasini o'chiradi.
	 */
	static async removeDeliverable(studentId, deliverableId) {
		const draft = await _getOrCreateDraft(studentId)
		const deliverables = draft.profile_data.deliverables || []

		const deliverableToRemove = deliverables.find(d => d.id == deliverableId)
		if (!deliverableToRemove) {
			throw { status: 404, message: 'Bu IDga ega ish namunasi topilmadi.' }
		}

		if (deliverableToRemove.image_urls) {
			await Promise.all(
				deliverableToRemove.image_urls.map(url => deleteFile(url))
			)
		}

		const updatedDeliverables = deliverables.filter(d => d.id != deliverableId)

		draft.set('profile_data.deliverables', updatedDeliverables)
		draft.changed_fields = _.union(draft.changed_fields || [], ['deliverables'])
		if (draft.status !== 'draft') draft.status = 'draft'

		await draft.save()
		return draft
	}
}

module.exports = DeliverableService
