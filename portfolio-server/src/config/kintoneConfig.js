// config/kintoneConfig.js
const apps = {
	// ASOSIY ILOVALAR
	students: {
		appId: '230',
		token: process.env.KINTONE_API_TOKEN,
	},
	staff: {
		appId: '246',
		token: process.env.KINTONE_STAFF_TOKEN,
	},
	recruiters: {
		appId: '245',
		token: process.env.KINTONE_RECRUITER_TOKEN,
	},

	// STUDENTGA BOG'LIQ ILOVALAR
	student_credits: {
		appId: '233',
		token: process.env.KINTONE_STUDENT_CREDITS_TOKEN,
	},
	student_ielts: {
		appId: '248',
		token: process.env.KINTONE_IELTS_TOKEN,
	},
	student_it_contest: {
		appId: '240',
		token: process.env.KINTONE_IT_CONTEST_TOKEN,
	},
	student_jlpt: {
		appId: '243',
		token: process.env.KINTONE_JLPT_TOKEN,
	},
	student_benron_taikai: {
		appId: '242',
		token: process.env.KINTONE_BENRON_TOKEN,
	},
	student_jdu_ninteishiken: {
		appId: '236',
		token: process.env.KINTONE_JDU_NINTEI_TOKEN,
	},
	// Eski ilovalar
	credit_details: {
		appId: '232',
		token: process.env.KINTONE_CREDIT_DETAILS_TOKEN,
	},
}

module.exports = apps
