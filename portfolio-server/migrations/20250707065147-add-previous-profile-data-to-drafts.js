'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Drafts', 'previous_profile_data', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove column if it exists (down may run after another migration already removed it)
    try {
      await queryInterface.removeColumn('Drafts', 'previous_profile_data');
    } catch (e) {
      // ignore if column doesn't exist
    }
  }
};
