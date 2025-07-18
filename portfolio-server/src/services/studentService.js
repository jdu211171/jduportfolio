// services/studentService.js
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const generatePassword = require('generate-password')
const { Student, Draft, Bookmark, sequelize } = require('../models')
const DraftService = require('./draftServie')

const { formatStudentWelcomeEmail } = require('../utils/emailToStudent');
const { sendBulkEmails } = require('../utils/emailService');

class StudentService {
	// Service method to create a new student
	static async createStudent(studentData) {
		try {
			const newStudent = await Student.create(studentData)
			return newStudent
		} catch (error) {
			throw error
		}
	}

	// Service method to retrieve all students
	// static async getAllStudents(filter, recruiterId, onlyBookmarked, userType) {
	// 	try {
	// 		const semesterMapping = {
	// 			'1年生': ['1', '2'],
	// 			'2年生': ['3', '4'],
	// 			'3年生': ['5', '6'],
	// 			'4年生': ['7', '8', '9'],
	// 		}
	// 		const getSemesterNumbers = term => {
	// 			return semesterMapping[term] || [] // Return an empty array if term is not found in the mapping
	// 		}
	// 		if (filter.semester) {
	// 			filter.semester = filter.semester.flatMap(term =>
	// 				getSemesterNumbers(term)
	// 			)
	// 		}

	// 		let query = {} // Initialize an empty query object
	// 		let querySearch = {}
	// 		let queryOther = {}
	// 		queryOther[Op.and] = []

	// 		const searchableColumns = [
	// 			'email',
	// 			'first_name',
	// 			'last_name',
	// 			'self_introduction',
	// 			'hobbies',
	// 			'skills',
	// 			'it_skills',
	// 			'jlpt',
	// 			'student_id'
	// 		] // Example list of searchable columns

	// 		// Iterate through filter keys
	// 		Object.keys(filter).forEach(key => {
	// 			if (filter[key]) {
	// 				// Handle different types of filter values
	// 				if (key === 'search') {
	// 					// Search across all searchable columns
	// 					querySearch[Op.or] = searchableColumns.map(column => {
	// 						if (['skills', 'it_skills'].includes(column)) {
	// 							// Handle JSONB fields specifically
	// 							return {
	// 								[Op.or]: [
	// 									{
	// 										[column]: {
	// 											'上級::text': { [Op.iLike]: `%${filter[key]}%` },
	// 										},
	// 									},
	// 									{
	// 										[column]: {
	// 											'中級::text': { [Op.iLike]: `%${filter[key]}%` },
	// 										},
	// 									},
	// 									{
	// 										[column]: {
	// 											'初級::text': { [Op.iLike]: `%${filter[key]}%` },
	// 										},
	// 									},
	// 								],
	// 							}
	// 						} else {
	// 							// Use Op.iLike for case insensitive search on other columns
	// 							return { [column]: { [Op.iLike]: `%${filter[key]}%` } }
	// 						}
	// 					})
	// 				} else if (key === 'skills' || key === 'it_skills') {
	// 					// Search across all searchable columns
	// 					queryOther[Op.and].push({
	// 						[Op.or]: [
	// 							{ [key]: { '上級::text': { [Op.iLike]: `%${filter[key]}%` } } },
	// 							{ [key]: { '中級::text': { [Op.iLike]: `%${filter[key]}%` } } },
	// 							{ [key]: { '初級::text': { [Op.iLike]: `%${filter[key]}%` } } },
	// 						],
	// 					})
	// 				} else if (key === 'partner_university_credits') {
	// 					queryOther[key] = { [Op.lt]: Number(filter[key]) }
	// 				} else if (key === 'other_information') {
	// 					if (filter[key] === '有り') {
	// 						queryOther['other_information'] = { [Op.ne]: null }
	// 					} else if (filter[key] === '無し') {
	// 						queryOther['other_information'] = { [Op.is]: null }
	// 					}
	// 				} else if (
	// 					key === 'jlpt' ||
	// 					key === 'ielts' ||
	// 					key === 'jdu_japanese_certification'
	// 				) {
	// 					// Handle jlpt specifically for stringified JSON field
	// 					queryOther[Op.and].push({
	// 						[Op.or]: filter[key].map(level => {
	// 							return { [key]: { [Op.iLike]: `%${level}"%` } }
	// 						}),
	// 					})
	// 				} else if (Array.isArray(filter[key])) {
	// 					// If filter value is an array, use $in operator
	// 					queryOther[key] = { [Op.in]: filter[key] }
	// 				} else if (typeof filter[key] === 'string') {
	// 					queryOther[key] = { [Op.like]: `%${filter[key]}%` }
	// 				} else {
	// 					// Handle other types of filter values as needed
	// 					queryOther[key] = filter[key]
	// 				}
	// 			}
	// 		})

