import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../../utils/axiosUtils'
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Button } from '@mui/material'
import { useAlert } from '../../contexts/AlertContext'
import styles from './CreditDetails.module.css'

const CreditDetails = () => {
	const { studentId } = useParams()
	const navigate = useNavigate()
	const showAlert = useAlert()

	// Credit details page is currently disabled
	useEffect(() => {
		navigate('/')
		showAlert('Credit details page is currently disabled', 'info')
	}, [navigate, showAlert])

	const [student, setStudent] = useState(null)
	const [creditDetails, setCreditDetails] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [activeTab, setActiveTab] = useState('jdu')

	// Progress calculation
	const calculateProgress = () => {
		let totalRequired = 76
		if (activeTab === 'partner' && student?.partner_university) {
			// Partner university tab is active
			totalRequired = 124
		}

		if (!creditDetails.length) return { current: 0, total: totalRequired, percentage: 0 }

		const earnedCredits = creditDetails.reduce((total, credit) => {
			// Only count credits with passing grades (not E or F)
			if (credit.評価 && credit.評価 !== 'E' && credit.評価 !== 'F') {
				return total + (credit.単位数 || 0)
			}
			return total
		}, 0)

		const percentage = Math.min((earnedCredits / totalRequired) * 100, 100)

		return {
			current: earnedCredits,
			total: totalRequired,
			percentage,
		}
	}

	// Progress milestones based on university type
	const getProgressMilestones = () => {
		const progress = calculateProgress()
		const totalCredits = progress.total

		// Generate milestones dynamically based on total credits
		const milestones =
			totalCredits === 124
				? [
						{ label: '0単位', value: 0 },
						{ label: '31単位', value: 31 },
						{ label: '62単位', value: 62 },
						{ label: '93単位', value: 93 },
						{ label: '124単位', value: 124 },
					]
				: [
						{ label: '0単位', value: 0 },
						{ label: '19単位', value: 19 },
						{ label: '38単位', value: 38 },
						{ label: '61単位', value: 61 },
						{ label: '76単位', value: 76 },
					]

		const interval = totalCredits === 124 ? 31 : 19

		return milestones.map(milestone => {
			if (progress.current >= milestone.value) {
				return { ...milestone, status: 'completed' }
			} else if (progress.current >= milestone.value - interval) {
				return { ...milestone, status: 'current' }
			} else {
				return { ...milestone, status: 'future' }
			}
		})
	}

	// Grade badge styling
	const getGradeBadgeClass = grade => {
		switch (grade?.toUpperCase()) {
			case 'A':
				return styles.gradeA
			case 'B':
				return styles.gradeB
			case 'C':
				return styles.gradeC
			case 'D':
				return styles.gradeD
			case 'E':
			case 'F':
				return styles.gradeE
			default:
				return styles.gradeC
		}
	}

	// Fetch student credit details
	useEffect(() => {
		const fetchCreditDetails = async () => {
			try {
				setLoading(true)
				setError(null)

				const response = await axios.get(`/api/students/${studentId}/credit-details`)

				if (response.data && response.data.success) {
					setStudent(response.data.data)
					setCreditDetails(response.data.data.credit_details || [])
				} else {
					throw new Error('Invalid response format')
				}
			} catch (err) {
				console.error('Error fetching credit details:', err)
				setError(err.response?.data?.message || err.message || 'Failed to load credit details')
				showAlert('Credit details could not be loaded', 'error')
			} finally {
				setLoading(false)
			}
		}

		if (studentId) {
			fetchCreditDetails()
		}
	}, [studentId, showAlert])

	// Sync credit details from Kintone
	const handleSyncCredits = async () => {
		try {
			setLoading(true)
			const response = await axios.post(`/api/students/${studentId}/sync-credit-details`)

			if (response.data && response.data.success) {
				setCreditDetails(response.data.data.creditDetails || [])
				showAlert('Credit details synced successfully', 'success')
			}
		} catch (err) {
			console.error('Error syncing credit details:', err)
			showAlert('Failed to sync credit details', 'error')
		} finally {
			setLoading(false)
		}
	}

	const progress = calculateProgress()
	const milestones = getProgressMilestones()

	if (loading) {
		return (
			<div className={styles.loadingContainer}>
				<CircularProgress />
				<Typography variant='body1' sx={{ ml: 2 }}>
					Loading credit details...
				</Typography>
			</div>
		)
	}

	if (error) {
		return (
			<div className={styles.errorContainer}>
				<Alert severity='error' sx={{ mb: 2 }}>
					{error}
				</Alert>
				<Button variant='contained' onClick={() => navigate(-1)}>
					Go Back
				</Button>
			</div>
		)
	}

	return (
		<div className={styles.pageContainer}>
			{/* Header Tabs */}
			<div className={styles.headerTabs}>
				<div className={`${styles.tab} ${activeTab === 'jdu' ? styles.active : ''}`} onClick={() => setActiveTab('jdu')}>
					JDU
				</div>
				<div className={`${styles.tab} ${activeTab === 'partner' ? styles.active : ''}`} onClick={() => setActiveTab('partner')}>
					{student?.partner_university || '東京通信大学'}
				</div>
			</div>

			{/* Progress Section */}
			<div className={styles.progressSection}>
				<div className={styles.progressHeader}>
					<div className={styles.progressTitle}>学生単位数</div>
					<div className={styles.progressNumbers}>
						{progress.current}
						<span className={styles.progressSubtitle}>/{progress.total}</span>
					</div>
				</div>

				{/* Progress Timeline */}
				<div className={styles.progressTimeline}>
					{milestones.map((milestone, index) => (
						<div key={index} className={`${styles.progressStep} ${styles[milestone.status]}`}>
							<div className={`${styles.progressIndicator} ${styles[milestone.status]}`}>{milestone.status === 'completed' ? '✓' : milestone.value}</div>
							<div className={`${styles.progressLabel} ${styles[milestone.status]}`}>{milestone.label}</div>
						</div>
					))}
				</div>
			</div>

			{/* Student Information */}
			<div className={styles.studentInfoSection}>
				<Typography className={styles.studentInfoTitle}>学生詳細</Typography>
				<TableContainer component={Paper} className={styles.studentInfoTable}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>学生名</TableCell>
								<TableCell>提携大学</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							<TableRow>
								<TableCell>
									{student?.first_name} {student?.last_name}
								</TableCell>
								<TableCell>{student?.partner_university || '東京通信大学'}</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
			</div>

			{/* Credit Details Table */}
			<div className={styles.creditDetailsSection}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						padding: '24px 24px 16px',
					}}
				>
					<Typography className={styles.creditDetailsTitle}>JDU単位数</Typography>
					<Button variant='outlined' size='small' onClick={handleSyncCredits} disabled={loading}>
						Sync from Kintone
					</Button>
				</div>

				{creditDetails.length > 0 ? (
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
									<td>{credit.番号 || index + 1}</td>
									<td>{credit.科目名}</td>
									<td>
										<span className={`${styles.gradeBadge} ${getGradeBadgeClass(credit.評価)}`}>{credit.評価}</span>
									</td>
									<td>{credit.単位数}</td>
									<td>{credit.取得日}</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<div className={styles.noDataContainer}>
						<Typography variant='body1' color='textSecondary'>
							No credit details found. Click &quot;Sync from Kintone&quot; to load data.
						</Typography>
					</div>
				)}
			</div>
		</div>
	)
}

export default CreditDetails
