/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const table = 'Recruiters'
		await queryInterface.addColumn(table, 'tagline', { type: Sequelize.STRING, allowNull: true })
		await queryInterface.addColumn(table, 'company_website', { type: Sequelize.STRING, allowNull: true })
		await queryInterface.addColumn(table, 'company_capital', { type: Sequelize.STRING, allowNull: true })
		await queryInterface.addColumn(table, 'company_revenue', { type: Sequelize.STRING, allowNull: true })
		await queryInterface.addColumn(table, 'company_representative', { type: Sequelize.STRING, allowNull: true })

		await queryInterface.addColumn(table, 'job_title', { type: Sequelize.STRING, allowNull: true })
		await queryInterface.addColumn(table, 'job_description', { type: Sequelize.TEXT, allowNull: true })
		await queryInterface.addColumn(table, 'number_of_openings', { type: Sequelize.STRING, allowNull: true })
		await queryInterface.addColumn(table, 'employment_type', { type: Sequelize.STRING, allowNull: true })
		await queryInterface.addColumn(table, 'probation_period', { type: Sequelize.TEXT, allowNull: true })
		await queryInterface.addColumn(table, 'employment_period', { type: Sequelize.TEXT, allowNull: true })

		await queryInterface.addColumn(table, 'recommended_skills', { type: Sequelize.TEXT, allowNull: true })
		await queryInterface.addColumn(table, 'recommended_licenses', { type: Sequelize.TEXT, allowNull: true })
		await queryInterface.addColumn(table, 'recommended_other', { type: Sequelize.TEXT, allowNull: true })

		await queryInterface.addColumn(table, 'salary_increase', { type: Sequelize.STRING, allowNull: true })
		await queryInterface.addColumn(table, 'bonus', { type: Sequelize.STRING, allowNull: true })
		await queryInterface.addColumn(table, 'allowances', { type: Sequelize.TEXT, allowNull: true })
		await queryInterface.addColumn(table, 'holidays_vacation', { type: Sequelize.TEXT, allowNull: true })

		await queryInterface.addColumn(table, 'other_notes', { type: Sequelize.TEXT, allowNull: true })
		await queryInterface.addColumn(table, 'interview_method', { type: Sequelize.STRING, allowNull: true })
	},
	async down(queryInterface, Sequelize) {
		const table = 'Recruiters'
		const cols = ['tagline', 'company_website', 'company_capital', 'company_revenue', 'company_representative', 'job_title', 'job_description', 'number_of_openings', 'employment_type', 'probation_period', 'employment_period', 'recommended_skills', 'recommended_licenses', 'recommended_other', 'salary_increase', 'bonus', 'allowances', 'holidays_vacation', 'other_notes', 'interview_method']
		for (const c of cols) {
			try {
				await queryInterface.removeColumn(table, c)
			} catch (_) {}
		}
	},
}
