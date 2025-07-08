// const { Op } = require('sequelize')
// const { Draft, Student, sequelize } = require('../models')
// const _ = require('lodash') // Chuqur solishtirish uchun

// /**
//  * Ikki ob'ektni solishtirib, o'zgargan maydonlar (key) ro'yxatini qaytaradi.
//  * @param {object} newData - Yangi ma'lumotlar obyekti
//  * @param {object} oldData - Eski ma'lumotlar obyekti
//  * @returns {string[]} O'zgargan maydonlar ro'yxati
//  */
// const getChangedKeys = (newData, oldData) => {
//     if (!oldData) return Object.keys(newData);
//     const allKeys = _.union(Object.keys(newData), Object.keys(oldData));
    
//     return allKeys.filter(key => {
//         // _.isEqual ichma-ich joylashgan obyekt va massivlarni ham to'g'ri solishtiradi
//         return !_.isEqual(newData[key], oldData[key]);
//     });
// };

// class DraftService {
// 	static async getAll(filter) {
// 		try {
// 			console.log(
// 				'DraftService.getAll called with filter:',
// 				JSON.stringify(filter, null, 2)
// 			)

// 			const semesterMapping = {
// 				'1年生': ['1', '2'],
// 				'2年生': ['3', '4'],
// 				'3年生': ['5', '6'],
// 				'4年生': ['7', '8', '9'],
// 			}

// 			const statusMapping = {
// 				未確認: 'submitted',
// 				確認中: 'checking',
// 				要修正: 'resubmission_required',
// 				確認済: 'approved',
// 			}

// 			// New mapping for approval_status filter
// 			const approvalStatusMapping = {
// 				未承認: ['draft', 'submitted', 'checking'],
// 				承認済: ['approved'],
// 				差し戻し: ['resubmission_required', 'disapproved'],
// 			}

// 			// New mapping for visibility filter
// 			const visibilityMapping = {
// 				公開: true,
// 				非公開: false,
// 			}

// 			const getSemesterNumbers = term => semesterMapping[term] || []

// 			if (filter.semester) {
// 				filter.semester = filter.semester.flatMap(term =>
// 					getSemesterNumbers(term)
// 				)
// 			}

// 			let query = {}
// 			let querySearch = {}
// 			let queryOther = {}
// 			queryOther[Op.and] = []

// 			// Process visibility filter before the main loop
// 			if (
// 				filter.visibility &&
// 				Array.isArray(filter.visibility) &&
// 				filter.visibility.length > 0
// 			) {
// 				const visibilityValues = filter.visibility
// 					.map(val => visibilityMapping[val])
// 					.filter(val => val !== undefined)
// 				if (visibilityValues.length) {
// 					queryOther['visibility'] = { [Op.in]: visibilityValues }
// 				}
// 				delete filter.visibility // Remove to avoid double handling
// 			}

// 			const searchableColumns = [
// 				'email',
// 				'first_name',
// 				'last_name',
// 				'student_id',
// 				'self_introduction',
// 				'hobbies',
// 				'jlpt',
// 			]

// 			let draftStatusConditions = []
// 			let approvalStatusConditions = []

// 			// Process approval_status filter
// 			if (
// 				filter.approval_status &&
// 				Array.isArray(filter.approval_status) &&
// 				filter.approval_status.length > 0
// 			) {
// 				filter.approval_status.forEach(approvalStatus => {
// 					if (approvalStatusMapping[approvalStatus]) {
// 						approvalStatusConditions.push(
// 							...approvalStatusMapping[approvalStatus]
// 						)
// 					}
// 				})
// 				delete filter.approval_status // Remove to avoid double handling
// 			}

// 			Object.keys(filter).forEach(key => {
// 				if (filter[key] && key !== 'draft_status') {
// 					if (key === 'search') {
// 						let searchConditions = searchableColumns.map(column => ({
// 							[column]: { [Op.iLike]: `%${filter[key]}%` },
// 						}))

