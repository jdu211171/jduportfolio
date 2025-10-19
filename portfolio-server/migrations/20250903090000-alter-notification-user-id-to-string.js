'use strict'

module.exports = {
	async up(queryInterface, Sequelize) {
		// Change Notifications.user_id from BIGINT to STRING
		await queryInterface.changeColumn('Notifications', 'user_id', {
			type: Sequelize.STRING,
			allowNull: false,
		})
	},

	async down(queryInterface, Sequelize) {
		// Revert back to BIGINT with safe casting
		const t = await queryInterface.sequelize.transaction()
		try {
			// Normalize any non-numeric values to '0' to avoid cast errors
			await queryInterface.sequelize.query('UPDATE "Notifications" SET "user_id" = \'0\' WHERE "user_id" IS NULL OR "user_id" !~ \'^[0-9]+$\';', { transaction: t })
			// Perform the type change using explicit cast
			await queryInterface.sequelize.query('ALTER TABLE "Notifications" ALTER COLUMN "user_id" TYPE BIGINT USING "user_id"::bigint;', { transaction: t })
			// Ensure NOT NULL constraint remains
			await queryInterface.sequelize.query('ALTER TABLE "Notifications" ALTER COLUMN "user_id" SET NOT NULL;', { transaction: t })
			await t.commit()
		} catch (e) {
			await t.rollback()
			throw e
		}
	},
}