	// 		if (!query[Op.and]) {
	// 			query[Op.and] = []
	// 		}

	// 		query[Op.and].push(querySearch, queryOther, { active: true })

	// 		// If the user is a recruiter, only show students with visibility=true
	// 		if (userType === 'Recruiter') {
	// 			query[Op.and].push({ visibility: true })
	// 		}

	// 		// Handle bookmarked filtering
	// 		if (onlyBookmarked === 'true') {
	// 			query[Op.and].push(
	// 				sequelize.literal(`EXISTS (
    //         SELECT 1
    //         FROM "Bookmarks" AS "Bookmark"
    //         WHERE "Bookmark"."studentId" = "Student"."id"
    //           AND "Bookmark"."recruiterId" = ${sequelize.escape(recruiterId)}
    //       )`)
	// 			)
	// 		}

	// 		// Execute the query to fetch students
	// 		const students = await Student.findAll({
	// 			where: query,
	// 			attributes: {
	// 				include: recruiterId
	// 					? [
	// 							[
	// 								sequelize.literal(`EXISTS (
    //           SELECT 1
    //           FROM "Bookmarks" AS "Bookmark"
    //           WHERE "Bookmark"."studentId" = "Student"."id"
    //             AND "Bookmark"."recruiterId" = ${sequelize.escape(recruiterId)}
    //         )`),
	// 								'isBookmarked',
	// 							],
	// 						]
	// 					: [],
	// 			},
	// 		})

	// 		return students
	// 	} catch (error) {
	// 		throw error
	// 	}
	// }


