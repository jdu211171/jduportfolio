'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Students', 'faculty', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		await queryInterface.addColumn('Students', 'department', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('Students', 'faculty')
		await queryInterface.removeColumn('Students', 'department')
	},
}
