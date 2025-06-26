'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Recruiters', 'company_Address', {
			type: Sequelize.TEXT,
			allowNull: true,
		})

		await queryInterface.addColumn('Recruiters', 'established_Date', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		await queryInterface.addColumn('Recruiters', 'employee_Count', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		await queryInterface.addColumn('Recruiters', 'business_overview', {
			type: Sequelize.TEXT,
			allowNull: true,
		})

		await queryInterface.addColumn('Recruiters', 'target_audience', {
			type: Sequelize.TEXT,
			allowNull: true,
		})

		await queryInterface.addColumn('Recruiters', 'required_skills', {
			type: Sequelize.TEXT,
			allowNull: true,
		})

		await queryInterface.addColumn('Recruiters', 'welcome_skills', {
			type: Sequelize.TEXT,
			allowNull: true,
		})

		await queryInterface.addColumn('Recruiters', 'work_location', {
			type: Sequelize.TEXT,
			allowNull: true,
		})

		await queryInterface.addColumn('Recruiters', 'work_hours', {
			type: Sequelize.TEXT,
			allowNull: true,
		})

		await queryInterface.addColumn('Recruiters', 'salary', {
			type: Sequelize.TEXT,
			allowNull: true,
		})

		await queryInterface.addColumn('Recruiters', 'benefits', {
			type: Sequelize.TEXT,
			allowNull: true,
		})

		await queryInterface.addColumn('Recruiters', 'selection_process', {
			type: Sequelize.TEXT,
			allowNull: true,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('Recruiters', 'company_Address')
		await queryInterface.removeColumn('Recruiters', 'established_Date')
		await queryInterface.removeColumn('Recruiters', 'employee_Count')
		await queryInterface.removeColumn('Recruiters', 'business_overview')
		await queryInterface.removeColumn('Recruiters', 'target_audience')
		await queryInterface.removeColumn('Recruiters', 'required_skills')
		await queryInterface.removeColumn('Recruiters', 'welcome_skills')
		await queryInterface.removeColumn('Recruiters', 'work_location')
		await queryInterface.removeColumn('Recruiters', 'work_hours')
		await queryInterface.removeColumn('Recruiters', 'salary')
		await queryInterface.removeColumn('Recruiters', 'benefits')
		await queryInterface.removeColumn('Recruiters', 'selection_process')
	},
}