// 						// Add JSONB search conditions for skills and it_skills using sequelize.where
// 						searchConditions.push(
// 							sequelize.where(
// 								sequelize.cast(sequelize.col('Student.skills'), 'TEXT'),
// 								{ [Op.iLike]: `%${filter[key]}%` }
// 							)
// 						)
// 						searchConditions.push(
// 							sequelize.where(
// 								sequelize.cast(sequelize.col('Student.it_skills'), 'TEXT'),
// 								{ [Op.iLike]: `%${filter[key]}%` }
// 							)
// 						)

// 						querySearch[Op.or] = searchConditions
// 					} else if (key === 'skills' || key === 'it_skills') {
// 						queryOther[Op.and].push({
// 							[Op.or]: [
// 								{ [key]: { '上級::text': { [Op.iLike]: `%${filter[key]}%` } } },
// 								{ [key]: { '中級::text': { [Op.iLike]: `%${filter[key]}%` } } },
// 								{ [key]: { '初級::text': { [Op.iLike]: `%${filter[key]}%` } } },
// 							],
// 						})
// 					} else if (key === 'partner_university_credits') {
// 						queryOther[key] = { [Op.lt]: Number(filter[key]) }
// 					} else if (key === 'other_information') {
// 						queryOther[key] =
// 							filter[key] === '有り' ? { [Op.ne]: null } : { [Op.is]: null }
// 					} else if (
// 						key === 'jlpt' ||
// 						key === 'ielts' ||
// 						key === 'jdu_japanese_certification'
// 					) {
// 						queryOther[Op.and].push({
// 							[Op.or]: filter[key].map(level => ({
// 								[key]: { [Op.iLike]: `%${level}"%` },
// 							})),
// 						})
// 					} else if (Array.isArray(filter[key])) {
// 						queryOther[key] = { [Op.in]: filter[key] }
// 					} else if (typeof filter[key] === 'string') {
// 						queryOther[key] = { [Op.like]: `%${filter[key]}%` }
// 					} else {
// 						queryOther[key] = filter[key]
// 					}
// 				}

// 				if (filter[key] && key === 'draft_status') {
// 					const filteredStatuses = filter[key].map(
// 						status => statusMapping[status]
// 					)
// 					draftStatusConditions.push(...filteredStatuses)
// 				}
// 			})

// 			if (!query[Op.and]) {
// 				query[Op.and] = []
// 			}

// 			query[Op.and].push(querySearch, queryOther, { active: true })

// 			// Build draft where conditions
// 			let draftWhere = {
// 				status: { [Op.ne]: 'draft' },
// 			}

// 			// Apply status filters to draft where conditions
// 			if (
// 				draftStatusConditions.length > 0 &&
// 				approvalStatusConditions.length > 0
// 			) {
// 				// If both filters exist, use OR
// 				draftWhere.status = {
// 					[Op.or]: [
// 						{ [Op.in]: draftStatusConditions },
// 						{ [Op.in]: approvalStatusConditions },
// 					],
// 				}
// 			} else if (draftStatusConditions.length > 0) {
// 				draftWhere.status = { [Op.in]: draftStatusConditions }
// 			} else if (approvalStatusConditions.length > 0) {
// 				draftWhere.status = { [Op.in]: approvalStatusConditions }
// 			}

// 			console.log(
// 				'Draft where conditions:',
// 				JSON.stringify(draftWhere, null, 2)
// 			)
// 			console.log('Student query conditions:', JSON.stringify(query, null, 2))

// 			const students = await Student.findAll({
// 				where: query,
// 				include: [
// 					{
// 						model: Draft,
// 						as: 'draft',
// 						required: true,
// 						where: {
// 							...draftWhere,
// 							updated_at: {
// 								[Op.eq]: sequelize.literal(`
//                               (SELECT MAX("updated_at") 
//                               FROM "Drafts" AS d
//                               WHERE d.student_id = "Student".student_id
//                               AND d.status != 'draft')
//                           `),
// 							},
// 						},
// 					},
// 				],
// 			})