	/// test getAllStudents
	static async getAllStudents(filter, recruiterId, onlyBookmarked, userType) {
		try {
		  // console.log('Received filter:', filter);
	  
		  const semesterMapping = {
			'1年生': ['1', '2'],
			'2年生': ['3', '4'],
			'3年生': ['5', '6'],
			'4年生': ['7', '8', '9'],
		  };
		  const getSemesterNumbers = term => semesterMapping[term] || [];
		  if (filter.semester) {
			filter.semester = filter.semester.flatMap(term => getSemesterNumbers(term));
		  }
	  
		  let query = {};
		  let querySearch = {};
		  let queryOther = {};
		  queryOther[Op.and] = [];
	  
		  const searchableColumns = [
			'email',
			'first_name',
			'last_name',
			'self_introduction',
			'hobbies',
			'skills',
			'it_skills',
			'jlpt',
			'student_id',
			'graduation_year',    // New Field
            'graduation_season',  // New Field
            'language_skills',    // New Field
		  ];
	  
		  if (!filter || typeof filter !== 'object') {
			filter = {};
		  }
	  
		  Object.keys(filter).forEach(key => {
			if (filter[key]) {
			  // console.log(`Processing key: ${key}, value: ${filter[key]}`);
			  if (key === 'search') {
				const searchValue = String(filter[key]);
				// console.log('Search value:', searchValue);
				querySearch[Op.or] = searchableColumns.map(column => {
				  // console.log(`Building condition for column: ${column}`);
				  if (['skills', 'it_skills'].includes(column)) {
					return {
					  [Op.or]: [
						{ [column]: { '上級::text': { [Op.iLike]: `%${searchValue}%` } } },
						{ [column]: { '中級::text': { [Op.iLike]: `%${searchValue}%` } } },
						{ [column]: { '初級::text': { [Op.iLike]: `%${searchValue}%` } } },
					  ],
					};
				  } else if (column === 'student_id') {
					return { [column]: { [Op.eq]: searchValue } }; // INTEGER uchun aniq moslik
				  } else {
					return { [column]: { [Op.iLike]: `%${searchValue}%` } };
				  }
				});
			  } else if (key === 'skills' || key === 'it_skills') {
				queryOther[Op.and].push({
				  [Op.or]: [
					{ [key]: { '上級::text': { [Op.iLike]: `%${filter[key]}%` } } },
					{ [key]: { '中級::text': { [Op.iLike]: `%${filter[key]}%` } } },
					{ [key]: { '初級::text': { [Op.iLike]: `%${filter[key]}%` } } },
				  ],
				});
			  } else if (key === 'partner_university_credits') {
				queryOther[key] = { [Op.lt]: Number(filter[key]) };
			  } else if (key === 'other_information') {
				if (filter[key] === '有り') {
				  queryOther['other_information'] = { [Op.ne]: null };
				} else if (filter[key] === '無し') {
				  queryOther['other_information'] = { [Op.is]: null };
				}
			  } else if (key === 'jlpt' || key === 'ielts' || key === 'jdu_japanese_certification') {
				queryOther[Op.and].push({
				  [Op.or]: filter[key].map(level => ({ [key]: { [Op.iLike]: `%${level}"%` } })),
				});
			  } else if (key === 'graduation_year' || key === 'graduation_season') {
                    const values = Array.isArray(filter[key]) ? filter[key] : [filter[key]];
                    queryOther[Op.and].push({
                    	[Op.or]: values.map(value => ({ [key]: { [Op.iLike]: `%${String(value)}%` } })),
                    });
              } else if (key === 'language_skills') {
                    queryOther[key] = { [Op.iLike]: `%${String(filter[key])}%` };
			  } else if (Array.isArray(filter[key])) {
				queryOther[key] = { [Op.in]: filter[key] };
			  } else if (typeof filter[key] === 'string') {
				queryOther[key] = { [Op.iLike]: `%${filter[key]}%` };
			  } else {
				queryOther[key] = filter[key];
			  }
			}
		  });
	  
		  if (!query[Op.and]) {
			query[Op.and] = [];
		  }
	  
		  query[Op.and].push(querySearch, queryOther, { active: true });
	  
		  if (userType === 'Recruiter') {
			query[Op.and].push({ visibility: true });
		  }
	  
		  if (onlyBookmarked === 'true') {
			query[Op.and].push(
			  sequelize.literal(`EXISTS (
				SELECT 1
				FROM "Bookmarks" AS "Bookmark"
				WHERE "Bookmark"."studentId" = "Student"."id"
				  AND "Bookmark"."recruiterId" = ${sequelize.escape(recruiterId)}
			  )`)
			);
		  }
	  
		  // console.log('Generated Query:', JSON.stringify(query, null, 2));
		  const students = await Student.findAll({
			where: query,
			attributes: {
			  include: recruiterId
				? [
					[
					  sequelize.literal(`EXISTS (
						SELECT 1
						FROM "Bookmarks" AS "Bookmark"
						WHERE "Bookmark"."studentId" = "Student"."id"
						  AND "Bookmark"."recruiterId" = ${sequelize.escape(recruiterId)}
					  )`),
					  'isBookmarked',
					],
				  ]
				: [],
			},
		  });
	  
		  return students;
		} catch (error) {
		  console.error('Error in getAllStudents:', error.message);
		  throw error;
		}
	  }

