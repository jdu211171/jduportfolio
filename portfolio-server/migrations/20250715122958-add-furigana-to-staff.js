'use strict'
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Staff', 'first_name_furigana', {
			type: Sequelize.STRING,
			allowNull: true,
		})
		await queryInterface.addColumn('Staff', 'last_name_furigana', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('Staff', 'first_name_furigana')
		await queryInterface.removeColumn('Staff', 'last_name_furigana')
	},
}