// 			return students
// 		} catch (error) {
// 			console.error('Error in DraftService.getAll:', error)
// 			console.error('Error details:', {
// 				message: error.message,
// 				sql: error.sql,
// 				parameters: error.parameters,
// 			})
// 			throw error
// 		}
// 	}

// 	static async create(data) {
// 		try {
// 			const { student_id, profile_data, comments, status, reviewed_by } = data

// 			// Studentning mavjud draftini tekshirish
// 			let draft = await Draft.findOne({ where: { student_id } })

// 			/// agar draftni haqiqiy versiyasi public bolsa ushani false qilish
// 			await Student.update({ visibility: false }, { where: { student_id } })

// 			if (draft) {
// 				// Agar draft mavjud bo‘lsa, uni yangilaymiz
// 				draft.profile_data = profile_data
// 				draft.comments = comments
// 				draft.status = status
// 				draft.reviewed_by = reviewed_by
// 				await draft.save()
// 				return { message: 'Draft updated successfully', draft }
// 			} else {
// 				// Agar draft mavjud bo‘lmasa, yangi draft yaratamiz
// 				draft = await Draft.create({ student_id, profile_data })
// 				return { message: 'Draft created successfully', draft }
// 			}
// 		} catch (error) {
// 			throw new Error(error.message)
// 		}
// 	}

// 	// get draft for ID
// 	static async getById(id) {
// 		return Draft.findByPk(id)
// 	}

// 	static async getByStudentId(student_id) {
// 		return Draft.findAll({
// 			where: { student_id },
// 			order: [['created_at', 'DESC']], // Sort by created_at in descending order
// 		})
// 	}
// 	// update draft
// 	static async update(id, data) {
// 		const draft = await Draft.findByPk(id)
// 		if (!draft) {
// 			throw new Error('Draft not found')
// 		}
// 		return draft.update(data)
// 	}

// 	// Delete draft
// 	static async delete(id) {
// 		const draft = await Draft.findByPk(id)
// 		if (!draft) {
// 			throw new Error('Draft not found')
// 		}
// 		return draft.destroy()
// 	}

// 	static async getLatestApprovedDraftByStudentId(studentId) {
// 		return Draft.findOne({
// 			where: {
// 				student_id: studentId,
// 				status: 'approved', // Only fetch approved drafts
// 			},
// 			order: [['updated_at', 'DESC']], // Get the latest updated draft
// 		})
// 	}

// 	static async getDraftByStudentId(studentId) {
// 		try {
// 			const student = await Student.findOne({
// 				where: { student_id: studentId },
// 				include: [
// 					{
// 						model: Draft,
// 						as: 'draft',
// 						required: false,
// 					},
// 				],
// 			})

// 			if (!student) {
// 				throw new Error('Student not found')
// 			}

// 			return student
// 		} catch (error) {
// 			console.error('Error getting student with draft:', error)
// 			throw error
// 		}
// 	}
// }

// module.exports = DraftService


const { Draft, Student, sequelize } = require('../models');
const _ = require('lodash'); // Used for deep object comparison
const { Op } = require('sequelize')

/**
 * Compares two objects and returns an array of keys that have changed.
 * @param {object} newData - The new data object.
 * @param {object} oldData - The old data object.
 * @returns {string[]} An array of changed keys.
 */
const getChangedKeys = (newData, oldData) => {
    if (!oldData) return Object.keys(newData);
    const allKeys = _.union(Object.keys(newData), Object.keys(oldData));
    
    return allKeys.filter(key => {
        // _.isEqual provides deep comparison for nested objects and arrays
        return !_.isEqual(newData[key], oldData[key]);
    });
};

class DraftService {


