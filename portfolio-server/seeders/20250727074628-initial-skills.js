'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const skills = [
      { name: 'Public Speaking' },
      { name: 'Teamwork' },
      { name: 'Problem Solving' },
      { name: 'Leadership' },
      { name: 'Project Management' },
      { name: 'Data Analysis' },
      { name: 'Marketing' },
      { name: 'Sales' },
      { name: 'Graphic Design' },
      { name: 'Content Writing' },
    ];

    const skillsWithTimestamps = skills.map(skill => ({
      ...skill,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('Skills', skillsWithTimestamps, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Skills', null, {});
  }
};