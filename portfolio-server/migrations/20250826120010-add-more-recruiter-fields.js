/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'Recruiters'
    await queryInterface.addColumn(table, 'japanese_level', { type: Sequelize.STRING, allowNull: true })
    await queryInterface.addColumn(table, 'application_requirements_other', { type: Sequelize.TEXT, allowNull: true })
    await queryInterface.addColumn(table, 'retirement_benefit', { type: Sequelize.STRING, allowNull: true })
    await queryInterface.addColumn(table, 'telework_availability', { type: Sequelize.STRING, allowNull: true })
    await queryInterface.addColumn(table, 'housing_availability', { type: Sequelize.STRING, allowNull: true })
    await queryInterface.addColumn(table, 'relocation_support', { type: Sequelize.TEXT, allowNull: true })
    await queryInterface.addColumn(table, 'airport_pickup', { type: Sequelize.STRING, allowNull: true })
    await queryInterface.addColumn(table, 'intro_page_thumbnail', { type: Sequelize.STRING, allowNull: true })
  },
  async down(queryInterface, Sequelize) {
    const table = 'Recruiters'
    const cols = [
      'japanese_level','application_requirements_other','retirement_benefit',
      'telework_availability','housing_availability','relocation_support',
      'airport_pickup','intro_page_thumbnail'
    ]
    for (const c of cols) {
      try { await queryInterface.removeColumn(table, c) } catch (_) {}
    }
  }
}