	static async getAll(filter) {
		try {
			// console.log(filter)

			const semesterMapping = {
				'1年生': ['1', '2'],
				'2年生': ['3', '4'],
				'3年生': ['5', '6'],
				'4年生': ['7', '8', '9'],
			}

			const statusMapping = {
				未確認: 'submitted',
				確認中: 'checking',
				要修正: 'resubmission_required',
				確認済: 'approved',
			}

			// New mapping for approval_status filter
			const approvalStatusMapping = {
				未承認: ['draft', 'submitted', 'checking'],
				承認済: ['approved'],
				差し戻し: ['resubmission_required', 'disapproved'],
			}

			// New mapping for visibility filter
			const visibilityMapping = {
				公開: true,
				非公開: false,
			}

			const getSemesterNumbers = term => semesterMapping[term] || []

			if (filter.semester) {
				filter.semester = filter.semester.flatMap(term =>
					getSemesterNumbers(term)
				)
			}

			let query = {}
			let querySearch = {}
			let queryOther = {}
			queryOther[Op.and] = []

			// Process visibility filter before the main loop
			if (
				filter.visibility &&
				Array.isArray(filter.visibility) &&
				filter.visibility.length > 0
			) {
				const visibilityValues = filter.visibility
					.map(val => visibilityMapping[val])
					.filter(val => val !== undefined)
				if (visibilityValues.length) {
					queryOther['visibility'] = { [Op.in]: visibilityValues }
				}
				delete filter.visibility // Remove to avoid double handling
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
			]
			let statusFilter = ''
			let approvalStatusFilter = '' // New filter for approval_status

			// Process approval_status filter
			if (
				filter.approval_status &&
				Array.isArray(filter.approval_status) &&
				filter.approval_status.length > 0
			) {
				const draftStatuses = []
				filter.approval_status.forEach(approvalStatus => {
					if (approvalStatusMapping[approvalStatus]) {
						draftStatuses.push(...approvalStatusMapping[approvalStatus])
					}
				})

				approvalStatusFilter = draftStatuses.length
					? `AND d.status IN (${draftStatuses.map(s => `'${s}'`).join(', ')})`
					: ''

				delete filter.approval_status // Remove to avoid double handling
			}

			Object.keys(filter).forEach(key => {
				if (filter[key] && key !== 'draft_status') {
					if (key === 'search') {
						querySearch[Op.or] = searchableColumns.map(column => ({
							[column]: { [Op.iLike]: `%${filter[key]}%` },
						}))
					} else if (key === 'skills' || key === 'it_skills') {
						queryOther[Op.and].push({
							[Op.or]: [
								{ [key]: { '上級::text': { [Op.iLike]: `%${filter[key]}%` } } },
								{ [key]: { '中級::text': { [Op.iLike]: `%${filter[key]}%` } } },
								{ [key]: { '初級::text': { [Op.iLike]: `%${filter[key]}%` } } },
							],
						})
					} else if (key === 'partner_university_credits') {
						queryOther[key] = { [Op.lt]: Number(filter[key]) }
					} else if (key === 'other_information') {
						queryOther[key] =
							filter[key] === '有り' ? { [Op.ne]: null } : { [Op.is]: null }
					} else if (
						key === 'jlpt' ||
						key === 'ielts' ||
						key === 'jdu_japanese_certification'
					) {
						queryOther[Op.and].push({
							[Op.or]: filter[key].map(level => ({
								[key]: { [Op.iLike]: `%${level}"%` },
							})),
						})
					} else if (Array.isArray(filter[key])) {
						queryOther[key] = { [Op.in]: filter[key] }
					} else if (typeof filter[key] === 'string') {
						queryOther[key] = { [Op.like]: `%${filter[key]}%` }
					} else {
						queryOther[key] = filter[key]
					}
				}

				if (filter[key] && key === 'draft_status') {
					const filteredStatuses = filter[key].map(
						status => statusMapping[status]
					)
					statusFilter = filteredStatuses.length
						? `AND d.status IN (${filteredStatuses.map(s => `'${s}'`).join(', ')})`
						: ''
				}
			})

			if (!query[Op.and]) {
				query[Op.and] = []
			}

			query[Op.and].push(querySearch, queryOther, { active: true })

			// Combine status filters (combine draft_status and approval_status)
			let combinedStatusFilter = ''
			if (statusFilter && approvalStatusFilter) {
				// If both filters are specified, use OR logic between them
				const statusPart = statusFilter.replace(/^AND /, '')
				const approvalPart = approvalStatusFilter.replace(/^AND /, '')
				combinedStatusFilter = `AND (${statusPart} OR ${approvalPart})`
			} else {
				combinedStatusFilter = statusFilter || approvalStatusFilter
			}

			const students = await Student.findAll({
				where: query,
				include: [
					{
						model: Draft,
						as: 'draft',
						required: true,
						where: {
							status: { [Op.ne]: 'draft' },
							updated_at: {
								[Op.eq]: sequelize.literal(`
                              (SELECT MAX("updated_at") 
                              FROM "Drafts" AS d
                              WHERE d.student_id = "Student".student_id
                              AND d.status != 'draft' ${combinedStatusFilter})
                          `),
							},
						},
					},
				],
			})

			return students
		} catch (error) {
			throw error
		}
	}

