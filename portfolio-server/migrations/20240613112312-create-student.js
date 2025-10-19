'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Students', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			// ASOSIY MA'LUMOTLAR
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			student_id: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			first_name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			last_name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			date_of_birth: {
				type: Sequelize.DATEONLY,
				allowNull: true,
			},
			phone: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			photo: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			gender: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			address: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			parents_phone_number: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			enrollment_date: {
				// Kintone'dagi "jduDate"
				type: Sequelize.DATEONLY,
				allowNull: true,
			},
			partner_university_enrollment_date: {
				type: Sequelize.DATEONLY,
				allowNull: true,
			},

			// O'QISHGA OID MA'LUMOTLAR
			semester: {
				type: Sequelize.ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '卒業'),
				defaultValue: '1',
			},
			partner_university: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			student_status: {
				type: Sequelize.STRING,
				allowNull: true,
			},

			// KREDITLAR
			partner_university_credits: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			world_language_university_credits: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			business_skills_credits: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			japanese_employment_credits: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			liberal_arts_education_credits: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			total_credits: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			specialized_education_credits: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},

			// PROFIL MA'LUMOTLARI
			self_introduction: { type: Sequelize.TEXT, allowNull: true },
			hobbies: { type: Sequelize.STRING, allowNull: true },
			gallery: { type: Sequelize.JSONB, allowNull: true },
			skills: { type: Sequelize.JSONB, allowNull: true },
			it_skills: { type: Sequelize.JSONB, allowNull: true },
			other_information: { type: Sequelize.TEXT, allowNull: true },
			deliverables: { type: Sequelize.JSONB, allowNull: true },
			language_skills: { type: Sequelize.TEXT, allowNull: true },
			graduation_year: { type: Sequelize.TEXT, allowNull: true },
			graduation_season: { type: Sequelize.TEXT, allowNull: true },

			// SERTIFIKATLAR
			jlpt: { type: Sequelize.TEXT, allowNull: true },
			ielts: { type: Sequelize.TEXT, allowNull: true },
			jdu_japanese_certification: { type: Sequelize.TEXT, allowNull: true },
			japanese_speech_contest: { type: Sequelize.TEXT, allowNull: true },
			it_contest: { type: Sequelize.TEXT, allowNull: true },

			// TIZIM MAYDONLARI
			active: { type: Sequelize.BOOLEAN, defaultValue: false },
			visibility: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
			has_pending: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
			kintone_id: { type: Sequelize.INTEGER, allowNull: false },

			// VAQT SHTAMPLARI
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Students')
	},
}
