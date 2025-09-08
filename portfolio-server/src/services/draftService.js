const { Draft, Student, sequelize } = require('../models')
const SettingsService = require('./settingService')
const QAService = require('./qaService')
const _ = require('lodash') // Used for deep object comparison
const { uploadFile, deleteFile } = require('../utils/storageService')
const generateUniqueFilename = require('../utils/uniqueFilename')

const { Op } = require('sequelize')

/**
 * Compares two objects and returns an array of keys that have changed.
 * @param {object} newData - The new data object.
 * @param {object} oldData - The old data object.
 * @returns {string[]} An array of changed keys.
 */
const getChangedKeys = (newData, oldData) => {
	if (!oldData) return Object.keys(newData)
	const allKeys = _.union(Object.keys(newData), Object.keys(oldData))

	return allKeys.filter(key => {
		// _.isEqual provides deep comparison for nested objects and arrays
		return !_.isEqual(newData[key], oldData[key])
	})
}

class DraftService {
	static async getAll(filter) {
		try {
			console.log(
				'DraftService.getAll called with filter:',
				JSON.stringify(filter, null, 2)
			)

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
				'student_id',
				'self_introduction',
				'hobbies',
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
						let searchConditions = searchableColumns.map(column => ({
							[column]: { [Op.iLike]: `%${filter[key]}%` },
						}))

						// Add JSONB search conditions for skills and it_skills using sequelize.where
						searchConditions.push(
							sequelize.where(
								sequelize.cast(sequelize.col('Student.skills'), 'TEXT'),
								{ [Op.iLike]: `%${filter[key]}%` }
							)
						)
						searchConditions.push(
							sequelize.where(
								sequelize.cast(sequelize.col('Student.it_skills'), 'TEXT'),
								{ [Op.iLike]: `%${filter[key]}%` }
							)
						)

						querySearch[Op.or] = searchConditions
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
					} else if (key === 'jlpt' || key === 'jdu_japanese_certification') {
						// Match only the highest level within stored JSON string
						queryOther[Op.and].push({
							[Op.or]: filter[key].map(level => ({
								[key]: { [Op.iLike]: `%\"highest\":\"${level}\"%` },
							})),
						})
					} else if (key === 'ielts') {
						queryOther[Op.and].push({
							[Op.or]: filter[key].map(level => ({
								[key]: { [Op.iLike]: `%${level}%` },
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
						? `AND d.status IN (${filteredStatuses
								.map(s => `'${s}'`)
								.join(', ')})`
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

			console.log('Final query object:', JSON.stringify(query, null, 2))
			console.log('Combined status filter:', combinedStatusFilter)

			const students = await Student.findAll({
				where: query,
				attributes: {
					include: ['credit_details'], // Explicitly include credit_details field
				},
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
			console.error('DraftService.getAll error:', error)
			console.error('Error message:', error.message)
			console.error('SQL:', error.sql)
			throw error
		}
	}
	/**
	 * Creates a new draft or updates an existing one (upsert).
	 * This is the primary method for student edits.
	 */
	static async upsertDraft(studentId, newProfileData) {
		let draft = await Draft.findOne({ where: { student_id: studentId } })

		if (draft) {
			const oldProfileData = draft.profile_data || {}
			const changedKeys = getChangedKeys(newProfileData, oldProfileData)
			draft.profile_data = newProfileData
			draft.changed_fields = _.union(draft.changed_fields || [], changedKeys)

			if (
				[
					'submitted',
					'approved',
					'resubmission_required',
					'disapproved',
				].includes(draft.status)
			) {
				draft.status = 'draft'
			}

			await draft.save()
			return { draft, created: false }
		} else {
			// If draft does not exist, create a new one
			const changedKeys = Object.keys(newProfileData) // All fields are considered new
			draft = await Draft.create({
				student_id: studentId,
				profile_data: newProfileData,
				changed_fields: changedKeys,
				status: 'draft',
			})
			return { draft, created: true }
		}
	}
	/**
	 * Submits a draft for review.
	 * Enforces the rule that a draft cannot be submitted if already in 'submitted' state.
	 */
	static async submitForReview(draftId) {
		const draft = await Draft.findByPk(draftId)
		if (!draft) {
			throw new Error('Qoralama topilmadi.')
		}

		if (draft.status === 'submitted') {
			throw new Error(
				'Sizda allaqachon tekshiruvga yuborilgan faol qoralama mavjud. Yangisini yuborish uchun avvalgisining natijasini kuting.'
			)
		}


		// Server-side validation: ensure all required QA answers are filled
		try {
			const settingsRaw = await SettingsService.getSetting('studentQA')
			if (settingsRaw) {
				let settings
				try {
					settings = JSON.parse(settingsRaw)
				} catch {
					settings = null
				}
                if (settings && typeof settings === 'object') {
                    // Prefer answers from current draft.profile_data.qa if present
                    const profileQA = (draft.profile_data && draft.profile_data.qa) || null

                    let answersByCategory = {}
                    if (profileQA && typeof profileQA === 'object') {
                        answersByCategory = profileQA
                    } else {
                        // Fallback to persisted QA rows
                        const student = await Student.findOne({ where: { student_id: draft.student_id } })
                        if (student) {
                            const qaRows = await QAService.findQAByStudentId(student.id)
                            for (const row of qaRows) {
                                answersByCategory[row.category] = row.qa_list || {}
                            }
                        }
                    }

                    const missing = []
                    for (const category of Object.keys(settings)) {
                        if (category === 'idList') continue
                        const questions = settings[category] || {}
                        const answers = answersByCategory[category] || {}
                        for (const key of Object.keys(questions)) {
                            const q = questions[key]
                            if (q && q.required === true) {
                                // Accept legacy answer shapes: object { answer } or plain string
                                const raw = answers[key]
                                const ans =
                                    raw && typeof raw === 'object' && raw !== null && 'answer' in raw
                                        ? raw.answer
                                        : raw
                                if (!ans || String(ans).trim() === '') {
                                    missing.push({ category, key })
                                }
                            }
                        }
                    }
                    if (missing.length > 0) {
                        throw new Error(
                            `Majburiy savollarga javob to'liq emas. Iltimos, barcha '必須' savollarga javob bering. (Yetishmaydi: ${missing.length})`
                        )
                    }
                }
			}
		} catch (e) {
			throw e
		}

		draft.status = 'submitted'
		draft.submit_count += 1
		draft.comments = null

		await Student.update(
			{ visibility: false },
			{ where: { student_id: draft.student_id } }
		)
		await draft.save()
		return draft
	}
	/**
	 * Updates the status of a draft by a staff member.
	 * Clears the changed_fields array upon review completion.
	 */
	static async updateStatusByStaff(draftId, status, comments, reviewedBy) {
		const draft = await Draft.findByPk(draftId)
		if (!draft) {
			throw new Error('Qoralama topilmadi.')
		}

		draft.status = status
		draft.comments = comments
		draft.reviewed_by = reviewedBy

		// When a review cycle is complete, clear the list of changes
		if (['approved', 'resubmission_required', 'disapproved'].includes(status)) {
			draft.changed_fields = []
		}

		await draft.save()
		return draft
	}

	static async getById(id) {
		return Draft.findByPk(id)
	}

	static async getStudentWithDraft(studentId) {
		return Student.findOne({
			where: { student_id: studentId },
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
	}

	static async delete(id) {
		const draft = await Draft.findByPk(id)
		if (!draft) {
			throw new Error('Qoralama topilmadi')
		}
		await draft.destroy()
		return draft
	}
}

module.exports = DraftService
