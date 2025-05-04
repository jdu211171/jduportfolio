const { Op } = require('sequelize')
const { Draft, Student, sequelize } = require('../models')

class DraftService {
  // Service method to retrieve all students
  // static async getAll(filter) {
  //   try {
  //     console.log(filter)
  //     const semesterMapping = {
  //       '1年生': ['1', '2'],
  //       '2年生': ['3', '4'],
  //       '3年生': ['5', '6'],
  //       '4年生': ['7', '8', '9'],
  //     }

  //     const statusMapping = {
  //       '未確認': "submitted",
  //       '確認中': 'checking',
  //       '要修正': 'resubmission_required',
  //       '確認済': 'approved',
  //     }
  //     const getSemesterNumbers = (term) => {
  //       return semesterMapping[term] || []; // Return an empty array if term is not found in the mapping
  //     };
  //     if (filter.semester) {
  //       filter.semester = filter.semester.flatMap(term => getSemesterNumbers(term));
  //     }

  //     let query = {}; // Initialize an empty query object
  //     let querySearch = {};
  //     let queryOther = {};
  //     queryOther[Op.and] = [];

  //     const searchableColumns = ['email', 'first_name', 'last_name', 'self_introduction', 'hobbies', 'skills', 'it_skills', 'jlpt']; // Example list of searchable columns
  //     let statusFilter = ""
  //     // Iterate through filter keys
  //     Object.keys(filter).forEach(key => {
  //       if (filter[key] && key != "draft_status") {
  //         // Handle different types of filter values
  //         if (key === 'search') {
  //           // Search across all searchable columns
  //           querySearch[Op.or] = searchableColumns.map(column => {
  //             if (['skills', 'it_skills'].includes(column)) {
  //               // Handle JSONB fields specifically
  //               return {
  //                 [Op.or]: [
  //                   { [column]: { '上級::text': { [Op.iLike]: `%${filter[key]}%` } } },
  //                   { [column]: { '中級::text': { [Op.iLike]: `%${filter[key]}%` } } },
  //                   { [column]: { '初級::text': { [Op.iLike]: `%${filter[key]}%` } } }
  //                 ]
  //               };
  //             } else {
  //               // Use Op.iLike for case insensitive search on other columns
  //               return { [column]: { [Op.iLike]: `%${filter[key]}%` } };
  //             }
  //           });
  //         } else if (key === 'skills' || key === "it_skills") {
  //           // Search across all searchable columns
  //           queryOther[Op.and].push({
  //             [Op.or]: [
  //               { [key]: { '上級::text': { [Op.iLike]: `%${filter[key]}%` } } },
  //               { [key]: { '中級::text': { [Op.iLike]: `%${filter[key]}%` } } },
  //               { [key]: { '初級::text': { [Op.iLike]: `%${filter[key]}%` } } }
  //             ]
  //           })
  //         } else if (key === 'partner_university_credits') {
  //           queryOther[key] = { [Op.lt]: Number(filter[key]) };
  //         } else if (key === 'other_information') {
  //           if (filter[key] === '有り') {
  //             queryOther['other_information'] = { [Op.ne]: null };
  //           } else if (filter[key] === '無し') {
  //             queryOther['other_information'] = { [Op.is]: null };
  //           }
  //         } else if (key === 'jlpt' || key === 'ielts' || key === 'jdu_japanese_certification') {
  //           // Handle jlpt specifically for stringified JSON field
  //           queryOther[Op.and].push({
  //             [Op.or]: filter[key].map(level => {
  //               return { [key]: { [Op.iLike]: `%${level}"%` } };
  //             })
  //           });
  //         } else if (Array.isArray(filter[key])) {
  //           // If filter value is an array, use $in operator
  //           queryOther[key] = { [Op.in]: filter[key] };
  //         } else if (typeof filter[key] === 'string') {
  //           queryOther[key] = { [Op.like]: `%${filter[key]}%` };
  //         } else {
  //           // Handle other types of filter values as needed
  //           queryOther[key] = filter[key];
  //         }
  //       }
  //       if (filter[key] && key == "draft_status") {
  //         const filteredStatuses = filter[key].map((status) => statusMapping[status]);

  //         statusFilter = filteredStatuses.length
  //           ? `AND d.status IN (${filteredStatuses.map((s) => `'${s}'`).join(", ")})`
  //           : "";
  //       }
  //     });

  //     if (!query[Op.and]) {
  //       query[Op.and] = [];
  //     }

  //     query[Op.and].push(querySearch, queryOther, { active: true })

