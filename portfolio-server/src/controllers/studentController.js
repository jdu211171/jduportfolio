const bcrypt = require('bcrypt')
const StudentService = require('../services/studentService')
const DraftService = require('../services/draftServie')
const QAService = require('../services/qaService')

const generatePassword = require('generate-password')
const { sendStudentWelcomeEmail } = require('../utils/emailToStudent');
const { Student } = require('../models')

class StudentController {
	static async webhookHandler(req, res) {
		try {
			const { type, record, recordId } = req.body
			if (type === 'ADD_RECORD') {
				const password = generatePassword.generate({
					length: 12,
					numbers: true,
					symbols: false,
					uppercase: true,
					excludeSimilarCharacters: true,
				})

				const studentData = {
					email: record.studentEmail.value,
					password: password, // This will be hashed in the Student model
					first_name: record.studentName.value.split(' ')[0],
					last_name: record.studentName.value.split(' ')[1],
					student_id: record.studentId.value,
					phone: record.phoneNumber.value,
					date_of_birth: record.birthDate.value,
					active: record.semester.value > 0,
					kintone_id: record['$id'].value,
					partner_university: record.partnerUniversity.value,
					enrollment_date: record.jduEnrollmentDate.value,
					semester: record.semester.value,
					student_status: record.studentStatus.value,
					// New fields
					graduation_year: record.graduation_year?.value || null,
                    graduation_season: record.graduation_season?.value || null,
                    language_skills: record.language_skills?.value || null,
				}

				const newStudent = await StudentService.createStudent(studentData)
				if (newStudent?.active) {
					await sendStudentWelcomeEmail(
						newStudent.email,
						password,
						newStudent.first_name,
						newStudent.last_name
					)
				}

				res.status(201).json({ message: 'Student added successfully' })
			} else if (type === 'UPDATE_RECORD') {
				const studentData = {
					email: record.studentEmail.value,
					first_name: record.studentName.value.split(' ')[0],
					last_name: record.studentName.value.split(' ')[1],
					student_id: record.studentId.value,
					phone: record.phoneNumber.value,
					date_of_birth: record.birthDate.value,
					kintone_id: record['$id'].value,
					partner_university: record.partnerUniversity.value,
					enrollment_date: record.jduEnrollmentDate.value,
					semester: record.semester.value,
					student_status: record.studentStatus.value,
					// 
					graduation_year: record.graduationYearFieldCode?.value || null,
                    graduation_season: record.graduationSeasonFieldCode?.value || null,
                    language_skills: record.languageSkillsFieldCode?.value || null,
				}

				const updatedStudent = await StudentService.updateStudentWithKintoneID(
					record['$id'].value,
					studentData
				)
				res
					.status(200)
					.json({ message: 'Student updated successfully', updatedStudent })
			} else if (type === 'DELETE_RECORD') {
				await StudentService.deleteStudent(recordId)
				res.status(204).json({ message: 'Student deleted successfully' })
			} else {
				res.status(400).json({ message: 'Invalid request type' })
			}
		} catch (error) {
			console.error('Error in webhook handler:', error)
			res.status(500).json({ error: error.message })
		}
	}

	//due to kintone misconfiguration below function is commented out
	// static async creditUpdater(req, res) {
	//   try {
	//     const { type, record } = req.body;
	//     console.log(type, record)
	//     if (type === "UPDATE_RECORD") {
	//       const studentId = record.studentId.value;
	//       const partner_university_credits = record.partnerUniversityCredits.value;

	//       // Log the extracted values for debugging
	//       console.log('Student ID:', studentId);
	//       console.log('Partner University Credits:', partner_university_credits);

	//       // Construct the data to update
	//       const studentData = {
	//         partner_university_credits
	//       };

	//       // Update the student in the database using the studentId (kintone_id)
	//       const updatedStudent = await StudentService.updateStudentWithStudentID(studentId, studentData);
	//       console.log(updatedStudent)
	//       // const updatedStudent = await StudentService.updateStudentWithKintoneID(record['$id'].value, studentData);
	//     }
	//   } catch (error) {
	//     console.error('Error in webhook handler:', error);
	//     res.status(500).json({ error: error.message });
	//   }
	// }

	// Controller method to create a new student
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
		  let filter = {};
		  const userType = req.user.userType;
		  // console.log('Raw query filter:', req.query.filter);
		  if (req.query.filter) {
			try {
			  filter = typeof req.query.filter === 'string' ? JSON.parse(req.query.filter) : req.query.filter;
			} catch (e) {
			  console.error('Failed to parse filter:', e.message);
			  return res.status(400).json({ error: 'Invalid filter format' });
			}
		  }
		  // console.log('Parsed filter:', filter);
	  
		  const recruiterId = req.query.recruiterId;
		  const onlyBookmarked = req.query.onlyBookmarked;
	  
		  const students = await StudentService.getAllStudents(
			filter,
			recruiterId,
			onlyBookmarked,
			userType
		  );
		  res.status(200).json(students);
		} catch (error) {
		  console.error('Error in getAllStudents controller:', error.message);
		  next(error);
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
			const studentData = req.body
			const { currentPassword, password, ...updateData } = req.body

			const student = await Student.findByPk(id)

			if (!student) {
				return res.status(404).json({ error: 'Student not found' })
			}

			// visibility true bo‘lsa, draft borligini va u 'approved' statusida ekanligini tekshirish
			if (studentData.visibility) {
				const studentDraft = await DraftService.getDraftByStudentId(
					student.student_id
				)

				if (studentDraft && studentDraft.status === 'approved') {
					// console.log('Applying approved draft to student profile...')

					// Draftdan profile_data ni olish va studentni yangilash
					const profileData = studentDraft.profile_data || {}
					await StudentService.updateStudent(id, {
						...profileData, // Draftdan kelgan profil ma'lumotlari
						visibility: true, // Tasdiqlanganidan keyin faollashtiramiz
					})
				}
			}

			// Agar visibility false bo‘lsa, uni false qilib yangilash
			if (studentData.visibility === false) {
				await StudentService.updateStudent(id, { visibility: false })
			}

			// Agar parol o‘zgartirilayotgan bo‘lsa, eski parolni tekshirish
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
			}

			// Studentni yangilash
			const updatedStudent = await StudentService.updateStudent(id, {
				...studentData,
				password: password || undefined, // Parol kiritilgan bo‘lsa yangilanadi, bo‘lmasa o‘zgarmaydi
			})

			res.status(200).json(updatedStudent)
		} catch (error) {
			next(error)
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
