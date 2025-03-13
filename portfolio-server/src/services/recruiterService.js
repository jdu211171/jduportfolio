const bcrypt = require('bcrypt');
const { Recruiter } = require('../models');

class RecruiterService {
  // Service method to create a new recruiter
  static async createRecruiter(recruiterData) {
    try {
      const newRecruiter = await Recruiter.create(recruiterData);
      return newRecruiter;
    } catch (error) {
      throw error; // Throw the error for the controller to handle
    } å
  }

  // Service method to retrieve all recruiters
  static async getAllRecruiters(filter) {
    try {
      let query = {}; // Initialize an empty query object
      const searchableColumns = ['email', 'first_name', 'last_name', "company_name", 'company_description', 'phone']; // Example list of searchable columns

      // Iterate through filter keys
      Object.keys(filter).forEach(key => {
        if (filter[key]) {
          // Handle different types of filter values
          if (key === 'search') {
            // Search across all searchable columns
            query[Op.or] = searchableColumns.map(column => {
              // Use Op.iLike for case insensitive search on other columns
              return { [column]: { [Op.iLike]: `%${filter[key]}%` } };
            });
          } else if (Array.isArray(filter[key])) {
            // If filter value is an array, use $in operator
            query[key] = { [Op.in]: filter[key] };
          } else if (typeof filter[key] === 'string') {
            query[key] = { [Op.like]: `%${filter[key]}%` };
          } else {
            // Handle other types of filter values as needed
            query[key] = filter[key];
          }
        }
      });
      const recruiters = await Recruiter.findAll({ where: query, });
      return recruiters;
    } catch (error) {
      throw error;
    }
  }

  // Service method to retrieve a recruiter by ID
  static async getRecruiterById(recruiterId, password = false) {
    try {
      let excluded = ['createdAt', 'updatedAt']
      if (!password) {
        excluded.push('password')
      }
      const recruiter = await Recruiter.findByPk(recruiterId, {
        attributes: { exclude: excluded },
      });
      if (!recruiter) {
        throw new Error('Recruiter not found');
      }
      return recruiter;
    } catch (error) {
      throw error;
    }
  }

  static async getRecruiterByIdWithPassword(recruiterId) {
    try {
      const recruiter = await Recruiter.findByPk(recruiterId);
      if (!recruiter) {
        throw new Error('Recruiter not found');
      }
      return recruiter;
    } catch (error) {
      throw error;
    }
  }

  static async updateRecruiter(id, data) {
    try {
      const recruiter = await Recruiter.findByPk(id);
      if (!recruiter) {
        throw new Error('Recruiter not found');
      }

      const updatedData = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        email: data.email,
        company_name: data.company_name,
        company_description: data.company_description,
        gallery: data.gallery,
        photo: data.photo,
        date_of_birth: data.date_of_birth,
        active: data.active,
        kintone_id: data.kintone_id,
      };

      if (data.password) {
        updatedData.password = data.password;
      }

      return await recruiter.update(updatedData);
    } catch (error) {
      throw error;
    }
  }

  static async deleteRecruiter(recruiterId) {
    try {
      await Recruiter.destroy({ where: { kintone_id: recruiterId } });
    } catch (error) {
      console.error('Error deleting recruiter:', error);
      throw error;
    }
  }
}

module.exports = RecruiterService;
