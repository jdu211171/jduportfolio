"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add isPartner boolean column with default false
    await queryInterface.addColumn("Recruiters", "isPartner", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    // Remove isPartner column
    await queryInterface.removeColumn("Recruiters", "isPartner");
  },
};