	// Service method to retrieve a student by ID
	static async getStudentById(studentId, password = false) {
		try {
			let excluded = ['createdAt', 'updatedAt']
			if (!password) {
				excluded.push('password')
			}
			const student = await Student.findByPk(studentId, {
				attributes: { exclude: excluded },
			})
			if (!student) {
				throw new Error('Student not found')
			}
			return student
		} catch (error) {
			throw error
		}
	}

	// Service method to retrieve a student by student_id
	static async getStudentByStudentId(studentId, password = false) {
		try {
			let excluded = ['createdAt', 'updatedAt']
			if (!password) {
				excluded.push('password')
			}

			const student = await Student.findOne({
				where: { student_id: studentId }, // Search by student_id instead of id
				attributes: { exclude: excluded },
			})

			if (!student) {
				throw new Error('Student not found')
			}

			return student
		} catch (error) {
			throw error
		}
	}

	// Service method to update a student
	// static async updateStudent(studentId, studentData) {
	//   try {
	//     console.log("Updating student with ID:", studentId, "Type:", typeof studentId);
	//     const student = await Student.findByPk(studentId, {
	//       attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
	//     });
	//     if (!student) {
	//       throw new Error('Student not found');
	//     }
	//     await student.update(studentData);
	//     return student;
	//   } catch (error) {
	//     throw error;
	//   }
	// }

	static async updateStudent(studentId, studentData) {
		try {
			let student
			// If it's a numeric ID, use the primary key
			if (!isNaN(parseInt(studentId))) {
				student = await Student.findByPk(studentId)
			} else {
				// Otherwise use the student_id string
				student = await Student.findOne({ where: { student_id: studentId } })
			}

			if (!student) {
				throw new Error('Student not found')
			}

			// If we're setting visibility to true, ensure we have the latest approved draft
			if (studentData.visibility === true) {
				// Check if we already have draft data in the request
				const hasDraftData =
					studentData.hasOwnProperty('self_introduction') ||
					studentData.hasOwnProperty('hobbies') ||
					studentData.hasOwnProperty('skills') ||
					studentData.hasOwnProperty('it_skills')

				// If no draft data provided, try to find the latest approved draft
				if (!hasDraftData) {
					const latestApprovedDraft =
						await DraftService.getLatestApprovedDraftByStudentId(
							student.student_id
						)

					if (latestApprovedDraft) {
						// console.log('Applying latest approved draft to student profile...')

						// Extract profile data from the draft
						const profileData = latestApprovedDraft.profile_data || {}

						// Merge the profile data with the request data
						studentData = {
							...profileData,
							...studentData,
							visibility: true,
						}
					}
				}
			}

			// Update the student with the provided data
			await student.update(studentData)
			return student
		} catch (error) {
			console.error('Error updating student:', error)
			throw error
		}
	}

	// Service method to update a student by kintone_id
	static async updateStudentWithKintoneID(kintoneId, studentData) {
		try {
			// Find student by kintone_id and exclude certain fields from the response
			const student = await Student.findOne({
				where: { kintone_id: kintoneId },
				attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
			})

			// If student not found, throw an error
			if (!student) {
				throw new Error('Student not found')
			}

			// Update the student with the provided data
			await student.update(studentData)

			return student
		} catch (error) {
			console.error('Error updating student:', error)
			throw error
		}
	}

	// Service method to update a student by kintone_id
	static async updateStudentWithStudentID(studentId, studentData) {
		try {
			// Find student by kintone_id and exclude certain fields from the response
			const student = await Student.findOne({
				where: { student_id: studentId },
				attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
			})

			// If student not found, throw an error
			if (!student) {
				throw new Error('Student not found')
			}

			// Update the student with the provided data
			await student.update(studentData)

			return student
		} catch (error) {
			console.error('Error updating student:', error)
			throw error
		}
	}

