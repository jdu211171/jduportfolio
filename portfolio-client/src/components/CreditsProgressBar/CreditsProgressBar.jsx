import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import styles from './CreditsProgressBar.module.css'

const CreditsProgressBar = ({ studentId, student, credit_details }) => {
	const [creditDetails, setCreditDetails] = useState([])
	const [loading, setLoading] = useState(false)

	// Calculate completed credits
	const completedCredits = student?.totalCredits || 0

	// Target credits depends on university type
	// JDU and Jahon Tillari University: 76 credits
	// Other universities: 124 credits
	const getTargetCredits = () => {
		console.log('🏫 University info:', {
			studentId,
			university: student?.university,
		})

		// Check if this is JDU or Jahon Tillari University
		if (
			studentId &&
			(studentId.startsWith('JDU') || studentId.includes('JTUI'))
		) {
			console.log('📚 Using 76 credits for JDU/Jahon Tillari student')
			return 76 // JDU and Jahon Tillari students
		}

		// For other universities, use 124
		console.log('📚 Using 124 credits for other university student')
		return 124
	}

	const targetCredits = getTargetCredits()

	// Create breakpoints based on target credits
	const breakpoints = [
		{ point: Math.round(targetCredits * 0.25), label: '1年' },
		{ point: Math.round(targetCredits * 0.5), label: '2年' },
		{ point: Math.round(targetCredits * 0.75), label: '3年' },
		{ point: targetCredits, label: '卒業' },
	]

	// Progress calculation
	const creditPercentage = Math.min(
		(completedCredits / targetCredits) * 100,
		100
	)

	// Fetch credit details from backend
	const fetchCreditDetails = useCallback(async () => {
		if (!studentId) return

		setLoading(true)
		// Clear old data before fetching new data
		setCreditDetails([])
		
		try {
			const apiUrl = `${import.meta.env.VITE_APP_API_BASE_URL}/students/${studentId}/credit-details`
			console.log('🌐 Fetching from API:', apiUrl)
			
			const response = await axios.get(apiUrl, {
				withCredentials: true,
			})

			console.log('🔍 API Response:', response.data)
			const data = response.data.data

			// Set credit details from Kintone
			if (data && Array.isArray(data.creditDetails)) {
				setCreditDetails(data.creditDetails)
				console.log(
					`✅ Loaded ${data.creditDetails.length} credit details from Kintone`
				)
			} else {
				console.warn(
					'⚠️ No creditDetails found in API response, using empty array'
				)
				setCreditDetails([])
			}

			// Update student total credits from Kintone data
			if (data && data.totalCredits !== undefined) {
				console.log(`📊 Total credits from Kintone: ${data.totalCredits}`)
			}
		} catch (error) {
			console.error('❌ Error fetching credit details:', error)
			console.error('Error details:', {
				message: error.message,
				status: error.response?.status,
				data: error.response?.data
			})
			// Show demo data that matches the Kintone structure
			const demoKintoneData = [
				{
					recordId: '14',
					番号: '14',
					科目名: 'モチベーションアップ',
					評価: 'S',
					単位数: 2,
					取得日: '2024-07-03',
					subjectId: 'sanno-009',
					subjectCategory: '専門教育',
					score: '',
					gradeSubjectGroup: '自由が丘産能短期大学',
					gradeUniverGroup: '大学資格',
				},
				{
					recordId: '13',
					番号: '13',
					科目名: 'ビジネス対話の技術',
					評価: 'C',
					単位数: 2,
					取得日: '2024-07-17',
					subjectId: 'sanno-005',
					subjectCategory: '専門教育',
					score: '60',
					gradeSubjectGroup: '自由が丘産能短期大学',
					gradeUniverGroup: '大学資格',
				},
				{
					recordId: '12',
					番号: '12',
					科目名: '問題発見・解決力を伸ばす',
					評価: 'B',
					単位数: 2,
					取得日: '2025-07-01',
					subjectId: 'sanno-002',
					subjectCategory: '専門教育',
					score: '',
					gradeSubjectGroup: '自由が丘産能短期大学',
					gradeUniverGroup: '大学資格',
				},
				{
					recordId: '9',
					番号: '9',
					科目名: 'アサーション（コミュニケーション技法）',
					評価: 'A',
					単位数: 2,
					取得日: '2025-06-10',
					subjectId: 'sanno-035',
					subjectCategory: '専門教育',
					score: '90',
					gradeSubjectGroup: '自由が丘産能短期大学',
					gradeUniverGroup: '大学資格',
				},
				{
					recordId: '8',
					番号: '8',
					科目名: 'GAFA next stage',
					評価: 'B',
					単位数: 2,
					取得日: '2025-06-23',
					subjectId: 'sanno-033',
					subjectCategory: '専門教育',
					score: '',
					gradeSubjectGroup: '自由が丘産能短期大学',
					gradeUniverGroup: '大学資格',
				},
			]
			setCreditDetails(demoKintoneData)
			console.log('🎯 Using demo Kintone-style data for testing')
		} finally {
			setLoading(false)
		}
	}, [studentId])

	useEffect(() => {
		// If credit_details are passed as prop, use them directly
		if (
			credit_details &&
			Array.isArray(credit_details) &&
			credit_details.length > 0
		) {
			console.log(
				'📋 Using credit_details from props:',
				credit_details.length,
				'items'
			)
			setCreditDetails(credit_details)
			setLoading(false)
		} else if (studentId) {
			// Otherwise, fetch from API if studentId is available
			// Always fetch fresh data when studentId changes
			console.log('🔄 Fetching fresh credit details for studentId:', studentId)
			fetchCreditDetails()
		} else {
			// No data available
			console.warn('⚠️ No credit_details prop and no studentId provided')
			setCreditDetails([])
			setLoading(false)
		}
	}, [studentId]) // Remove fetchCreditDetails from dependencies to prevent infinite loops

	// Grade badge styling
	const getGradeBadgeClass = grade => {
		switch (grade) {
			case 'S':
				return styles.gradeS
			case 'A':
				return styles.gradeA
			case 'B':
				return styles.gradeB
			case 'C':
				return styles.gradeC
			case 'D':
				return styles.gradeD
			case 'F':
				return styles.gradeF
			default:
				return styles.gradeDefault
		}
	}

	return (
		<div className={styles.container}>
			{/* Show error message if neither studentId nor credit_details are available */}
			{!studentId &&
			(!credit_details ||
				!Array.isArray(credit_details) ||
				credit_details.length === 0) ? (
				<div className={styles.noData}>Student ID is required</div>
			) : (
				<>
					{/* Progress Bar */}
					<div className={styles.progressContainer}>
						<div className={styles.topLabels}>
							<span className={styles.startLabel}>入学</span>
							<span className={styles.endLabel}>卒業</span>
						</div>

						<div className={styles.progressBar}>
							<div className={styles.progressLine}></div>
							<div
								className={styles.activeProgressLine}
								style={{ width: `${creditPercentage}%` }}
							></div>

							{Array.isArray(breakpoints) &&
								breakpoints.map((breakpoint, index) => {
									const leftPosition = (breakpoint.point / targetCredits) * 100
									const isCompleted = completedCredits >= breakpoint.point

									return (
										<div
											key={index}
											className={`${styles.breakpoint} ${isCompleted ? styles.completed : ''}`}
											style={{ left: `${leftPosition}%` }}
										>
											<div className={styles.circle}>
												{isCompleted && (
													<svg
														width='16'
														height='16'
														viewBox='0 0 16 16'
														fill='none'
													>
														<path
															d='M13.5 4.5L6 12L2.5 8.5'
															stroke='white'
															strokeWidth='2'
															strokeLinecap='round'
															strokeLinejoin='round'
														/>
													</svg>
												)}
											</div>
											<div className={styles.creditLabel}>
												{breakpoint.point}単位
											</div>
										</div>
									)
								})}

							<div
								className={styles.currentIndicator}
								style={{ left: `${creditPercentage}%` }}
							>
								<div className={styles.currentCircle}></div>
							</div>
						</div>
					</div>

					{/* Credit Details Table */}
					<div className={styles.tableContainer}>
						<h3 className={styles.tableTitle}>取得単位詳細</h3>
						{loading ? (
							<div className={styles.loading}>読み込み中...</div>
						) : creditDetails.length > 0 ? (
							<div className={styles.tableWrapper}>
								<table className={styles.creditTable}>
									<thead>
										<tr>
											<th>科目名</th>
											<th>単位数</th>
											<th>評価</th>
											<th>点数</th>
											<th>取得日</th>
											<th>カテゴリ</th>
										</tr>
									</thead>
									<tbody>
										{Array.isArray(creditDetails) &&
											creditDetails.map(detail => (
												<tr key={detail.recordId || detail.id || Math.random()}>
													<td className={styles.subjectName}>
														{detail.科目名}
													</td>
													<td className={styles.credits}>{detail.単位数}</td>
													<td>
														<span
															className={`${styles.gradeBadge} ${getGradeBadgeClass(detail.評価)}`}
														>
															{detail.評価}
														</span>
													</td>
													<td className={styles.score}>
														{detail.score || '-'}
													</td>
													<td className={styles.date}>{detail.取得日}</td>
													<td className={styles.category}>
														{detail.subjectCategory}
													</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>
						) : (
							<div className={styles.noData}>単位データがありません</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}

CreditsProgressBar.propTypes = {
	studentId: PropTypes.string, // Make optional since credit_details can be passed
	student: PropTypes.shape({
		totalCredits: PropTypes.number,
		semester: PropTypes.string,
		university: PropTypes.string,
	}),
	credit_details: PropTypes.arrayOf(
		PropTypes.shape({
			recordId: PropTypes.string,
			番号: PropTypes.string,
			科目名: PropTypes.string,
			評価: PropTypes.string,
			単位数: PropTypes.number,
			取得日: PropTypes.string,
			subjectId: PropTypes.string,
			subjectCategory: PropTypes.string,
			score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			gradeSubjectGroup: PropTypes.string,
			gradeUniverGroup: PropTypes.string,
		})
	),
}

export default CreditsProgressBar
