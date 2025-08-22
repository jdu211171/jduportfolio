'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('UserFiles', 'file_size', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserFiles', 'file_size');
  }
};
