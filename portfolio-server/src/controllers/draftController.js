const { Student, Admin, Draft, Staff, Notification } = require('../models')
const DraftService = require('../services/draftService')
const NotificationService = require('../services/notificationService')
const StudentService = require('../services/studentService')
const StaffService = require('../services/staffService')
// const emailService = require('../utils/emailService');

class DraftController {
	static async createDraft(req, res) {
		try {
			const draft = await DraftService.create(req.body)
			return res.status(201).json(draft)
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	static async getDraftById(req, res) {
		try {
			const { id } = req.params
			const draft = await DraftService.getById(id)
			if (!draft) {
				return res.status(404).json({ error: 'Draft not found' })
			}
			return res.status(200).json(draft)
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	// Modify getDraftByStudentId to include more student information
	static async getDraftByStudentId(req, res) {
		try {
			const { student_id } = req.params

			if (!student_id) {
				return res.status(400).json({ error: 'student_id is required' })
			}

			// Find the student with their draft
			const student = await Student.findOne({
				where: { student_id },
				attributes: {
					exclude: ['password', 'createdAt', 'updatedAt'],
				},
				include: [
					{
						model: Draft,
						as: 'draft',
						required: false,
					},
				],
			})

			if (!student) {
				return res.status(404).json({ message: 'Student not found' })
			}

			// If there's no draft, create a default draft structure from the student profile
			if (!student.draft) {
				const draftKeys = [
					'deliverables',
					'gallery',
					'self_introduction',
					'hobbies',
					'other_information',
					'it_skills',
					'skills',
				]

				const defaultDraftData = draftKeys.reduce((acc, key) => {
					acc[key] = student[key] || ''
					return acc
				}, {})

				// Return the student with an empty draft profile
				return res.status(200).json({
					...student.toJSON(),
					draft: {
						id: null,
						student_id: student.student_id,
						profile_data: defaultDraftData,
						status: 'draft',
						submit_count: 0,
						comments: null,
						reviewed_by: null,
						created_at: new Date(),
						updated_at: new Date(),
					},
				})
			}

			// Return the student with their draft
			return res.status(200).json(student)
		} catch (error) {
			console.error('Error fetching draft:', error)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}

	static async updateDraft(req, res) {
		try {
			const { id } = req.params

			const draft = await Draft.findByPk(id)

			if (!draft) {
				return res.status(404).json({ error: 'Draft not found' })
			}

			// `Students` jadvalidan foydalanuvchining student_id sini topamiz
			const student = await Student.findOne({ where: { id: req.user.id } })

			if (!student) {
				return res
					.status(403)
					.json({ error: 'Permission denied. You are not a student.' })
			}

			// Agar studentning student_id si draftdagi student_id ga mos kelmasa
			if (student.student_id !== draft.student_id) {
				return res.status(403).json({
					error: 'Permission denied. You can only update your own draft.',
				})
			}

			// Faqat `profile_data` yangilanishi kerak
			if (!req.body.profile_data) {
				return res
					.status(400)
					.json({ error: 'Only profile_data can be updated.' })
			}

			draft.profile_data = req.body.profile_data
			await draft.save()

			return res
				.status(200)
				.json({ message: 'Draft updated successfully', draft })
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	static async submitDraft(req, res) {
		try {
			const { id } = req.params
			const { staff_id } = req.body
			const draft = await Draft.findByPk(id)

			if (!draft) {
				return res.status(404).json({ error: 'Draft not found' })
			}
			draft.submit_count += 1
			draft.status = 'submitted'
			draft.comments = null
			let student_id = draft.student_id
			await Student.update({ visibility: false }, { where: { student_id } })
			await draft.save()
			const studentID = draft.student_id || 'Unknown'
			if (staff_id) {
				const staff = await Staff.findByPk(staff_id)
				if (!staff) {
					return res.status(404).json({ error: 'Staff not found' })
				}
				await Notification.create({
					user_id: staff.id,
					user_role: 'staff',
					type: 'draft_submitted',
					message: `学生${studentID}からプロフィール情報が送信されました`,
					status: 'unread',
					related_id: draft.id,
				})
			} else {
				const staffMembers = await Staff.findAll()
				for (const staff of staffMembers) {
					await Notification.create({
						user_id: staff.id,
						user_role: 'staff',
						type: 'draft_submitted',
						message: `学生${studentID}からプロフィール情報が送信されました`,
						status: 'unread',
						related_id: draft.id,
					})
				}
			}

			// await emailService.sendEmail(
			//   'tillayevx1@gmail.com',
			//   'Profil Malumotlari',
			//   `Student ${studentName} tomonidan profil malumotlari yangilandi.`,
			//   `<p>Student <strong>${studentName}</strong> tomonidan yangi malumotlar jo'natildi.</p>`
			// );

			return res
				.status(200)
				.json({ message: 'Draft successfully submitted', draft })
		} catch (error) {
			console.error('Error in submitDraft:', error)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}

	static async updateStatus(req, res) {
		try {
			const { id } = req.params

			const { status, comments } = req.body
			const reviewed_by = req.user.id
			const usertype = req.user.userType

			if (
				usertype.toLowerCase() !== 'staff' &&
				usertype.toLowerCase() !== 'admin'
			) {
				return res.status(403).json({
					error: 'Permission denied. Only staff and admin can update status.',
				})
			}
			if (!status) {
				return res.status(400).json({ error: 'Status is required' })
			}
			const draft = await Draft.findOne({ where: { id: id } })
			if (!draft) {
				return res.status(404).json({ error: 'Draft not found' })
			}

			if (draft.status === status) {
				return res
					.status(200)
					.json({ error: 'Status is already set to this value' })
			}

			// Store previous status for visibility logic
			const previousStatus = draft.status

			draft.status = status
			draft.reviewed_by = reviewed_by
			if (comments) {
				draft.comments = comments
			}
			await draft.save()
			let student = await StudentService.getStudentByStudentId(draft.student_id)
			let student_id = draft.student_id

			// If status is changing from 'approved' to anything else, set visibility to false
			if (previousStatus === 'approved' && status !== 'approved') {
				await Student.update({ visibility: false }, { where: { student_id } })
			}
			// Note: When status becomes 'approved', visibility should NOT be automatically set to true
			// Only admin should manually control visibility via separate endpoint

			// Get reviewer information (Staff or Admin)
			let reviewerName = ''
			let reviewerType = 'スタッフ'

			if (usertype.toLowerCase() === 'staff') {
				const staffMember = await StaffService.getStaffById(draft.reviewed_by)
				if (staffMember && staffMember.first_name && staffMember.last_name) {
					reviewerName = `${staffMember.first_name} ${staffMember.last_name} によって`
				} else if (staffMember && staffMember.first_name) {
					reviewerName = `${staffMember.first_name} によって`
				} else {
					reviewerName = `スタッフによって`
				}
			} else if (usertype.toLowerCase() === 'admin') {
				// Admin uchun logic qo'shish kerak bo'lsa
				reviewerName = `管理者によって`
				reviewerType = '管理者'
			} else {
				reviewerName = `スタッフによって` // Default
			}

			// Create notification message with comments if available
			let notificationMessage = `あなたの情報は${reviewerName} 「${status}」ステータスに変更されました。`

			// Add comment as separate part if available (for all statuses now)
			if (comments) {
				// Use special separator to identify comment section in frontend
				notificationMessage += `|||COMMENT_SEPARATOR|||📝 **${reviewerType}からのコメント:**\n${comments}`
			}

			const notification = await NotificationService.create({
				message: notificationMessage,
				status: 'unread',
				user_id: student.student_id,
				user_role: 'student',
				type: status.toLowerCase() === 'approved' ? 'approved' : 'etc',
				related_id: draft.id,
			})
			// console.log(notification);

			if (status.toLowerCase() === 'approved') {
				const admins = await Admin.findAll()
				// console.log(admins);

				const adminNotifications = admins.map(admin => {
					NotificationService.create({
						message: `学生 (ID: ${student.student_id}) の情報は、スタッフ (ID: ${reviewed_by}) によって承認されました。`,
						status: 'unread',
						user_id: admin.id,
						user_role: 'admin',
						type: 'approved',
						related_id: draft.id,
					})
				})
				// console.log(adminNotifications);
			}

			return res.json({
				message: 'Draft status updated successfully and notification sent',
				draft,
			})
		} catch (error) {
			console.error(error)
			return res.status(500).json({ error: 'Internal server error' })
		}
	}

	static async deleteDraft(req, res) {
		try {
			const { id } = req.params
			const draft = await DraftService.delete(id)
			return res
				.status(200)
				.json({ message: 'Draft deleted successfully', draft })
		} catch (error) {
			return res.status(400).json({ error: error.message })
		}
	}

	static async getAllDrafts(req, res, next) {
		try {
			let filter
			if (req.query.filter) {
				filter = req.query.filter
			} else {
				filter = {}
			}

			const students = await DraftService.getAll(filter)
			// res.status(200).json(students);
			// const drafts = await Draft.findAll();
			return res.status(200).json(students)
		} catch (error) {
			next(error)
		}
	}
}

module.exports = DraftController
