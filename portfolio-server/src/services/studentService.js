// services/studentService.js
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const generatePassword = require('generate-password');
const { Student, Draft, Bookmark, sequelize } = require('../models');
const { EmailToStudent } = require('../utils/emailToStudent');

class StudentService {
  // Service method to create a new student
  static async createStudent(studentData) {
    try {
      const newStudent = await Student.create(studentData);
      return newStudent;
    } catch (error) {
      throw error;
    }
  }

  // Service method to retrieve all students
  static async getAllStudents(filter, recruiterId, onlyBookmarked, userType) {
    try {
      const semesterMapping = {
        '1年生': ['1', '2'],
        '2年生': ['3', '4'],
        '3年生': ['5', '6'],
        '4年生': ['7', '8', '9'],
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

      // Iterate through filter keys
      Object.keys(filter).forEach(key => {
        if (filter[key]) {
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
      });

      if (!query[Op.and]) {
        query[Op.and] = [];
      }

      query[Op.and].push(querySearch, queryOther, { active: true })
      if (userType == "Recruiter") {
        query[Op.and].push({ visibility: true })
      }
      if (onlyBookmarked == "true") {

        query[Op.and].push(
          sequelize.literal(`EXISTS (
            SELECT 1
            FROM "Bookmarks" AS "Bookmark"
            WHERE "Bookmark"."studentId" = "Student"."id"
              AND "Bookmark"."recruiterId" = ${sequelize.escape(recruiterId)}
          )`)
        );
      }


      // Execute the query to fetch students
      const students = await Student.findAll({
        where: query,
        attributes: {
          include: [
            [sequelize.literal(`EXISTS (
              SELECT 1
              FROM "Bookmarks" AS "Bookmark"
              WHERE "Bookmark"."studentId" = "Student"."id"
                AND "Bookmark"."recruiterId" = ${sequelize.escape(recruiterId)}
            )`), 'isBookmarked']
          ]
        }
      });

      return students;
    } catch (error) {
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
      });
      if (!student) {
        throw new Error('Student not found');
      }
      return student;
    } catch (error) {
      throw error;
    }
  }

  // Service method to retrieve a student by student_id
  static async getStudentByStudentId(studentId, password = false) {
    try {
      let excluded = ['createdAt', 'updatedAt'];
      if (!password) {
        excluded.push('password');
      }

      const student = await Student.findOne({
        where: { student_id: studentId }, // Search by student_id instead of id
        attributes: { exclude: excluded },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      return student;
    } catch (error) {
      throw error;
    }
  }

  // Service method to update a student
  static async updateStudent(studentId, studentData) {
    try {
      const student = await Student.findByPk(studentId, {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      });
      if (!student) {
        throw new Error('Student not found');
      }
      await student.update(studentData);
      return student;
    } catch (error) {
      throw error;
    }
  }

  // Service method to update a student by kintone_id
  static async updateStudentWithKintoneID(kintoneId, studentData) {
    try {
      // Find student by kintone_id and exclude certain fields from the response
      const student = await Student.findOne({
        where: { kintone_id: kintoneId },
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      });

      // If student not found, throw an error
      if (!student) {
        throw new Error('Student not found');
      }

      // Update the student with the provided data
      await student.update(studentData);

      return student;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  // Service method to update a student by kintone_id
  static async updateStudentWithStudentID(studentId, studentData) {
    try {
      // Find student by kintone_id and exclude certain fields from the response
      const student = await Student.findOne({
        where: { student_id: studentId },
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      });

      // If student not found, throw an error
      if (!student) {
        throw new Error('Student not found');
      }

      // Update the student with the provided data
      await student.update(studentData);

      return student;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }


  // Service method to delete a student by kintone_id
  static async deleteStudent(kintoneId) {
    try {
      // Find student by kintone_id
      const student = await Student.findOne({ where: { kintone_id: kintoneId } });

      // If student not found, throw an error
      if (!student) {
        throw new Error('Student not found');
      }

      // Delete the student
      await student.destroy();
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // Service method to upsert student data
  static async syncStudentData(studentData) {
    try {
      const results = await Promise.all(studentData.map(async (data) => {
        // Check if the student already exists
        const existingStudent = await Student.findOne({ where: { student_id: data.studentId } });

        // Prepare data for upsert
        const formattedData = {
          email: data.mail,
          student_id: data.studentId,
          first_name: data.studentName.split(' ')[0], // Asseuming first name is the first part
          last_name: data.studentName.split(' ')[1], // Assuming last name is the second part
          date_of_birth: data.birthday,
          // Include other fields as needed
          semester: data.semester,
          partner_university: data.univer,
          kintone_id: data.レコード番号.value,
          jlpt: data.jlpt,
          jdu_japanese_certification: data.jdu_japanese_certification,
          ielts: data.ielts,
          japanese_speech_contest: data.japanese_speech_contest,
          it_contest: data.it_contest,
        };

        if (!existingStudent) {
          // If the student does not exist, set a default password
          const password = generatePassword.generate({
            length: 12,
            numbers: true,
            symbols: false,
            uppercase: true,
            excludeSimilarCharacters: true
          });
          const salt = await bcrypt.genSalt(10);
          formattedData.password = await bcrypt.hash(password, salt);
        } else {
          const password = generatePassword.generate({
            length: 12,
            numbers: true,
            symbols: false,
            uppercase: true,
            excludeSimilarCharacters: true
          });
          if (formattedData.semester >= 7 && !existingStudent.active) {
            await EmailToStudent(formattedData.email, password, formattedData.first_name, formattedData.last_name);
            const salt = await bcrypt.genSalt(10);
            formattedData.password = await bcrypt.hash(password, salt);;
            formattedData.active = true;
          } else {
            formattedData.password = existingStudent.password;
          }
        }

        // Perform upsert
        return await Student.upsert(formattedData, {
          returning: true, // Optionally return the created or updated instance
        });
      }));

      return results;
    } catch (error) {
      throw error;
    }
  }


  //this is sample to send email
  static async EmailToStudent(email, password, firstName, lastName) {

    // Send a welcome email to the new admin
    const to = email
    const subject = 'Welcome to JDU';
    const text = `Hi ${firstName},\n\nWelcome to JDU. Your account has been created.\n\nBest regards,\nJDU Team`;
    const html = `<p>Hi ${firstName},</p><p>Welcome to JDU. Your account has been created.</p><p>Best regards,<br>JDU Team</p>`;
    await sendEmail(to, subject, text, html);

    return "email send successfully";
  }



  static async getStudentsWithPendingDrafts() {
    try {
      const students = await Student.findAll({
        include: [
          {
            model: Draft,
            as: 'drafts',
            where: { status: 'pending' }, // status = "pending" filter
          }
        ]
      });
      return students;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = StudentService;
