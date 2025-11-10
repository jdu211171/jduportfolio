'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Create version_type enum
		await queryInterface.sequelize.query(`
			CREATE TYPE "enum_Drafts_version_type" AS ENUM ('draft', 'pending');
		`)

		// Add version_type column with default 'draft'
		await queryInterface.addColumn('Drafts', 'version_type', {
			type: Sequelize.ENUM('draft', 'pending'),
			allowNull: false,
			defaultValue: 'draft',
		})

		// Backfill existing data: set all to 'draft' (already default)
		// This is safe because we're adding the column with a default

		// Remove old unique constraint on student_id
		await queryInterface.removeConstraint('Drafts', 'Drafts_student_id_key')

		// Add new unique constraint on (student_id, version_type)
		await queryInterface.addConstraint('Drafts', {
			fields: ['student_id', 'version_type'],
			type: 'unique',
			name: 'Drafts_student_id_version_type_key',
		})
	},

	async down(queryInterface, Sequelize) {
		// Remove the unique constraint
		await queryInterface.removeConstraint('Drafts', 'Drafts_student_id_version_type_key')

		// Restore old unique constraint on student_id
		await queryInterface.addConstraint('Drafts', {
			fields: ['student_id'],
			type: 'unique',
			name: 'Drafts_student_id_key',
		})

		// Remove version_type column
		await queryInterface.removeColumn('Drafts', 'version_type')

		// Drop the enum type
		await queryInterface.sequelize.query(`
			DROP TYPE IF EXISTS "enum_Drafts_version_type";
		`)
	},
}
