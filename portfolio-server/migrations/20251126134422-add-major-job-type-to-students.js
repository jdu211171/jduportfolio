'use strict'

/**
 * Migration to add major and job_type columns to Students table.
 * These fields are part of the student profile and should be stored
 * in the live profile (Students table) when drafts are approved.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Students', 'major', {
			type: Sequelize.TEXT,
			allowNull: true,
		})

		await queryInterface.addColumn('Students', 'job_type', {
			type: Sequelize.TEXT,
			allowNull: true,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('Students', 'major')
		await queryInterface.removeColumn('Students', 'job_type')
	},
}
