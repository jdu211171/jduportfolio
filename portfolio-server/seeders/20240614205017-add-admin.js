// src/seeders/YYYYMMDDHHMMSS-add-admin.js

'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [admin] = await queryInterface.sequelize.query(
      `SELECT id FROM "Admins" WHERE email = 'admin@jdu.uz';`
    );

    if (admin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      return queryInterface.bulkInsert('Admins', [{
        email: 'admin@jdu.uz',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        date_of_birth: new Date(),
        photo: "",
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Admins', { email: 'admin@jdu.uz' }, {});
  }
};
