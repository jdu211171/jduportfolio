const { Staff } = require('../models'); // Assuming your model file is properly exported
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

class StaffService {
  static async createStaff(data) {
    try {
      const newStaff = await Staff.create(data);
      return newStaff;
    } catch (error) {
      console.error('Error creating staff:', error);  // Log any errors
      throw error;
    }
  }

  static async getAllStaff(filter) {
    try {
      let query = {}; // Initialize an empty query object
      const searchableColumns = ['email', 'first_name', 'last_name', "department", 'position']; // Example list of searchable columns

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
      const staffList = await Staff.findAll({ where: query });
      return staffList;
    } catch (error) {
      throw error;
    }
  }

  static async getStaffById(staffId) {
    try {
      const staff = await Staff.findByPk(staffId);
      if (!staff) {
        throw new Error('Staff not found');
      }
      return staff;
    } catch (error) {
      throw error;
    }
  }

  static async updateStaff(staffId, staffData) {
    try {
      const staff = await Staff.findByPk(staffId, {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      });
      if (!staff) {
        throw new Error('Staff not found');
      }
      await staff.update(staffData);
      return staff;
    } catch (error) {
      throw error;
    }
  }

  static async deleteStaff(staffId) {
    try {
      await Staff.destroy({ where: { kintone_id: staffId } });
    } catch (error) {
      console.error('Error deleting staff:', error);  // Log any errors
      throw error;
    }
  }
}

module.exports = StaffService;