	// Service method to delete a student by kintone_id
	static async deleteStudent(kintoneId) {
		try {
			// Find student by kintone_id
			const student = await Student.findOne({
				where: { kintone_id: kintoneId },
			})

			// If student not found, throw an error
			if (!student) {
				throw new Error('Student not found')
			}

			// Delete the student
			await student.destroy()
		} catch (error) {
			console.error('Error deleting student:', error)
			throw error
		}
	}


	// static async syncStudentData(studentData) {
    //     try {
    //         const emailTasks = [];
    //         const upsertPromises = [];

    //         for (const data of studentData) {
    //             if (!data.studentId || !data.mail) continue; // Agar asosiy maydonlar bo'lmasa, keyingisiga o'tish

    //             const existingStudent = await Student.findOne({ where: { student_id: data.studentId } });

    //             const formattedData = {
    //                 email: data.mail.trim(),
    //                 student_id: data.studentId,
    //                 first_name: data.studentFirstName,
    //                 last_name: data.studentLastName,
    //                 date_of_birth: data.birthday,
    //                 gender: data.gender,
    //                 address: data.address,
    //                 parents_phone_number: data.parentsPhoneNumber,
    //                 phone: data.phoneNumber,
    //                 enrollment_date: data.jduDate,
    //                 partner_university_enrollment_date: data.partnerUniversityEnrollmentDate,
    //                 semester: data.semester,
    //                 student_status: data.studentStatus,
    //                 partner_university: data.partnerUniversity,
    //                 kintone_id: data.kintone_id_value,
    //                 world_language_university_credits: Number(data.worldLanguageUniversityCredits) || 0,
    //                 business_skills_credits: Number(data.businessSkillsCredits) || 0,
    //                 japanese_employment_credits: Number(data.japaneseEmploymentCredits) || 0,
    //                 liberal_arts_education_credits: Number(data.liberalArtsEducationCredits) || 0,
    //                 total_credits: Number(data.totalCredits) || 0,
    //                 specialized_education_credits: Number(data.specializedEducationCredits) || 0,
    //                 partner_university_credits: Number(data.partnerUniversityCredits) || 0,
    //                 jlpt: data.jlpt,
    //                 jdu_japanese_certification: data.jdu_japanese_certification,
    //                 ielts: data.ielts,
    //                 japanese_speech_contest: data.japanese_speech_contest,
    //                 it_contest: data.it_contest,
    //             };

    //             if (!existingStudent || (data.semester > 0 && !existingStudent.active)) {
    //                 const password = generatePassword.generate({ length: 12, numbers: true, symbols: false, uppercase: true, });
    //                 formattedData.password = await bcrypt.hash(password, 10);
    //                 formattedData.active = true;
    //                 emailTasks.push(formatStudentWelcomeEmail(formattedData.email, password, formattedData.first_name, formattedData.last_name));
    //             } else {
    //                 formattedData.password = existingStudent.password;
    //             }

    //             upsertPromises.push(Student.upsert(formattedData));
    //         }
            
    //         await Promise.all(upsertPromises);
    //         console.log(`${upsertPromises.length} ta talaba ma'lumotlari DBda yangilandi/yaratildi.`);

    //         if (emailTasks.length > 0) {
    //             console.log(`${emailTasks.length} ta yangi talabaga email jo'natish boshlandi...`);
    //             const emailReport = await sendBulkEmails(emailTasks);
    //             console.log('--- Ommaviy Email Jo\'natish Hisoboti ---', emailReport);
    //         } else {
    //             console.log('Jo\'natish uchun yangi aktiv talabalar topilmadi.');
    //         }

    //         return { message: "Sinxronizatsiya muvaffaqiyatli yakunlandi." };