    /**
     * Creates a new draft or updates an existing one (upsert).
     * This is the primary method for student edits.
     */
    static async upsertDraft(studentId, newProfileData) {
        let draft = await Draft.findOne({ where: { student_id: studentId } });

        if (draft) {
            const oldProfileData = draft.profile_data || {};
            const changedKeys = getChangedKeys(newProfileData, oldProfileData);
            draft.profile_data = newProfileData;
            draft.changed_fields = _.union(draft.changed_fields || [], changedKeys);

			if (['submitted', 'approved', 'resubmission_required', 'disapproved'].includes(draft.status)) {
				draft.status = 'draft';
			}

            await draft.save();
            return { draft, created: false };

        } else {
            // If draft does not exist, create a new one
            const changedKeys = Object.keys(newProfileData); // All fields are considered new
            draft = await Draft.create({
                student_id: studentId,
                profile_data: newProfileData,
                changed_fields: changedKeys,
                status: 'draft',
            });
            return { draft, created: true };
        }
    }

    /**
     * Submits a draft for review.
     * Enforces the rule that a draft cannot be submitted if already in 'submitted' state.
     */
    static async submitForReview(draftId) {
        const draft = await Draft.findByPk(draftId);
        if (!draft) {
            throw new Error('Qoralama topilmadi.');
        }

        if (draft.status === 'submitted') {
            throw new Error("Sizda allaqachon tekshiruvga yuborilgan faol qoralama mavjud. Yangisini yuborish uchun avvalgisining natijasini kuting.");
        }

        draft.status = 'submitted';
        draft.submit_count += 1;
        draft.comments = null;
        
        await Student.update({ visibility: false }, { where: { student_id: draft.student_id } });
        await draft.save();
        return draft;
    }
    /**
     * Updates the status of a draft by a staff member.
     * Clears the changed_fields array upon review completion.
     */
    static async updateStatusByStaff(draftId, status, comments, reviewedBy) {
        const draft = await Draft.findByPk(draftId);
        if (!draft) {
            throw new Error('Qoralama topilmadi.');
        }

        draft.status = status;
        draft.comments = comments;
        draft.reviewed_by = reviewedBy;

        // When a review cycle is complete, clear the list of changes
        if (['approved', 'resubmission_required', 'disapproved'].includes(status)) {
            draft.changed_fields = [];
        }
        
        await draft.save();
        return draft;
    }

    static async getById(id) {
        return Draft.findByPk(id);
    }

    static async getStudentWithDraft(studentId) {
        return Student.findOne({
            where: { student_id: studentId },
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt'],
            },
            include: [{
                model: Draft,
                as: 'draft',
                required: false,
            }],
        });
    }

    static async delete(id) {
        const draft = await Draft.findByPk(id);
        if (!draft) {
            throw new Error('Qoralama topilmadi');
        }
        await draft.destroy();
        return draft;
    }
}

module.exports = DraftService;