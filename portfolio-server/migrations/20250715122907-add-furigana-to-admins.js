'use strict'
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Admins', 'first_name_furigana', {
			type: Sequelize.STRING,
			allowNull: true,
		})
		await queryInterface.addColumn('Admins', 'last_name_furigana', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('Admins', 'first_name_furigana')
		await queryInterface.removeColumn('Admins', 'last_name_furigana')
	},
}
