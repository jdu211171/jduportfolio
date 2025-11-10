'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Fix version_type for all drafts that were submitted/approved/checking before the migration
		// These should be 'pending' (staff-visible) not 'draft' (student working copy)
		await queryInterface.sequelize.query(`
			UPDATE "Drafts"
			SET version_type = 'pending'
			WHERE version_type = 'draft'
			AND status IN ('submitted', 'checking', 'approved', 'resubmission_required', 'disapproved');
		`)

		console.log('Fixed version_type for existing submitted/approved drafts')
	},

	async down(queryInterface, Sequelize) {
		// Revert: set them back to draft (though this loses information)
		await queryInterface.sequelize.query(`
			UPDATE "Drafts"
			SET version_type = 'draft'
			WHERE version_type = 'pending'
			AND status IN ('submitted', 'checking', 'approved', 'resubmission_required', 'disapproved');
		`)
	},
}
