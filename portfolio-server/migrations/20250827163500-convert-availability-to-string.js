/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'Recruiters'
    // Convert BOOLEAN back to STRING (TEXT) preserving values as 'true'/'false' text
    await queryInterface.sequelize.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "telework_availability" TYPE TEXT USING CASE
        WHEN "telework_availability" IS TRUE THEN 'true'
        WHEN "telework_availability" IS FALSE THEN 'false'
        ELSE NULL END;
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "housing_availability" TYPE TEXT USING CASE
        WHEN "housing_availability" IS TRUE THEN 'true'
        WHEN "housing_availability" IS FALSE THEN 'false'
        ELSE NULL END;
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "airport_pickup" TYPE TEXT USING CASE
        WHEN "airport_pickup" IS TRUE THEN 'true'
        WHEN "airport_pickup" IS FALSE THEN 'false'
        ELSE NULL END;
    `)
  },
  async down(queryInterface, Sequelize) {
    const table = 'Recruiters'
    // Convert TEXT back to BOOLEAN best-effort
    await queryInterface.sequelize.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "telework_availability" TYPE BOOLEAN USING CASE
        WHEN lower("telework_availability") IN ('true','1','yes') THEN TRUE
        WHEN lower("telework_availability") IN ('false','0','no') THEN FALSE
        ELSE NULL END;
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "housing_availability" TYPE BOOLEAN USING CASE
        WHEN lower("housing_availability") IN ('true','1','yes') THEN TRUE
        WHEN lower("housing_availability") IN ('false','0','no') THEN FALSE
        ELSE NULL END;
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE "${table}"
      ALTER COLUMN "airport_pickup" TYPE BOOLEAN USING CASE
        WHEN lower("airport_pickup") IN ('true','1','yes') THEN TRUE
        WHEN lower("airport_pickup") IN ('false','0','no') THEN FALSE
        ELSE NULL END;
    `)
  }
}

