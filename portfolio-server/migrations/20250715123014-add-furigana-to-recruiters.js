'use strict'
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Recruiters', 'first_name_furigana', {
			type: Sequelize.STRING,
			allowNull: true,
		})
		await queryInterface.addColumn('Recruiters', 'last_name_furigana', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('Recruiters', 'first_name_furigana')
		await queryInterface.removeColumn('Recruiters', 'last_name_furigana')
	},
}