  //     const students = await Student.findAll({
  //       where: query,
  //       include: [
  //         {
  //           model: Draft,
  //           as: "drafts",
  //           required: true,
  //           where: {
  //             status: { [Op.ne]: "draft" }, // Exclude "draft" status
  //             updated_at: {
  //               [Op.eq]: sequelize.literal(`
  //                 (SELECT MAX("updated_at")
  //                  FROM "Drafts" AS d
  //                  WHERE d.student_id = "Student".student_id
  //                  AND d.status != 'draft' ${statusFilter})
  //               `),
  //             },
  //           },
  //         },
  //       ],
  //     });

  //     return students;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

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

      const getSemesterNumbers = (term) => semesterMapping[term] || []

      if (filter.semester) {
        filter.semester = filter.semester.flatMap((term) => getSemesterNumbers(term))
      }

      let query = {}
      let querySearch = {}
      let queryOther = {}
      queryOther[Op.and] = []

      // Process visibility filter before the main loop
      if (filter.visibility && Array.isArray(filter.visibility) && filter.visibility.length > 0) {
        const visibilityValues = filter.visibility
          .map((val) => visibilityMapping[val])
          .filter((val) => val !== undefined)
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
        filter.approval_status.forEach((approvalStatus) => {
          if (approvalStatusMapping[approvalStatus]) {
            draftStatuses.push(...approvalStatusMapping[approvalStatus])
          }
        })

        approvalStatusFilter = draftStatuses.length
          ? `AND d.status IN (${draftStatuses.map((s) => `'${s}'`).join(', ')})`
          : ''

        delete filter.approval_status // Remove to avoid double handling
      }

      Object.keys(filter).forEach((key) => {
        if (filter[key] && key !== 'draft_status') {
          if (key === 'search') {
            querySearch[Op.or] = searchableColumns.map((column) => ({
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
            queryOther[key] = filter[key] === '有り' ? { [Op.ne]: null } : { [Op.is]: null }
          } else if (key === 'jlpt' || key === 'ielts' || key === 'jdu_japanese_certification') {
            queryOther[Op.and].push({
              [Op.or]: filter[key].map((level) => ({
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
          const filteredStatuses = filter[key].map((status) => statusMapping[status])
          statusFilter = filteredStatuses.length
            ? `AND d.status IN (${filteredStatuses.map((s) => `'${s}'`).join(', ')})`
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

  // Create draft
  // static async create(data) {
  //   return Draft.create(data);
  // }

  static async create(data) {
    try {
      const { student_id, profile_data, comments, status, reviewed_by } = data

      // Studentning mavjud draftini tekshirish
      let draft = await Draft.findOne({ where: { student_id } })

      /// agar draftni haqiqiy versiyasi public bolsa ushani false qilish
      await Student.update({ visibility: false }, { where: { student_id } })

      if (draft) {
        // Agar draft mavjud bo‘lsa, uni yangilaymiz
        draft.profile_data = profile_data
        draft.comments = comments
        draft.status = status
        draft.reviewed_by = reviewed_by
        await draft.save()
        return { message: 'Draft updated successfully', draft }
      } else {
        // Agar draft mavjud bo‘lmasa, yangi draft yaratamiz
        draft = await Draft.create({ student_id, profile_data })
        return { message: 'Draft created successfully', draft }
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  // get draft for ID
  static async getById(id) {
    return Draft.findByPk(id)
  }

  static async getByStudentId(student_id) {
    return Draft.findAll({
      where: { student_id },
      order: [['created_at', 'DESC']], // Sort by created_at in descending order
    })
  }
  // update draft
  static async update(id, data) {
    const draft = await Draft.findByPk(id)
    if (!draft) {
      throw new Error('Draft not found')
    }
    return draft.update(data)
  }

  // Delete draft
  static async delete(id) {
    const draft = await Draft.findByPk(id)
    if (!draft) {
      throw new Error('Draft not found')
    }
    return draft.destroy()
  }

  static async getLatestApprovedDraftByStudentId(studentId) {
    return Draft.findOne({
      where: {
        student_id: studentId,
        status: 'approved', // Only fetch approved drafts
      },
      order: [['updated_at', 'DESC']], // Get the latest updated draft
    })
  }

  static async getDraftByStudentId(studentId) {
    try {
      const student = await Student.findOne({
        where: { student_id: studentId },
        include: [
          {
            model: Draft,
            as: 'draft',
            required: false,
          },
        ],
      })

      if (!student) {
        throw new Error('Student not found')
      }

      return student
    } catch (error) {
      console.error('Error getting student with draft:', error)
      throw error
    }
  }
}

module.exports = DraftService
