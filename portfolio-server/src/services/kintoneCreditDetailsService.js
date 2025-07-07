const axios = require('axios')
const apps = require('../config/kintoneConfig')

class KintoneCreditDetailsService {
	constructor() {
		this.baseURL = process.env.KINTONE_API_BASE_URL || 'https://jdu.cybozu.com'
		this.baseURL = this.baseURL.endsWith('/k/v1')
			? this.baseURL
			: `${this.baseURL}/k/v1`
		// App 233 (credit_details) dan foydalanish - batafsil ma'lumotlar uchun
		this.appId = apps.credit_details.appId
		this.token = apps.credit_details.token

		console.log('🔧 KintoneCreditDetailsService konfiguratsiyasi:', {
			appId: this.appId,
			token: this.token ? `${this.token.substring(0, 8)}...` : 'MAVJUD EMAS',
			baseURL: this.baseURL,
		})
	}

	/**
	 * Get credit details for a specific student
	 * @param {string} studentId - Student ID to search for
	 * @returns {Array} Array of credit detail records
	 */
	async getCreditDetailsByStudentId(studentId) {
		try {
			if (!this.token) {
				console.warn(
					'⚠️ KINTONE_CREDIT_DETAILS_TOKEN not found, using demo data'
				)
				return this.getDemoDataForStudent(studentId)
			}

			// Use KintoneService method instead of direct axios call
			console.log(
				'🚀 KintoneCreditDetailsService: Using KintoneService.getRecordBy...'
			)
			const KintoneService = require('./kintoneService')
			const result = await KintoneService.getRecordBy(
				'credit_details',
				'studentId',
				studentId
			)

			console.log('📨 KintoneService response:', {
				recordsCount: result.records?.length || 0,
			})

			if (result && result.records && result.records.length > 0) {
				// App 233 dan batafsil ma'lumotlarni to'g'ridan-to'g'ri foydalanish
				const records = result.records

				console.log("📊 App 233 dan ma'lumotlar:", {
					recordsCount: records.length,
					sampleFields: records[0] ? Object.keys(records[0]).slice(0, 5) : [],
				})

				// App 233 ma'lumotlarini bizning formatga o'tkazish
				const creditDetails = records.map((record, index) => {
					return {
						recordId: record.$id?.value || `record_${index}`,
						studentId: record.studentId?.value || '',
						subjectId: record.subjectId?.value || '',
						subjectName: record.subjectName?.value || '',
						subjectCredit: parseInt(record.subjectCredit?.value) || 0,
						subjectCategory: record.subjectCategory?.value || '',
						score: record.score?.value || '',
						grade: record.grade?.value || '',
						date: record.date?.value || '',
						manualCredit: record.manualCredit?.value || '',
						gradeSubjectGroup: record.gradeSubjectGroup?.value || '',
						gradeUniverGroup: record.gradeUniverGroup?.value || '',
						// Japanese format fields for compatibility
						番号: record['レコード番号']?.value || '',
						評価: record.grade?.value || '',
						単位数: parseInt(record.subjectCredit?.value) || 0,
						科目名: record.subjectName?.value || '',
						取得日: record.date?.value || '',
					}
				})

				console.log(
					`✅ KintoneCreditDetailsService: ${creditDetails.length} ta kredit yozuvi olindi student ${studentId} uchun`
				)

				return creditDetails
			}

			console.log(`⚠️ Student ${studentId} uchun Kintone da ma'lumot topilmadi`)
			return []
		} catch (error) {
			console.error(
				`❌ KintoneCreditDetailsService xatosi student ${studentId} uchun:`,
				error.message
			)
			if (error.response) {
				console.error('❌ Response status:', error.response.status)
				console.error('❌ Response data:', error.response.data)
			}
			// Fallback to demo data if Kintone fails
			console.log(`🔄 Demo ma'lumotlarga o'tish student ${studentId} uchun`)
			return this.getDemoDataForStudent(studentId)
		}
	}

	/**
	 * Calculate total credits for a student (like Sanno University)
	 * @param {Array} creditDetails - Array of credit detail records
	 * @returns {number} Total credits earned
	 */
	calculateTotalCredits(creditDetails) {
		return creditDetails.reduce((total, record) => {
			const credits = parseInt(record.単位数) || 0
			// Only count credits with passing grades (not E or F)
			const grade = record.評価
			if (grade && grade !== 'E' && grade !== 'F') {
				return total + credits
			}
			return total
		}, 0)
	}

	/**
	 * Get demo credit details for testing
	 * @param {string} studentId - Student ID
	 * @returns {Array} Demo credit details
	 */
	getDemoDataForStudent(studentId) {
		const demoData = {
			JDU001: [
				{
					recordId: 'demo_001',
					番号: '001',
					科目名: 'Webプログラミング基礎',
					評価: 'A',
					単位数: 4,
					取得日: '2024-03-15',
				},
				{
					recordId: 'demo_002',
					番号: '002',
					科目名: 'データベース設計',
					評価: 'B',
					単位数: 3,
					取得日: '2024-06-20',
				},
			],
		}

		return demoData[studentId] || []
	}
}

module.exports = new KintoneCreditDetailsService()
