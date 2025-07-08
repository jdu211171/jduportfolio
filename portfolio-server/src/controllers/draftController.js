const { Student, Admin, Draft, Staff, Notification } = require('../models');
const DraftService = require('../services/draftService');
const NotificationService = require('../services/notificationService');
const StaffService = require('../services/staffService');

class DraftController {
    
    /**
     * Talaba uchun draft yaratadi yoki yangilaydi (Upsert)
     */
    static async upsertDraft(req, res) {
        try {
            // Middleware'da tekshirilgan foydalanuvchini olamiz
            const student = await Student.findOne({ where: { id: req.user.id } });
            if (!student) {
                return res.status(403).json({ error: 'Faqat talabalar profilni o\'zgartirishi mumkin.' });
            }

            const { profile_data } = req.body;
            if (!profile_data) {
                 return res.status(400).json({ error: 'profile_data yuborilishi shart.' });
            }

            const { draft, created } = await DraftService.upsertDraft(student.student_id, profile_data);
            
            const message = created ? 'Qoralama muvaffaqiyatli yaratildi' : 'Qoralama muvaffaqiyatli yangilandi';
            return res.status(created ? 201 : 200).json({ message, draft });

        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * Talaba o'z draftini tekshiruvga yuboradi
     */
    static async submitDraft(req, res) {
        try {
            const { id } = req.params;
            const { staff_id } = req.body;

            const draftForCheck = await Draft.findByPk(id);
            if(!draftForCheck){
                return res.status(404).json({ error: "Qoralama topilmadi." });
            }

            const student = await Student.findOne({ where: { id: req.user.id } });
            if (!student || student.student_id !== draftForCheck.student_id) {
                 return res.status(403).json({ error: 'Ruxsat yo\'q. Faqat o\'z profilingizni yubora olasiz.' });
            }

            const draft = await DraftService.submitForReview(id);

            // Xodimlarga bildirishnoma yuborish
            const studentID = draft.student_id || 'Unknown';
            const message = `学生${studentID}からプロフィール情報が送信されました`;
            const notificationPayload = {
                user_role: 'staff',
                type: 'draft_submitted',
                message: message,
                status: 'unread',
                related_id: draft.id,
            };

            if (staff_id) {
                const staff = await Staff.findByPk(staff_id);
                if (staff) {
                    await NotificationService.create({ ...notificationPayload, user_id: staff.id });
                }
            } else {
                const staffMembers = await Staff.findAll();
                for (const staff of staffMembers) {
                    await NotificationService.create({ ...notificationPayload, user_id: staff.id });
                }
            }
            
            return res.status(200).json({ message: 'Qoralama muvaffaqiyatli tekshiruvga yuborildi.', draft });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * Xodim tomonidan draft statusini o'zgartirish
     */
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, comments } = req.body;
            const reviewed_by = req.user.id;

            if (req.user.userType.toLowerCase() !== 'staff') {
                return res.status(403).json({ error: 'Ruxsat yo\'q. Faqat xodimlar statusni o\'zgartira oladi.' });
            }
            if (!status) {
                return res.status(400).json({ error: 'Status yuborilishi shart.' });
            }
            
            const draft = await DraftService.updateStatusByStaff(id, status, comments, reviewed_by);
            const student = await Student.findOne({ where: { student_id: draft.student_id } });
            
            if (status.toLowerCase() === 'approved') {
                // Agar status "approved" bo'lsa, draftdagi ma'lumotlarni asosiy Student profiliga ko'chirish
                await Student.update(draft.profile_data, { where: { student_id: draft.student_id } });
            }

            // Talabaga bildirishnoma yuborish
            const staffMember = await StaffService.getStaffById(draft.reviewed_by);
            let staffName = 'スタッフによって';
            if (staffMember) {
                staffName = `${staffMember.first_name || ''} ${staffMember.last_name || ''}`.trim() + ' によって';
            }

            let notificationMessage = `あなたの情報は${staffName} 「${status}」ステータスに変更されました。`;
            if (comments && status.toLowerCase() !== 'approved') {
                notificationMessage += `|||COMMENT_SEPARATOR|||📝 **スタッフからのコメント:**\n${comments}`;
            }

            await NotificationService.create({
                message: notificationMessage,
                status: 'unread',
                user_id: student.student_id,
                user_role: 'student',
                type: status.toLowerCase() === 'approved' ? 'approved' : 'etc',
                related_id: draft.id,
            });

            // Adminlarga bildirishnoma yuborish
            if (status.toLowerCase() === 'approved') {
                const admins = await Admin.findAll();
                const adminMessage = `学生 (ID: ${student.student_id}) の情報は、スタッフ (ID: ${reviewed_by}) によって承認されました。`;
                for (const admin of admins) {
                    await NotificationService.create({
                        message: adminMessage,
                        status: 'unread',
                        user_id: admin.id,
                        user_role: 'admin',
                        type: 'approved',
                        related_id: draft.id,
                    });
                }
            }

            return res.json({ message: 'Qoralama statusi muvaffaqiyatli yangilandi.', draft });
        } catch (error) {
            console.error('updateStatus error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    /**
     * Barcha qoralamalarni olish (xodim/admin uchun)
     */
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

    /**
     * Qoralamani o'zining IDsi bo'yicha olish
     */
    static async getDraftById(req, res) {
        try {
            const { id } = req.params;
            const draft = await DraftService.getById(id);
            if (!draft) {
                return res.status(404).json({ error: 'Qoralama topilmadi' });
            }
            return res.status(200).json(draft);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    
    /**
     * Qoralamani talabaning IDsi bo'yicha olish
     */
    static async getDraftByStudentId(req, res) {
        try {
            const { student_id } = req.params;
            if (!student_id) {
                return res.status(400).json({ error: 'student_id yuborilishi shart' });
            }

            let studentWithDraft = await DraftService.getStudentWithDraft(student_id);

            if (!studentWithDraft) {
                return res.status(404).json({ message: 'Talaba topilmadi' });
            }

            if (!studentWithDraft.draft) {
                const studentProfile = studentWithDraft.toJSON();
                const draftKeys = ['self_introduction', 'hobbies', 'skills', 'it_skills', 'gallery', 'deliverables', 'other_information'];
                const defaultDraftData = draftKeys.reduce((acc, key) => {
                    acc[key] = studentProfile[key] || null;
                    return acc;
                }, {});
                
                studentProfile.draft = {
                    id: null,
                    student_id: studentProfile.student_id,
                    profile_data: defaultDraftData,
                    status: 'draft',
                    submit_count: 0,
                    changed_fields: [],
                };
                return res.status(200).json(studentProfile);
            }
            
            return res.status(200).json(studentWithDraft);
        } catch (error) {
            console.error('getDraftByStudentId xatoligi:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Qoralamani o'chirish
     */
    static async deleteDraft(req, res) {
        try {
            const { id } = req.params;
            const deletedDraft = await DraftService.delete(id);
            return res.status(200).json({ message: 'Qoralama muvaffaqiyatli o\'chirildi', draft: deletedDraft });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = DraftController;