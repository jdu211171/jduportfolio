'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Drafts_status"
      ADD VALUE 'checking' AFTER 'resubmission_required';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: ENUM values cannot be removed easily, so you might need to recreate the ENUM type if needed.
    // This example does NOT remove 'checking' since it's complex in PostgreSQL.
    console.warn('⚠️ Rolling back ENUM changes is not supported directly in PostgreSQL');
  }
};
