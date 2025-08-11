// services/studentService.js
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const generatePassword = require('generate-password')
const { Student, Draft, Bookmark, sequelize } = require('../models')
const DraftService = require('./draftService')
const kintoneCreditDetailsService = require('./kintoneCreditDetailsService')

const { formatStudentWelcomeEmail } = require('../utils/emailToStudent')
const { sendBulkEmails } = require('../utils/emailService')

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

	// static async getAllStudents(filter, recruiterId, onlyBookmarked, userType) {
	// 	try {
	// 		// console.log('Received filter:', filter);

	// 		const semesterMapping = {
	// 			'1年生': ['1', '2'],
	// 			'2年生': ['3', '4'],
	// 			'3年生': ['5', '6'],
	// 			'4年生': ['7', '8', '9'],
	// 		}
	// 		const getSemesterNumbers = term => semesterMapping[term] || []
	// 		if (filter && filter.semester) {
	// 			filter.semester = filter.semester.flatMap(term =>
	// 				getSemesterNumbers(term)
	// 			)
	// 		}

	// 		let query = {}
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
	// 			'student_id',
	// 		]

	// 		if (!filter || typeof filter !== 'object') {
	// 			filter = {}
	// 		}

	// 		Object.keys(filter).forEach(key => {
	// 			if (filter[key]) {
	// 				// console.log(`Processing key: ${key}, value: ${filter[key]}`);
	// 				if (key === 'search') {
	// 					const searchValue = String(filter[key])
	// 					// console.log('Search value:', searchValue);
	// 					querySearch[Op.or] = searchableColumns.map(column => {
	// 						// console.log(`Building condition for column: ${column}`);
	// 						if (['skills', 'it_skills'].includes(column)) {
	// 							return {
	// 								[Op.or]: [
	// 									{
	// 										[column]: {
	// 											'上級::text': { [Op.iLike]: `%${searchValue}%` },
	// 										},
	// 									},
	// 									{
	// 										[column]: {
	// 											'中級::text': { [Op.iLike]: `%${searchValue}%` },
	// 										},
	// 									},
	// 									{
	// 										[column]: {
	// 											'初級::text': { [Op.iLike]: `%${searchValue}%` },
	// 										},
	// 									},
	// 								],
	// 							}
	// 						} else if (column === 'student_id') {
	// 							return { [column]: { [Op.iLike]: `%${searchValue}%` } } // Student ID uchun qisman moslik
	// 						} else {
	// 							return { [column]: { [Op.iLike]: `%${searchValue}%` } }
	// 						}
	// 					})
	// 				} else if (key === 'skills' || key === 'it_skills') {
	// 					queryOther[Op.and].push({
	// 						[Op.or]: [
	// 							{ [key]: { '上級::text': { [Op.iLike]: `%${filter[key]}%` } } },
	// 							{ [key]: { '中級::text': { [Op.iLike]: `%${filter[key]}%` } } },
	// 							{ [key]: { '初級::text': { [Op.iLike]: `%${filter[key]}%` } } },
	// 						],
	// 					})
	// 				} else if (key === 'partner_university_credits') {
	// 					const credits = Number(filter[key])
	// 					if (!isNaN(credits)) {
	// 						queryOther[key] = { [Op.lt]: credits }
	// 					}
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
	// 					if (Array.isArray(filter[key])) {
	// 						queryOther[Op.and].push({
	// 							[Op.or]: filter[key].map(level => ({
	// 								[key]: { [Op.iLike]: `%${level}"%` },
	// 							})),
	// 						})
	// 					}
	// 				} else if (Array.isArray(filter[key])) {
	// 					queryOther[key] = { [Op.in]: filter[key] }
	// 				} else if (typeof filter[key] === 'string') {
	// 					queryOther[key] = { [Op.iLike]: `%${filter[key]}%` }
	// 				} else {
	// 					queryOther[key] = filter[key]
	// 				}
	// 			}
	// 		})

	// 		if (!query[Op.and]) {
	// 			query[Op.and] = []
	// 		}

	// 		query[Op.and].push(querySearch, queryOther, { active: true })

	// 		// Only apply visibility filter for Recruiter users
	// 		if (userType === 'Recruiter') {
	// 			query[Op.and].push({ visibility: true })
	// 		}

	// 		// Only apply bookmark filter if both conditions are met
	// 		if (onlyBookmarked === 'true' && recruiterId) {
	// 			query[Op.and].push(
	// 				sequelize.literal(`EXISTS (
	// 			SELECT 1
	// 			FROM "Bookmarks" AS "Bookmark"
	// 			WHERE "Bookmark"."studentId" = "Student"."id"
	// 			  AND "Bookmark"."recruiterId" = ${sequelize.escape(recruiterId)}
	// 		  )`)
	// 			)
	// 		}

	// 		// Build attributes for the query
	// 		const attributes = {
	// 			include: [],
	// 		}

	// 		// Only include bookmark status if recruiterId is provided
	// 		if (recruiterId) {
	// 			attributes.include.push([
	// 				sequelize.literal(`EXISTS (
	// 					SELECT 1
	// 					FROM "Bookmarks" AS "Bookmark"
	// 					WHERE "Bookmark"."studentId" = "Student"."id"
	// 					  AND "Bookmark"."recruiterId" = ${sequelize.escape(recruiterId)}
	// 				  )`),
	// 				'isBookmarked',
	// 			])
	// 		}

	// 		// console.log('Generated Query:', JSON.stringify(query, null, 2));
	// 		const students = await Student.findAll({
	// 			where: query,
	// 			attributes: attributes,
	// 			include: [
	// 				{
	// 					model: Draft,
	// 					as: 'draft',
	// 					attributes: [
	// 						'id',
	// 						'status',
	// 						'submit_count',
	// 						'created_at',
	// 						'updated_at',
	// 						'profile_data', // Include profile_data to get draft information
	// 					],
	// 					required: false, // LEFT JOIN so students without drafts are still included
	// 				},
	// 			],
	// 		})

	// 		// Merge draft data with student data if draft exists and is NOT in 'draft' status
	// 		const studentsWithDraftData = students.map(student => {
	// 			const studentJson = student.toJSON()

	// 			// Only merge draft data if it exists and status is NOT 'draft'
	// 			// Draft status data should only be visible to the student themselves
	// 			if (
	// 				studentJson.draft &&
	// 				studentJson.draft.profile_data &&
	// 				studentJson.draft.status !== 'draft'
	// 			) {
	// 				const draftData = studentJson.draft.profile_data

	// 				// Merge draft fields into the main student object
	// 				const fieldsToMerge = [
	// 					'deliverables',
	// 					'gallery',
	// 					'self_introduction',
	// 					'hobbies',
	// 					'hobbies_description',
	// 					'special_skills_description',
	// 					'other_information',
	// 					'it_skills',
	// 					'skills',
	// 				]

	// 				fieldsToMerge.forEach(field => {
	// 					if (draftData[field] !== undefined) {
	// 						studentJson[field] = draftData[field]
	// 					}
	// 				})
	// 			}

	// 			return studentJson
	// 		})

	// 		return studentsWithDraftData
	// 	} catch (error) {
	// 		console.error('Error in getAllStudents:', error.message, error.stack)
	// 		// Return empty array instead of throwing to prevent 500 errors
	// 		return []
	// 	}
	// }

	static async getAllStudents(
		filter,
		recruiterId,
		onlyBookmarked,
		userType,
		sortOptions = {}
	) {
		try {
			// 1. FILTRLASH MANTIG'I (o'zgarishsiz qoladi)
			const semesterMapping = {
				'1年生': ['1', '2'],
				'2年生': ['3', '4'],
				'3年生': ['5', '6'],
				'4年生': ['7', '8', '9'],
			}
			if (filter && filter.semester) {
				filter.semester = filter.semester.flatMap(
					term => semesterMapping[term] || []
				)
			}

			let query = {}
			let querySearch = {}
			let queryOther = { [Op.and]: [] }

			if (!filter || typeof filter !== 'object') {
				filter = {}
			}

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
			]

			Object.keys(filter).forEach(key => {
				if (filter[key]) {
					if (key === 'search') {
						const searchValue = String(filter[key])
						querySearch[Op.or] = searchableColumns.map(column => {
							if (['skills', 'it_skills'].includes(column)) {
								return {
									[Op.or]: [
										{
											[column]: {
												'上級::text': { [Op.iLike]: `%${searchValue}%` },
											},
										},
										{
											[column]: {
												'中級::text': { [Op.iLike]: `%${searchValue}%` },
											},
										},
										{
											[column]: {
												'初級::text': { [Op.iLike]: `%${searchValue}%` },
											},
										},
									],
								}
							}
							return { [column]: { [Op.iLike]: `%${searchValue}%` } }
						})
					} else if (['skills', 'it_skills'].includes(key)) {
						queryOther[Op.and].push({
							[Op.or]: [
								{ [key]: { '上級::text': { [Op.iLike]: `%${filter[key]}%` } } },
								{ [key]: { '中級::text': { [Op.iLike]: `%${filter[key]}%` } } },
								{ [key]: { '初級::text': { [Op.iLike]: `%${filter[key]}%` } } },
							],
						})
					} else if (key === 'partner_university_credits') {
						const credits = Number(filter[key])
						if (!isNaN(credits)) {
							queryOther[key] = { [Op.lt]: credits }
						}
					} else if (key === 'other_information') {
						if (filter[key] === '有り') {
							queryOther['other_information'] = { [Op.ne]: null }
						} else if (filter[key] === '無し') {
							queryOther['other_information'] = { [Op.is]: null }
						}
					} else if (
						['jlpt', 'ielts', 'jdu_japanese_certification'].includes(key)
					) {
						if (Array.isArray(filter[key])) {
							queryOther[Op.and].push({
								[Op.or]: filter[key].map(level => ({
									[key]: { [Op.iLike]: `%${level}"%` },
								})),
							})
						}
					} else if (Array.isArray(filter[key])) {
						queryOther[key] = { [Op.in]: filter[key] }
					} else if (typeof filter[key] === 'string') {
						queryOther[key] = { [Op.iLike]: `%${filter[key]}%` }
					} else {
						queryOther[key] = filter[key]
					}
				}
			})

			query[Op.and] = [querySearch, queryOther, { active: true }]
			if (userType === 'Recruiter') {
				query[Op.and].push({ visibility: true })
			}
			if (onlyBookmarked === 'true' && recruiterId) {
				query[Op.and].push(
					sequelize.literal(
						`EXISTS (SELECT 1 FROM "Bookmarks" AS "Bookmark" WHERE "Bookmark"."studentId" = "Student"."id" AND "Bookmark"."recruiterId" = ${sequelize.escape(
							recruiterId
						)})`
					)
				)
			}

			// 2. SARALASH MANTIG'I (YANGI QISM)
			let order = []
			const { sortBy, sortOrder } = sortOptions
			const validSortOrder =
				sortOrder && ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
					? sortOrder.toUpperCase()
					: 'ASC'

			// Frontend'dan kelgan nomni DB'dagi ustun nomiga o'girish (xavfsizlik uchun)
			const columnMap = {
				name: ['first_name', 'last_name'], // Ism bo'yicha saralash uchun ikkita ustun
				student_id: ['student_id'],
				graduation_year: ['graduation_year'],
				age: ['date_of_birth'],
				email: ['email'],
			}

			const dbColumns = columnMap[sortBy]

			if (dbColumns) {
				if (sortBy === 'age') {
					// Yosh bo'yicha o'sish tartibi -> tug'ilgan sana bo'yicha kamayish tartibi
					const ageSortOrder = validSortOrder === 'ASC' ? 'DESC' : 'ASC'
					order.push([dbColumns[0], ageSortOrder])
				} else {
					dbColumns.forEach(column => order.push([column, validSortOrder]))
				}
			} else {
				order.push(['student_id', 'ASC']) // Standart saralash
			}

			// 3. MA'LUMOTLARNI OLISH (order parametri qo'shildi)
			const attributes = {}
			if (recruiterId) {
				attributes.include = [
					[
						sequelize.literal(
							`EXISTS (SELECT 1 FROM "Bookmarks" AS "Bookmark" WHERE "Bookmark"."studentId" = "Student"."id" AND "Bookmark"."recruiterId" = ${sequelize.escape(
								recruiterId
							)})`
						),
						'isBookmarked',
					],
				]
			}

			const students = await Student.findAll({
				where: query,
				attributes,
				include: [
					{
						model: Draft,
						as: 'draft',
						attributes: ['id', 'status', 'profile_data'],
						required: false,
					},
				],
				order: order, // <<<<<<<<<<<<<<<< SARALASH SHU YERDA QO'LLANILADI
			})

			// 4. DRAFT MA'LUMOTLARINI BIRLASHTIRISH (o'zgarishsiz qoladi)
			const studentsWithDraftData = students.map(student => {
				const studentJson = student.toJSON()
				if (
					studentJson.draft &&
					studentJson.draft.profile_data &&
					studentJson.draft.status !== 'draft'
				) {
					const draftData = studentJson.draft.profile_data
					const fieldsToMerge = [
						'deliverables',
						'gallery',
						'self_introduction',
						'hobbies',
						'hobbies_description',
						'special_skills_description',
						'other_information',
						'it_skills',
						'skills',
					]
					fieldsToMerge.forEach(field => {
						if (draftData[field] !== undefined) {
							studentJson[field] = draftData[field]
						}
					})
				}
				return studentJson
			})

			return studentsWithDraftData
		} catch (error) {
			console.error('Error in getAllStudents:', error.message, error.stack)
			return []
		}
	}

	// Service method to retrieve a student by ID
	static async getStudentById(
		studentId,
		password = false,
		requesterId = null,
		requesterRole = null
	) {
		try {
			let excluded = ['createdAt', 'updatedAt']
			if (!password) {
				excluded.push('password')
			}
			const student = await Student.findByPk(studentId, {
				attributes: { exclude: excluded },
				include: [
					{
						model: Draft,
						as: 'draft',
						attributes: [
							'id',
							'status',
							'submit_count',
							'created_at',
							'updated_at',
							'profile_data', // Include profile_data to get draft information
						],
						required: false, // LEFT JOIN so students without drafts are still included
					},
				],
			})
			if (!student) {
				throw new Error('Student not found')
			}

			// Convert to JSON
			const studentJson = student.toJSON()

			// Determine if draft data should be merged
			let shouldMergeDraft = false

			if (studentJson.draft && studentJson.draft.profile_data) {
				// Check if draft should be visible based on status and requester
				if (studentJson.draft.status === 'draft') {
					// Draft status: only visible to the student themselves
					// This includes when an approved profile is edited but not yet submitted
					// Debug: Check if this is the student viewing their own profile
					console.log('Draft visibility check:', {
						requesterRole,
						requesterId,
						studentDbId: student.id,
						isMatch: requesterId === student.id,
					})

					if (
						requesterRole === 'Student' &&
						requesterId &&
						student.id === requesterId
					) {
						shouldMergeDraft = true
					}
					// Other users (Staff, Admin, Recruiter) cannot see draft changes
				} else if (
					studentJson.draft.status === 'submitted' ||
					studentJson.draft.status === 'approved' ||
					studentJson.draft.status === 'disapproved' ||
					studentJson.draft.status === 'resubmission_required'
				) {
					// Non-draft statuses: visible to authorized users
					shouldMergeDraft = true
				}
			}

			// Merge draft data if conditions are met
			if (shouldMergeDraft) {
				const draftData = studentJson.draft.profile_data

				// Merge draft fields into the main student object
				const fieldsToMerge = [
					'deliverables',
					'gallery',
					'self_introduction',
					'hobbies',
					'hobbies_description',
					'special_skills_description',
					'other_information',
					'it_skills',
					'skills',
				]

				fieldsToMerge.forEach(field => {
					if (draftData[field] !== undefined) {
						studentJson[field] = draftData[field]
					}
				})
			}

			return studentJson
		} catch (error) {
			throw error
		}
	}

	// Service method to retrieve a student by student_id
	static async getStudentByStudentId(
		studentId,
		password = false,
		requesterId = null,
		requesterRole = null
	) {
		try {
			let excluded = ['createdAt', 'updatedAt']
			if (!password) {
				excluded.push('password')
			}

			const student = await Student.findOne({
				where: { student_id: studentId }, // Search by student_id instead of id
				attributes: { exclude: excluded },
				include: [
					{
						model: Draft,
						as: 'draft',
						attributes: [
							'id',
							'status',
							'submit_count',
							'created_at',
							'updated_at',
							'profile_data', // Include profile_data to get draft information
						],
						required: false, // LEFT JOIN so students without drafts are still included
					},
				],
			})

			if (!student) {
				throw new Error('Student not found')
			}

			// Convert to JSON
			const studentJson = student.toJSON()

			// Determine if draft data should be merged
			let shouldMergeDraft = false

			if (studentJson.draft && studentJson.draft.profile_data) {
				// Check if draft should be visible based on status and requester
				if (studentJson.draft.status === 'draft') {
					// Draft status: only visible to the student themselves
					// This includes when an approved profile is edited but not yet submitted
					// Debug: Check if this is the student viewing their own profile
					console.log('Draft visibility check:', {
						requesterRole,
						requesterId,
						studentDbId: student.id,
						isMatch: requesterId === student.id,
					})

					if (
						requesterRole === 'Student' &&
						requesterId &&
						student.id === requesterId
					) {
						shouldMergeDraft = true
					}
					// Other users (Staff, Admin, Recruiter) cannot see draft changes
				} else if (
					studentJson.draft.status === 'submitted' ||
					studentJson.draft.status === 'approved' ||
					studentJson.draft.status === 'disapproved' ||
					studentJson.draft.status === 'resubmission_required'
				) {
					// Non-draft statuses: visible to authorized users
					shouldMergeDraft = true
				}
			}

			// Merge draft data if conditions are met
			if (shouldMergeDraft) {
				const draftData = studentJson.draft.profile_data

				// Merge draft fields into the main student object
				const fieldsToMerge = [
					'deliverables',
					'gallery',
					'self_introduction',
					'hobbies',
					'hobbies_description',
					'special_skills_description',
					'other_information',
					'it_skills',
					'skills',
				]

				fieldsToMerge.forEach(field => {
					if (draftData[field] !== undefined) {
						studentJson[field] = draftData[field]
					}
				})
			}

			return studentJson
		} catch (error) {
			throw error
		}
	}

	static async updateStudent(studentId, studentData) {
		try {
			console.log('StudentService.updateStudent called with:', {
				studentId,
				studentData,
			})

			// Always use student_id for lookup to be consistent with getStudentByStudentId
			const student = await Student.findOne({
				where: { student_id: studentId },
			})

			if (!student) {
				throw new Error('Student not found')
			}

			console.log('Found student:', student.dataValues)

			// If we're setting visibility to true, ensure we have the latest approved draft
			if (studentData.visibility === true) {
				// Check if we already have draft data in the request
				const hasDraftData =
					studentData.hasOwnProperty('self_introduction') ||
					studentData.hasOwnProperty('hobbies') ||
					studentData.hasOwnProperty('skills') ||
					studentData.hasOwnProperty('it_skills')

				console.log('Has draft data:', hasDraftData)

				// If no draft data provided, try to find the latest approved draft
				if (!hasDraftData) {
					const latestApprovedDraft =
						await DraftService.getLatestApprovedDraftByStudentId(
							student.student_id
						)

					console.log('Latest approved draft:', latestApprovedDraft)

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

						console.log('Merged student data with draft:', studentData)
					}
				}
			}

			console.log('Final student data to update:', studentData)

			// Update the student with the provided data
			await student.update(studentData)

			console.log('Student updated successfully, new data:', student.dataValues)

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
			const emailTasks = [] // Jo'natiladigan email vazifalari uchun massiv
			const upsertPromises = [] // DB'ga yozish uchun promise'lar massivi

			for (const data of studentData) {
				if (!data.studentId || !data.mail) continue

				const existingStudent = await Student.findOne({
					where: { student_id: data.studentId },
				})

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
					partner_university_enrollment_date:
						data.partnerUniversityEnrollmentDate,
					semester: data.semester,
					student_status: data.studentStatus,
					partner_university: data.partnerUniversity,
					graduation_year: data.graduationYear,
					graduation_season: data.graduationSeason,
					kintone_id: data.kintone_id_value,
					world_language_university_credits:
						Number(data.worldLanguageUniversityCredits) || 0,
					business_skills_credits: Number(data.businessSkillsCredits) || 0,
					japanese_employment_credits:
						Number(data.japaneseEmploymentCredits) || 0,
					liberal_arts_education_credits:
						Number(data.liberalArtsEducationCredits) || 0,
					total_credits: Number(data.totalCredits) || 0,
					specialized_education_credits:
						Number(data.specializedEducationCredits) || 0,
					partner_university_credits:
						Number(data.partnerUniversityCredits) || 0,
					jlpt: data.jlpt,
					jdu_japanese_certification: data.jdu_japanese_certification,
					ielts: data.ielts,
					japanese_speech_contest: data.japanese_speech_contest,
					it_contest: data.it_contest,
				}

				// Agar talaba yangi bo'lsa yoki aktiv bo'lmasa, parol yaratamiz va email ro'yxatiga qo'shamiz
				if (
					!existingStudent ||
					(data.semester > 0 && !existingStudent.active)
				) {
					const password = generatePassword.generate({
						length: 12,
						numbers: true,
						symbols: false,
						uppercase: true,
					})
					formattedData.password = password // Parolni xeshlash model ichidagi hook'da bajariladi
					formattedData.active = true

					// >>> O'ZGARISH: Emailni darhol jo'natmaymiz! Faqat vazifani tayyorlab, ro'yxatga qo'shamiz. <<<
					emailTasks.push(
						formatStudentWelcomeEmail(
							formattedData.email,
							password,
							formattedData.first_name,
							formattedData.last_name
						)
					)
				}

				// Upsert operatsiyasi
				if (!existingStudent) {
					// Yangi talaba uchun - barcha maydonlar bilan yaratamiz
					upsertPromises.push(Student.create(formattedData))
				} else {
					// Mavjud talaba uchun - parolni chiqarib, faqat boshqa maydonlarni yangilaymiz
					const { password, ...updateData } = formattedData
					upsertPromises.push(existingStudent.update(updateData))
				}
			}

			// Barcha talabalarni bazaga yozib olamiz
			await Promise.all(upsertPromises)
			console.log(
				`${upsertPromises.length} ta talaba ma'lumotlari DBda yangilandi/yaratildi.`
			)

			// >>> O'ZGARISH: Tayyor bo'lgan email vazifalari ro'yxatini qaytaramiz <<<
			return emailTasks
		} catch (error) {
			console.error('syncStudentData jarayonida jiddiy xatolik:', error)
			throw error
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

	// Get student IDs for autocomplete
	static async getStudentIds(search = '') {
		try {
			const { Op } = require('sequelize')
			const whereClause = search
				? {
						[Op.or]: [
							{ student_id: { [Op.iLike]: `%${search}%` } },
							{
								[Op.or]: [
									{ first_name: { [Op.iLike]: `%${search}%` } },
									{ last_name: { [Op.iLike]: `%${search}%` } },
								],
							},
						],
						active: true,
				  }
				: { active: true }

			const students = await Student.findAll({
				where: whereClause,
				attributes: ['student_id', 'first_name', 'last_name'],
				order: [['student_id', 'ASC']],
				limit: 10, // Limit to 10 suggestions
			})

			return students.map(student => ({
				student_id: student.student_id,
				name: `${student.first_name} ${student.last_name}`,
				display: `${student.student_id} - ${student.first_name} ${student.last_name}`,
			}))
		} catch (error) {
			throw error
		}
	}

	// Credit Details Methods
	static async updateStudentCreditDetails(studentId) {
		try {
			// Fetch credit details from Kintone
			const creditDetails =
				await kintoneCreditDetailsService.getCreditDetailsByStudentId(studentId)

			// Update student record with credit details
			const [updatedRowsCount] = await Student.update(
				{ credit_details: creditDetails },
				{ where: { student_id: studentId } }
			)

			if (updatedRowsCount === 0) {
				throw new Error('Student not found or no update needed')
			}

			// Calculate total credits and update if needed
			const totalCredits =
				kintoneCreditDetailsService.calculateTotalCredits(creditDetails)
			await Student.update(
				{ total_credits: totalCredits },
				{ where: { student_id: studentId } }
			)

			console.log(
				`✅ Updated credit details for student ${studentId}: ${creditDetails.length} records, ${totalCredits} total credits`
			)

			return {
				studentId,
				creditDetailsCount: creditDetails.length,
				totalCredits,
				creditDetails,
			}
		} catch (error) {
			console.error(
				`❌ Error updating credit details for student ${studentId}:`,
				error.message
			)
			throw error
		}
	}

	static async getStudentWithCreditDetails(studentId) {
		try {
			const student = await this.getStudentByStudentId(studentId)
			if (!student) {
				throw new Error('Student not found')
			}

			// Always fetch fresh data from Kintone for real-time updates
			console.log(
				`🔄 Fetching fresh credit details from Kintone for student ${studentId}`
			)
			await this.updateStudentCreditDetails(studentId)
			// Fetch updated student data
			const updatedStudent = await this.getStudentByStudentId(studentId)

			// Calculate total credits from credit details (like Sanno University)
			const totalCredits = kintoneCreditDetailsService.calculateTotalCredits(
				updatedStudent.credit_details || []
			)

			return {
				...updatedStudent,
				totalCredits,
				creditDetails: updatedStudent.credit_details || [],
			}
		} catch (error) {
			throw error
		}
	}

	static async syncAllStudentCreditDetails() {
		try {
			const students = await Student.findAll({
				attributes: ['student_id'],
				where: { active: true },
			})

			const results = []
			for (const student of students) {
				try {
					const result = await this.updateStudentCreditDetails(
						student.student_id
					)
					results.push(result)
				} catch (error) {
					console.error(
						`Failed to sync credit details for ${student.student_id}:`,
						error.message
					)
					results.push({
						studentId: student.student_id,
						error: error.message,
					})
				}
			}

			console.log(`✅ Sync completed for ${students.length} students`)
			return results
		} catch (error) {
			throw error
		}
	}
}

module.exports = StudentService