    //     } catch (error) {
    //         console.error("syncStudentData xatolik:", error);
    //         throw error;
    //     }
    // }
	/**
     * Kintone'dan kelgan talabalar ro'yxatini sinxronizatsiya qiladi.
     * Yangi yaratilgan har bir talaba uchun email vazifasini tayyorlaydi.
     * @param {Array} studentData - Kintone'dan kelgan formatlangan talabalar ro'yxati.
     * @returns {Array} Yangi talabalar uchun email vazifalari massivi.
     */
    static async syncStudentData(studentData) {
        try {
            const emailTasks = []; // Jo'natiladigan email vazifalari uchun massiv
            const upsertPromises = []; // DB'ga yozish uchun promise'lar massivi

            for (const data of studentData) {
                if (!data.studentId || !data.mail) continue;

                const existingStudent = await Student.findOne({ where: { student_id: data.studentId } });

				const formattedData = {
                    email: data.mail.trim(),
                    student_id: data.studentId,
                    first_name: data.studentFirstName,
                    last_name: data.studentLastName,
                    date_of_birth: data.birthday,
                    gender: data.gender,
                    address: data.address,
                    parents_phone_number: data.parentsPhoneNumber,
                    phone: data.phoneNumber,
                    enrollment_date: data.jduDate,
                    partner_university_enrollment_date: data.partnerUniversityEnrollmentDate,
                    semester: data.semester,
                    student_status: data.studentStatus,
                    partner_university: data.partnerUniversity,
                    kintone_id: data.kintone_id_value,
                    world_language_university_credits: Number(data.worldLanguageUniversityCredits) || 0,
                    business_skills_credits: Number(data.businessSkillsCredits) || 0,
                    japanese_employment_credits: Number(data.japaneseEmploymentCredits) || 0,
                    liberal_arts_education_credits: Number(data.liberalArtsEducationCredits) || 0,
                    total_credits: Number(data.totalCredits) || 0,
                    specialized_education_credits: Number(data.specializedEducationCredits) || 0,
                    partner_university_credits: Number(data.partnerUniversityCredits) || 0,
                    jlpt: data.jlpt,
                    jdu_japanese_certification: data.jdu_japanese_certification,
                    ielts: data.ielts,
                    japanese_speech_contest: data.japanese_speech_contest,
                    it_contest: data.it_contest,
                };
                
                // Agar talaba yangi bo'lsa yoki aktiv bo'lmasa, parol yaratamiz va email ro'yxatiga qo'shamiz
                if (!existingStudent || (data.semester > 0 && !existingStudent.active)) {
                    const password = generatePassword.generate({ length: 12, numbers: true, symbols: false, uppercase: true });
                    formattedData.password = password; // Parolni xeshlash model ichidagi hook'da bajariladi
                    formattedData.active = true;

                    // >>> O'ZGARISH: Emailni darhol jo'natmaymiz! Faqat vazifani tayyorlab, ro'yxatga qo'shamiz. <<<
                    emailTasks.push(formatStudentWelcomeEmail(
                        formattedData.email,
                        password,
                        formattedData.first_name,
                        formattedData.last_name
                    ));
                }

                upsertPromises.push(Student.upsert(formattedData));
            }

            // Barcha talabalarni bazaga yozib olamiz
            await Promise.all(upsertPromises);
            console.log(`${upsertPromises.length} ta talaba ma'lumotlari DBda yangilandi/yaratildi.`);
            
            // >>> O'ZGARISH: Tayyor bo'lgan email vazifalari ro'yxatini qaytaramiz <<<
            return emailTasks;

        } catch (error) {
            console.error("syncStudentData jarayonida jiddiy xatolik:", error);
            throw error;
        }
    }
	

	static async getStudentsWithPendingDrafts() {
		try {
			const students = await Student.findAll({
				include: [
					{
						model: Draft,
						as: 'drafts',
						where: { status: 'pending' }, // status = "pending" filter
					},
				],
			})
			return students
		} catch (error) {
			throw error
		}
	}
}

module.exports = StudentService
