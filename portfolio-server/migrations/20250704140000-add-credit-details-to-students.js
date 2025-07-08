'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Students', 'credit_details', {
			type: Sequelize.JSONB,
			allowNull: true,
			defaultValue: [],
			comment: 'Detailed credit information from Kintone app 233',
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Students', 'credit_details')
	},
}
