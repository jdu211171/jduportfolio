import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import styles from './CreditsProgressBar.module.css'

const CreditsProgressBar = ({ studentId, student }) => {
	const [creditDetails, setCreditDetails] = useState([])
	const [loading, setLoading] = useState(false)

	// Calculate completed credits
	const completedCredits = student?.totalCredits || 0 // Remove hardcoded 44, get from Kintone

	// Target credits depends on university type
	// JDU and Jahon Tillari University: 76 credits
	// Other universities (like the one with 14 credits): 124 credits
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
			console.log('📚 Using 76 credits for JDU student')
			return 76 // JDU students
		}

		// Check if student object has university info
		if (student?.university) {
			const uni = student.university.toLowerCase()
			if (
				uni.includes('jdu') ||
				uni.includes('jahon tillari') ||
				uni.includes('world languages')
			) {
				console.log('📚 Using 76 credits for Jahon Tillari/JDU university')
				return 76
			}
		}

		console.log('📚 Using 124 credits for other university')
		return 124 // Other universities (default graduation requirement)
	}

	const targetCredits = getTargetCredits()
	const percentage = Math.min((completedCredits / targetCredits) * 100, 100)

	// Milestone breakpoints - adjust based on target credits
	const getBreakpoints = () => {
		if (targetCredits === 76) {
			// JDU and Jahon Tillari University breakpoints
			return [
				{ point: 0, label: '0単位', completed: true },
				{ point: 19, label: '19単位', completed: completedCredits >= 19 },
				{ point: 38, label: '38単位', completed: completedCredits >= 38 },
				{ point: 57, label: '57単位', completed: completedCredits >= 57 },
				{ point: 76, label: '76単位', completed: completedCredits >= 76 },
			]
		} else {
			// Other universities (124 credits) breakpoints
			return [
				{ point: 0, label: '0単位', completed: true },
				{ point: 31, label: '31単位', completed: completedCredits >= 31 },
				{ point: 62, label: '62単位', completed: completedCredits >= 62 },
				{ point: 93, label: '93単位', completed: completedCredits >= 93 },
				{ point: 124, label: '124単位', completed: completedCredits >= 124 },
			]
		}
	}

	const breakpoints = getBreakpoints()

	const fetchCreditDetails = useCallback(async () => {
		if (!studentId) return

		setLoading(true)

		try {
			const response = await axios.get(
				`${import.meta.env.VITE_APP_API_BASE_URL}/students/${studentId}/credit-details`
			)
			const data = response.data.data // Get the actual data from response

			// Set credit details from Kintone (like Sanno University)
			setCreditDetails(data.creditDetails || [])

			// Update student total credits from Kintone data
			if (data.totalCredits !== undefined) {
				// This will be used by the parent component to update the progress
				console.log(`📊 Total credits from Kintone: ${data.totalCredits}`)
			}
		} catch (error) {
			console.error('Error fetching credit details:', error)
			// Show demo data for now
			setCreditDetails([
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
			])
		} finally {
			setLoading(false)
		}
	}, [studentId])

	useEffect(() => {
		fetchCreditDetails()
	}, [fetchCreditDetails])

	const getGradeColor = grade => {
		switch (grade) {
			case 'A':
				return '#4CAF50' // Green
			case 'B':
				return '#8BC34A' // Light Green
			case 'C':
				return '#FFC107' // Amber
			default:
				return '#9E9E9E' // Grey
		}
	}

	return (
		<div className={styles.container}>
			{/* Header */}
			<div className={styles.header}>
				<h3>学生単位数</h3>
				<div className={styles.creditScore}>
					<span className={styles.currentCredits}>{completedCredits}</span>
					<span className={styles.separator}>/</span>
					<span className={styles.totalCredits}>{targetCredits}</span>
				</div>
			</div>

			{/* Progress Bar Container */}
			<div className={styles.progressContainer}>
				{/* Top Labels */}
				<div className={styles.topLabels}>
					<span className={styles.startLabel}>入学</span>
					<span className={styles.endLabel}>卒業</span>
				</div>

				{/* Progress Bar */}
				<div className={styles.progressBar}>
					{/* Background Line */}
					<div className={styles.progressLine}></div>

					{/* Active Progress Line */}
					<div
						className={styles.activeProgressLine}
						style={{ width: `${percentage}%` }}
					></div>

					{/* Breakpoints */}
					{breakpoints.map((breakpoint, index) => (
						<div
							key={index}
							className={`${styles.breakpoint} ${breakpoint.completed ? styles.completed : ''}`}
							style={{ left: `${(breakpoint.point / targetCredits) * 100}%` }}
						>
							<div className={styles.circle}></div>
							<div className={styles.creditLabel}>{breakpoint.label}</div>
						</div>
					))}

					{/* Current Position Indicator */}
					<div
						className={styles.currentIndicator}
						style={{ left: `${percentage}%` }}
					>
						<div className={styles.currentCircle}></div>
					</div>
				</div>
			</div>

			{/* Credit Details Table Section */}
			{creditDetails.length > 0 && (
				<div className={styles.detailsSection}>
					<div className={styles.detailsHeader}>
						<h4>取得単位詳細</h4>
					</div>

					<div className={styles.tableContainer}>
						<table className={styles.creditTable}>
							<thead>
								<tr>
									<th>番号</th>
									<th>科目名</th>
									<th>評価</th>
									<th>単位数</th>
									<th>取得日</th>
								</tr>
							</thead>
							<tbody>
								{creditDetails.map((credit, index) => (
									<tr key={credit.recordId || index}>
										<td>{credit.番号}</td>
										<td className={styles.subjectName}>{credit.科目名}</td>
										<td>
											<span
												className={styles.grade}
												style={{ backgroundColor: getGradeColor(credit.評価) }}
											>
												{credit.評価}
											</span>
										</td>
										<td className={styles.credits}>{credit.単位数}</td>
										<td>{credit.取得日}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{loading && <div className={styles.loading}>読み込み中...</div>}
		</div>
	)
}

CreditsProgressBar.propTypes = {
	studentId: PropTypes.string,
	student: PropTypes.shape({
		totalCredits: PropTypes.number,
		university: PropTypes.string,
	}),
}

export default CreditsProgressBar
