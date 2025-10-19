'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('News', 'visible_to_recruiter', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'News recruiter uchun korinishi (ON/OFF)'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('News', 'visible_to_recruiter')
  }
}