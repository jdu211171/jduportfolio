const axios = require('axios')
const apps = require('../config/kintoneConfig')

class KintoneCreditDetailsService {
	constructor() {
		this.baseURL = process.env.KINTONE_API_BASE_URL || 'https://jdu.cybozu.com'
		this.baseURL = this.baseURL.endsWith('/k/v1') ? this.baseURL : `${this.baseURL}/k/v1`

		// Use App 233 (credit_details) since curl test confirmed it works
		this.appId = apps.credit_details.appId
		this.token = apps.credit_details.token

		console.log('🔧 KintoneCreditDetailsService initialized:', {
			baseURL: this.baseURL,
			appId: this.appId,
			tokenExists: !!this.token,
			tokenValue: this.token ? `${this.token.substring(0, 10)}...` : 'N/A',
			// fullToken: this.token, // Temporary debug - remove after fixing
			usingApp: this.appId === '232' ? 'student_credits (232)' : 'credit_details (233)',
			envVars: {
				KINTONE_STUDENT_CREDITS_TOKEN: !!process.env.KINTONE_STUDENT_CREDITS_TOKEN,
				KINTONE_CREDIT_DETAILS_TOKEN: !!process.env.KINTONE_CREDIT_DETAILS_TOKEN,
			},
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
				console.error('❌ KINTONE_CREDIT_DETAILS_TOKEN not found in environment variables')
				console.log('Please set KINTONE_CREDIT_DETAILS_TOKEN in .env file')
				return []
			}

			// Fetch data from Kintone App 233
			let url = `${this.baseURL}/records.json?app=${this.appId}&limit=500&offset=0`

			// For debugging: first try without filter to see all field names
			console.log(`🔍 Fetching records from App ${this.appId} to see field structure...`)

			// Add filter to search for specific student
			if (studentId) {
				const query = `studentId = "${studentId}"`
				url += `&query=${encodeURIComponent(query)}`
				console.log('🔍 Using query filter:', query)
			}

			console.log('🚀 Fetching credit details from Kintone:', url)
			console.log('🔑 Using headers:', {
				'X-Cybozu-API-Token': this.token,
				'Content-Type': 'application/json',
			})

			const response = await axios.get(url, {
				headers: {
					'X-Cybozu-API-Token': this.token,
					// Remove Content-Type header for GET request (might cause issues)
					// 'Content-Type': 'application/json',
				},
				timeout: 10000, // 10 second timeout
			})

			console.log('📡 Kintone API Response Status:', response.status)
			console.log('📡 Kintone API Response Headers:', response.headers)
			console.log('📡 Kintone API Response Data:', JSON.stringify(response.data, null, 2))

			if (response.data && response.data.records) {
				// Filter records for the specific student
				const allRecords = response.data.records
				console.log('🔍 Looking for student:', studentId)
				console.log('📊 Total records found:', allRecords.length)

				// Debug: show first record structure
				if (allRecords.length > 0) {
					console.log('🔬 First record structure:', JSON.stringify(allRecords[0], null, 2))
					console.log('🔬 First record field names:', Object.keys(allRecords[0]))
				}

				// Debug: show all student IDs in the records
				const allStudentIds = allRecords.map(record => record.studentId?.value).filter(Boolean)
				console.log('📋 Available student IDs in Kintone:', allStudentIds)

				const studentRecords = allRecords.filter(record => {
					const recordStudentId = record.studentId?.value
					return recordStudentId === studentId
				})

				const creditDetails = studentRecords.map(record => ({
					recordId: record.$id.value,
					番号: record.レコード番号?.value || '',
					科目名: record.subjectName?.value || '',
					評価: record.grade?.value || '',
					単位数: parseInt(record.subjectCredit?.value || record.manualCredit?.value || 0),
					取得日: record.date?.value || '',
					subjectId: record.subjectId?.value || '',
					subjectCategory: record.subjectCategory?.value || '',
					score: record.score?.value || '',
					gradeSubjectGroup: record.gradeSubjectGroup?.value || '',
					gradeUniverGroup: record.gradeUniverGroup?.value || '',
				}))

				return creditDetails
			}

			return []
		} catch (error) {
			console.error(`❌ Error fetching from Kintone for student ${studentId}:`, error.message)
			console.error('Full error:', error)
			if (error.response) {
				console.error('Response status:', error.response.status)
				console.error('Response data:', error.response.data)
			}
			// Return empty array instead of demo data to see actual issues
			return []
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
			214843: [
				{
					recordId: 'demo_214843_001',
					番号: '001',
					科目名: 'プログラミング基礎',
					評価: 'A',
					単位数: 4,
					取得日: '2024-04-01',
				},
				{
					recordId: 'demo_214843_002',
					番号: '002',
					科目名: 'システム設計',
					評価: 'B',
					単位数: 3,
					取得日: '2024-05-15',
				},
				{
					recordId: 'demo_214843_003',
					番号: '003',
					科目名: 'プロジェクト管理',
					評価: 'A',
					単位数: 2,
					取得日: '2024-06-10',
				},
			],
		}

		return demoData[studentId] || []
	}
}

module.exports = new KintoneCreditDetailsService()
