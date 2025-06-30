const bcrypt = require('bcrypt')
const StudentService = require('../services/studentService')
const DraftService = require('../services/draftService')
const QAService = require('../services/qaService')
const generatePassword = require('generate-password')
const { sendStudentWelcomeEmail } = require('../utils/emailToStudent'); // To'g'ri email funksiyasini import qilamiz
const { Student } = require('../models')

class StudentController {
	// Webhook handler for Kintone events
	static async webhookHandler(req, res) {
        try {
            const { type, record, recordId } = req.body;

            // Hodisa turiga qarab ish bajaramiz
            switch (type) {
                // YANGI YOZUV QO'SHILGANDA
                case 'ADD_RECORD': {
                    const password = generatePassword.generate({
                        length: 12,
                        numbers: true,
                        symbols: false,
                        uppercase: true,
                        excludeSimilarCharacters: true,
                    });

                    // Kintone'dan kelgan ma'lumotlarni DB modeliga moslashtiramiz
                    const studentData = {
                        email: record.mail?.value,
                        password: password, // Parol model ichida avtomatik xeshlanadi
                        first_name: record.studentFirstName?.value,
                        last_name: record.studentLastName?.value,
                        student_id: record.studentId?.value,
                        phone: record.phoneNumber?.value,
                        date_of_birth: record.birthday?.value,
                        gender: record.gender?.value,
                        address: record.address?.value,
                        parents_phone_number: record.parentsPhoneNumber?.value,
                        enrollment_date: record.jduDate?.value,
                        partner_university: record.partnerUniversity?.value,
                        partner_university_enrollment_date: record.partnerUniversityEnrollmentDate?.value,
                        semester: record.semester?.value,
                        student_status: record.studentStatus?.value,
                        kintone_id: record['$id']?.value,
                        active: record.semester?.value > 0, // Semestri bo'lsa, aktiv deb hisoblaymiz
                    };
                    
                    // Servis orqali yangi talaba yaratamiz
                    const newStudent = await StudentService.createStudent(studentData);

                    // Agar talaba aktiv bo'lsa, unga xush kelibsiz xabarini jo'natamiz
                    if (newStudent?.active) {
                        await sendStudentWelcomeEmail(
                            newStudent.email,
                            password, // Xeshlanmagan parolni yuboramiz
                            newStudent.first_name,
                            newStudent.last_name
                        );
                    }
                    
                    // Muvaffaqiyatli javob qaytaramiz
                    return res.status(201).json({ message: 'Student created via webhook', student: newStudent });
                }

                // YOZUV YANGILANGANDA
                case 'UPDATE_RECORD': {
                    const kintoneId = record['$id']?.value;
                    // Kintone'dan kelgan ma'lumotlarni DB modeliga moslashtiramiz
                    const studentData = {
                        email: record.mail?.value,
                        first_name: record.studentFirstName?.value,
                        last_name: record.studentLastName?.value,
                        student_id: record.studentId?.value,
                        phone: record.phoneNumber?.value,
                        date_of_birth: record.birthday?.value,
                        gender: record.gender?.value,
                        address: record.address?.value,
                        parents_phone_number: record.parentsPhoneNumber?.value,
                        enrollment_date: record.jduDate?.value,
                        partner_university: record.partnerUniversity?.value,
                        partner_university_enrollment_date: record.partnerUniversityEnrollmentDate?.value,
                        semester: record.semester?.value,
                        student_status: record.studentStatus?.value,
                        active: record.semester?.value > 0,
                    };
                    
                    // Servis orqali kintone_id bo'yicha yangilaymiz
                    const updatedStudent = await StudentService.updateStudentByKintoneID(kintoneId, studentData);

                    if (!updatedStudent) {
                        return res.status(404).json({ message: 'Student not found with this Kintone ID' });
                    }

                    return res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
                }

                // YOZUV O'CHIRILGANDA
                case 'DELETE_RECORD': {
                    const deletedCount = await StudentService.deleteStudentByKintoneId(recordId);
                    
                    if (deletedCount === 0) {
                        return res.status(404).json({ message: 'Student not found with this Kintone ID' });
                    }

                    return res.status(204).send(); // Muvaffaqiyatli o'chirish uchun javob
                }

                default:
                    return res.status(400).json({ message: 'Invalid webhook event type' });
            }
        } catch (error) {
            console.error('Error in Student webhook handler:', error);
            return res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
    }

	static async createStudent(req, res, next) {
		try {
			const studentData = req.body
			const newStudent = await StudentService.createStudent(studentData)
			res.status(201).json(newStudent)
		} catch (error) {
			next(error)
		}
	}

	// Controller method to get all students
	// static async getAllStudents(req, res, next) {
	// 	try {
	// 		let filter
	// 		const userType = req.user.userType
	// 		console.log('Raw query filter:', req.query.filter);
	// 		if (req.query.filter) {
	// 			filter = req.query.filter
	// 		} else {
	// 			filter = {}
	// 		}

	// 		const recruiterId = req.query.recruiterId
	// 		const onlyBookmarked = req.query.onlyBookmarked

	// 		const students = await StudentService.getAllStudents(
	// 			filter,
	// 			recruiterId,
	// 			onlyBookmarked,
	// 			userType
	// 		)
	// 		res.status(200).json(students)
	// 	} catch (error) {
	// 		next(error)
	// 	}
	// }

	// test getAllStudents
	static async getAllStudents(req, res, next) {
		try {
			let filter = {}
			const userType = req.user.userType
			// console.log('Raw query filter:', req.query.filter);
			if (req.query.filter) {
				try {
					filter =
						typeof req.query.filter === 'string'
							? JSON.parse(req.query.filter)
							: req.query.filter
				} catch (e) {
					console.error('Failed to parse filter:', e.message)
					return res.status(400).json({ error: 'Invalid filter format' })
				}
			}
			// console.log('Parsed filter:', filter);

			const recruiterId = req.query.recruiterId
			const onlyBookmarked = req.query.onlyBookmarked

			const students = await StudentService.getAllStudents(
				filter,
				recruiterId,
				onlyBookmarked,
				userType
			)
			res.status(200).json(students)
		} catch (error) {
			console.error('Error in getAllStudents controller:', error.message)
			next(error)
		}
	}

	// Controller method to get a student by ID
	static async getStudentById(req, res, next) {
		try {
			const { id } = req.params
			const student = await StudentService.getStudentById(id)
			res.status(200).json(student)
		} catch (error) {
			next(error)
		}
	}

	static async updateStudent(req, res, next) {
		try {
			const { id } = req.params
			const { currentPassword, password, ...studentData } = req.body

			console.log('UpdateStudent called with:', { id, studentData })

			const student = await Student.findByPk(id)

			if (!student) {
				console.log('Student not found:', id)
				return res.status(404).json({ error: 'Student not found' })
			}

			console.log('Current student data:', student.dataValues)

			let updatePayload = { ...studentData }

			// visibility true bo'lsa, draft borligini va u 'approved' statusida ekanligini tekshirish
			if (studentData.visibility === true) {
				const studentDraft = await DraftService.getDraftByStudentId(
					student.student_id
				)

				console.log('Draft data for student:', studentDraft)

				if (studentDraft && studentDraft.status === 'approved') {
					// Draftdan profile_data ni olish va uni yangilash payload'ga qo'shish
					const profileData = studentDraft.profile_data || {}
					updatePayload = {
						...profileData, // Draftdan kelgan profil ma'lumotlari
						visibility: true, // Tasdiqlanganidan keyin faollashtiramiz
					}
					console.log('Using draft profile data:', updatePayload)
				} else {
					// Agar draft yo'q yoki approved emas bo'lsa, faqat visibility'ni yangilash
					updatePayload = { visibility: true }
					console.log('Using visibility only:', updatePayload)
				}
			}

			// Agar parol o'zgartirilayotgan bo'lsa, eski parolni tekshirish
			if (password) {
				const studentWithPassword = await StudentService.getStudentById(
					req.params.id,
					true
				)
				if (
					!studentWithPassword ||
					!(await bcrypt.compare(currentPassword, studentWithPassword.password))
				) {
					return res
						.status(400)
						.json({ error: '現在のパスワードを入力してください' })
				}
				updatePayload.password = password
			}

			console.log('Final update payload:', updatePayload)

			// Studentni bir marta yangilash
			const updatedStudent = await StudentService.updateStudent(
				id,
				updatePayload
			)

			console.log('Updated student:', updatedStudent.dataValues)

			res.status(200).json(updatedStudent)
		} catch (error) {
			console.error('Error updating student:', error)
			res.status(500).json({ error: error.message })
		}
	}

	// Controller method to delete a student
	static async deleteStudent(req, res, next) {
		try {
			const { id } = req.params
			await StudentService.deleteStudent(id)
			res.status(204).end()
		} catch (error) {
			next(error)
		}
	}

	// sample email sender
	static async mail(req, res, next) {
		try {
			const { email, password, firstName, lastName } = req.body
			await StudentService.EmailToStudent(email, password, firstName, lastName)
			res.status(204).end()
		} catch (error) {
			next(error)
		}
	}
}

module.exports = StudentController
