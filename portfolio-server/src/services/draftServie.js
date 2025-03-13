const { Op } = require('sequelize');
const { Draft, Student, sequelize } = require('../models');

class DraftService {

  // Service method to retrieve all students
  static async getAll(filter) {
    try {
      console.log(filter)
      const semesterMapping = {
        '1年生': ['1', '2'],
        '2年生': ['3', '4'],
        '3年生': ['5', '6'],
        '4年生': ['7', '8', '9'],
      }

      const statusMapping = {
        '未確認': "submitted",
        '確認中': 'checking',
        '要修正': 'resubmission_required',
        '確認済': 'approved',
      }
      const getSemesterNumbers = (term) => {
        return semesterMapping[term] || []; // Return an empty array if term is not found in the mapping
      };
      if (filter.semester) {
        filter.semester = filter.semester.flatMap(term => getSemesterNumbers(term));
      }

      let query = {}; // Initialize an empty query object
      let querySearch = {};
      let queryOther = {};
      queryOther[Op.and] = [];

      const searchableColumns = ['email', 'first_name', 'last_name', 'self_introduction', 'hobbies', 'skills', 'it_skills', 'jlpt']; // Example list of searchable columns
      let statusFilter = ""
      // Iterate through filter keys
      Object.keys(filter).forEach(key => {
        if (filter[key] && key != "draft_status") {
          // Handle different types of filter values
          if (key === 'search') {
            // Search across all searchable columns
            querySearch[Op.or] = searchableColumns.map(column => {
              if (['skills', 'it_skills'].includes(column)) {
                // Handle JSONB fields specifically
                return {
                  [Op.or]: [
                    { [column]: { '上級::text': { [Op.iLike]: `%${filter[key]}%` } } },
                    { [column]: { '中級::text': { [Op.iLike]: `%${filter[key]}%` } } },
                    { [column]: { '初級::text': { [Op.iLike]: `%${filter[key]}%` } } }
                  ]
                };
              } else {
                // Use Op.iLike for case insensitive search on other columns
                return { [column]: { [Op.iLike]: `%${filter[key]}%` } };
              }
            });
          } else if (key === 'skills' || key === "it_skills") {
            // Search across all searchable columns
            queryOther[Op.and].push({
              [Op.or]: [
                { [key]: { '上級::text': { [Op.iLike]: `%${filter[key]}%` } } },
                { [key]: { '中級::text': { [Op.iLike]: `%${filter[key]}%` } } },
                { [key]: { '初級::text': { [Op.iLike]: `%${filter[key]}%` } } }
              ]
            })
          } else if (key === 'partner_university_credits') {
            queryOther[key] = { [Op.lt]: Number(filter[key]) };
          } else if (key === 'other_information') {
            if (filter[key] === '有り') {
              queryOther['other_information'] = { [Op.ne]: null };
            } else if (filter[key] === '無し') {
              queryOther['other_information'] = { [Op.is]: null };
            }
          } else if (key === 'jlpt' || key === 'ielts' || key === 'jdu_japanese_certification') {
            // Handle jlpt specifically for stringified JSON field
            queryOther[Op.and].push({
              [Op.or]: filter[key].map(level => {
                return { [key]: { [Op.iLike]: `%${level}"%` } };
              })
            });
          } else if (Array.isArray(filter[key])) {
            // If filter value is an array, use $in operator
            queryOther[key] = { [Op.in]: filter[key] };
          } else if (typeof filter[key] === 'string') {
            queryOther[key] = { [Op.like]: `%${filter[key]}%` };
          } else {
            // Handle other types of filter values as needed
            queryOther[key] = filter[key];
          }
        }
        if (filter[key] && key == "draft_status") {
          const filteredStatuses = filter[key].map((status) => statusMapping[status]);

          statusFilter = filteredStatuses.length
            ? `AND d.status IN (${filteredStatuses.map((s) => `'${s}'`).join(", ")})`
            : "";
        }
      });

      if (!query[Op.and]) {
        query[Op.and] = [];
      }

      query[Op.and].push(querySearch, queryOther, { active: true })



      const students = await Student.findAll({
        where: query,
        include: [
          {
            model: Draft,
            as: "drafts",
            required: true,
            where: {
              status: { [Op.ne]: "draft" }, // Exclude "draft" status
              updated_at: {
                [Op.eq]: sequelize.literal(`
                  (SELECT MAX("updated_at") 
                   FROM "Drafts" AS d
                   WHERE d.student_id = "Student".student_id
                   AND d.status != 'draft' ${statusFilter})
                `),
              },
            },
          },
        ],
      });


      return students;
    } catch (error) {
      throw error;
    }
  }
  // Create draft
  static async create(data) {
    return Draft.create(data);
  }

  // get draft for ID
  static async getById(id) {
    return Draft.findByPk(id);
  }

  static async getByStudentId(student_id) {
    return Draft.findAll({
      where: { student_id },
      order: [['created_at', 'DESC']] // Sort by created_at in descending order
    });
  }
  // update draft
  static async update(id, data) {
    const draft = await Draft.findByPk(id);
    if (!draft) {
      throw new Error('Draft not found');
    }
    return draft.update(data);
  }

  // Delete draft
  static async delete(id) {
    const draft = await Draft.findByPk(id);
    if (!draft) {
      throw new Error('Draft not found');
    }
    return draft.destroy();
  }

  static async getLatestApprovedDraftByStudentId(studentId) {
    return Draft.findOne({
      where: {
        student_id: studentId,
        status: "approved", // Only fetch approved drafts
      },
      order: [["updated_at", "DESC"]], // Get the latest updated draft
    });
  }

}

module.exports = DraftService;
