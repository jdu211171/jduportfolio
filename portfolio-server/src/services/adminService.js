const bcrypt = require('bcrypt');
const { Admin } = require('../models');
class AdminService {
  static async createAdmin(data) {
    return await Admin.create(data);
  }

  static async getAdminById(id) {
    return await Admin.findByPk(id);
  }

  static async updateAdmin(id, data) {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      throw new Error('Admin not found');
    }
    const updatedData = {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      email: data.email,
      photo: data.photo,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      workingHours: data.workingHours,
      location: data.location,
    };
    if (data.password) {
      updatedData.password = data.password;
    }
    return await admin.update(updatedData);
  }

  static async deleteAdmin(id) {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      throw new Error('Admin not found');
    }
    await admin.destroy();
    return admin;
  }
}

module.exports = AdminService;
