/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Convert string columns to boolean with safe mapping. Postgres-specific USING clause.
    const table = 'Recruiters'

    // Helper to build USING clause mapping common truthy/falsey strings to boolean
    const usingCase = col => `
      CASE
        WHEN ${col} ILIKE 'true' OR ${col} IN ('1','yes','Yes','YES','はい','有','あり') THEN TRUE
        WHEN ${col} ILIKE 'false' OR ${col} IN ('0','no','No','NO','いいえ','無','なし') THEN FALSE
        ELSE NULL
      END
    `

    // telework_availability
    await queryInterface.sequelize.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "telework_availability" TYPE BOOLEAN
      USING ${usingCase('"telework_availability"')};
    `)

    // housing_availability
    await queryInterface.sequelize.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "housing_availability" TYPE BOOLEAN
      USING ${usingCase('"housing_availability"')};
    `)

    // airport_pickup
    await queryInterface.sequelize.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "airport_pickup" TYPE BOOLEAN
      USING ${usingCase('"airport_pickup"')};
    `)
  },
  async down(queryInterface, Sequelize) {
    // Revert boolean columns back to STRING to match previous schema
    const table = 'Recruiters'
    await queryInterface.changeColumn(table, 'telework_availability', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.changeColumn(table, 'housing_availability', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.changeColumn(table, 'airport_pickup', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },
}

