const axios = require('axios')
const apps = require('../config/kintoneConfig')

class KintoneCreditDetailsService {
	constructor() {
		this.baseURL = process.env.KINTONE_API_BASE_URL || 'https://jdu.cybozu.com'
		this.baseURL = this.baseURL.endsWith('/k/v1')
			? this.baseURL
			: `${this.baseURL}/k/v1`
		this.appId = apps.credit_details.appId
		this.token = apps.credit_details.token
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
				const studentRecords = allRecords.filter(record => {
					const recordStudentId =
						record.student_id?.value ||
						record.学生ID?.value ||
						record.studentId?.value
					return recordStudentId === studentId
				})

				const creditDetails = studentRecords.map(record => ({
					recordId: record.$id.value,
					番号: record.番号?.value || '',
					科目名: record.科目名?.value || '',
					評価: record.評価?.value || '',
					単位数: parseInt(record.単位数?.value || 0),
					取得日: record.取得日?.value || '',
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
