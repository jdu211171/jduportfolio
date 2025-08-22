// controllers/deliverableController.js

const DeliverableService = require('../services/deliverableService')
const { Student } = require('../models')

class DeliverableController {
	static async add(req, res, next) {
		try {
			if (req.user.userType.toLowerCase() !== 'student') {
				return res.status(403).json({
					error: "Ruxsat yo'q. Faqat talabalar bu amalni bajara oladi.",
				})
			}

			// >>> TUZATISH: Avval studentni to'liq topib olamiz <<<
			const student = await Student.findByPk(req.user.id)
			if (!student) {
				return res
					.status(404)
					.json({ error: "Foydalanuvchi ma'lumotlari topilmadi." })
			}

			const updatedDraft = await DeliverableService.addDeliverable(
				student.student_id, // Endi bu yerda aniq qiymat bor (masalan, "13259089")
				req.body,
				req.files
			)
			res.status(201).json(updatedDraft)
		} catch (err) {
			next(err)
		}
	}

	static async update(req, res, next) {
		try {
			if (req.user.userType.toLowerCase() !== 'student') {
				return res.status(403).json({
					error: "Ruxsat yo'q. Faqat talabalar bu amalni bajara oladi.",
				})
			}

			// >>> TUZATISH: Bu yerda ham studentni topib olamiz <<<
			const student = await Student.findByPk(req.user.id)
			if (!student) {
				return res
					.status(404)
					.json({ error: "Foydalanuvchi ma'lumotlari topilmadi." })
			}

			const { deliverableId } = req.params
			const updatedDraft = await DeliverableService.updateDeliverable(
				student.student_id,
				deliverableId,
				req.body,
				req.files
			)
			res.status(200).json(updatedDraft)
		} catch (err) {
			next(err)
		}
	}

	static async remove(req, res, next) {
		try {
			if (req.user.userType.toLowerCase() !== 'student') {
				return res
					.status(403)
					.json({
						error: "Ruxsat yo'q. Faqat talabalar bu amalni bajara oladi.",
					})
			}

			// >>> TUZATISH: Bu yerda ham studentni topib olamiz <<<
			const student = await Student.findByPk(req.user.id)
			if (!student) {
				return res
					.status(404)
					.json({ error: "Foydalanuvchi ma'lumotlari topilmadi." })
			}

			const { deliverableId } = req.params
			const updatedDraft = await DeliverableService.removeDeliverable(
				student.student_id,
				deliverableId
			)
			res.status(200).json(updatedDraft)
		} catch (err) {
			next(err)
		}
	}
}

module.exports = DeliverableController
