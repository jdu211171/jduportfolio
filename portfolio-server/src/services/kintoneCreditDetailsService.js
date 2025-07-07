const axios = require('axios')
const apps = require('../config/kintoneConfig')

class KintoneCreditDetailsService {
	constructor() {
		this.baseURL = process.env.KINTONE_API_BASE_URL || 'https://jdu.cybozu.com'
		this.baseURL = this.baseURL.endsWith('/k/v1')
			? this.baseURL
			: `${this.baseURL}/k/v1`

		// Try App 233 first (credit_details), then fallback to App 232
		this.appId = apps.credit_details.appId || apps.student_credits.appId
		this.token = apps.credit_details.token || apps.student_credits.token

		console.log('🔧 KintoneCreditDetailsService initialized:', {
			baseURL: this.baseURL,
			appId: this.appId,
			tokenExists: !!this.token,
			tokenValue: this.token ? `${this.token.substring(0, 10)}...` : 'N/A',
			usingApp:
				this.appId === '233' ? 'credit_details (233)' : 'student_credits (232)',
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

			// Fetch data from Kintone App 233 (like Sanno University)
			const url = `${this.baseURL}/records.json?app=${this.appId}&limit=500&offset=0`

			console.log('🚀 Fetching credit details from Kintone:', url)

			const response = await axios.get(url, {
				headers: {
					'X-Cybozu-API-Token': this.token,
					'Content-Type': 'application/json',
				},
			})

			if (response.data && response.data.records) {
				// Filter records for the specific student
				const allRecords = response.data.records
				console.log('🔍 Looking for student:', studentId)

				// Debug: show all student IDs in the records
				const allStudentIds = allRecords
					.map(
						record =>
							record.student_id?.value ||
							record.学生ID?.value ||
							record.studentId?.value
					)
					.filter(Boolean)
				console.log('📋 Available student IDs in Kintone:', allStudentIds)

				const studentRecords = allRecords.filter(record => {
					const recordStudentId =
						record.student_id?.value ||
						record.学生ID?.value ||
						record.studentId?.value
					return recordStudentId === studentId
				})

				const creditDetails = studentRecords.map(record => ({
					recordId: record.$id.value,
					番号: record.レコード番号?.value || record.番号?.value || '',
					科目名: record.subjectName?.value || record.科目名?.value || '',
					評価: record.grade?.value || record.評価?.value || '',
					単位数: parseInt(
						record.subjectCredit?.value ||
							record.manualCredit?.value ||
							record.単位数?.value ||
							0
					),
					取得日: record.date?.value || record.取得日?.value || '',
					subjectId: record.subjectId?.value || '',
					subjectCategory: record.subjectCategory?.value || '',
					score: record.score?.value || '',
					gradeSubjectGroup: record.gradeSubjectGroup?.value || '',
					gradeUniverGroup: record.gradeUniverGroup?.value || '',
				}))

				console.log(
					`✅ Found ${creditDetails.length} credit records for student ${studentId} from Kintone`
				)
				return creditDetails
			}

			return []
		} catch (error) {
			console.error(
				`❌ Error fetching from Kintone for student ${studentId}:`,
				error.message
			)
			// Fallback to demo data if Kintone fails
			console.log(`🔄 Falling back to demo data for student ${studentId}`)
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
