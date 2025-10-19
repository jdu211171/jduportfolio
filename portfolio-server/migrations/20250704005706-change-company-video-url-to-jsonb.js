'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Add a temporary column
		await queryInterface.addColumn('Recruiters', 'company_video_url_temp', {
			type: Sequelize.JSONB,
			allowNull: true,
			defaultValue: [],
		})

		// Convert existing string data to array format in the temp column
		await queryInterface.sequelize.query(`
      UPDATE "Recruiters" 
      SET company_video_url_temp = 
        CASE 
          WHEN company_video_url IS NULL OR company_video_url = '' THEN '[]'::jsonb
          ELSE jsonb_build_array(company_video_url)
        END
    `)

		// Drop the old column
		await queryInterface.removeColumn('Recruiters', 'company_video_url')

		// Rename the temp column
		await queryInterface.renameColumn('Recruiters', 'company_video_url_temp', 'company_video_url')
	},

	async down(queryInterface, Sequelize) {
		// Add a temporary string column
		await queryInterface.addColumn('Recruiters', 'company_video_url_temp', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		// Convert back to string (take first element of array)
		await queryInterface.sequelize.query(`
      UPDATE "Recruiters" 
      SET company_video_url_temp = 
        CASE 
          WHEN company_video_url IS NOT NULL AND jsonb_array_length(company_video_url) > 0 
          THEN company_video_url->>0
          ELSE NULL
        END
    `)

		// Drop the JSONB column
		await queryInterface.removeColumn('Recruiters', 'company_video_url')

		// Rename the temp column
		await queryInterface.renameColumn('Recruiters', 'company_video_url_temp', 'company_video_url')
	},
}
