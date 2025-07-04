import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	CircularProgress,
	Alert,
} from '@mui/material'
import { useAlert } from '../../contexts/AlertContext'
import CreditsProgressBar from '../../components/CreditsProgressBar/CreditsProgressBar'
import styles from './CreditDetails.module.css'

const CreditDetails = () => {
	const { studentId } = useParams()
	const navigate = useNavigate()
	const showAlert = useAlert()

	const [student, setStudent] = useState(null)
	const [creditDetails, setCreditDetails] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [activeTab, setActiveTab] = useState('jdu')

	// Progress calculation
	const calculateProgress = () => {
		if (!creditDetails.length) return { current: 0, total: 76, percentage: 0 }

		const earnedCredits = creditDetails.reduce((total, credit) => {
			// Only count credits with passing grades (not E or F)
			if (credit.評価 && credit.評価 !== 'E' && credit.評価 !== 'F') {
				return total + (credit.単位数 || 0)
			}
			return total
		}, 0)

		const totalRequired = 76 // Based on the image
		const percentage = Math.min((earnedCredits / totalRequired) * 100, 100)

		return {
			current: earnedCredits,
			total: totalRequired,
			percentage,
		}
	}

	// Progress milestones based on the image
	const getProgressMilestones = () => {
		const progress = calculateProgress()
		const milestones = [
			{ label: '0単位', value: 0 },
			{ label: '19単位', value: 19 },
			{ label: '38単位', value: 38 },
			{ label: '61単位', value: 61 },
			{ label: '76単位', value: 76 },
		]

		return milestones.map(milestone => {
			if (progress.current >= milestone.value) {
				return { ...milestone, status: 'completed' }
			} else if (progress.current >= milestone.value - 19) {
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

				console.log('Fetching credit details for student:', studentId)
				const response = await axios.get(
					`/api/students/${studentId}/credit-details`
				)

				console.log('API Response:', response.data)

				if (response.data && response.data.success) {
					setStudent(response.data.data)
					setCreditDetails(response.data.data.credit_details || [])
					console.log('Credit details set:', response.data.data.credit_details?.length || 0, 'items')
				} else {
					throw new Error('Invalid response format')
				}
			} catch (err) {
				console.error('Error fetching credit details:', err)
				setError(
					err.response?.data?.message ||
						err.message ||
						'Failed to load credit details'
				)
				showAlert('Credit details could not be loaded', 'error')
			} finally {
				setLoading(false)
			}
		}

		if (studentId) {
			console.log('Student ID from params:', studentId)
			fetchCreditDetails()
		} else {
			console.log('No student ID found in params')
		}
	}, [studentId, showAlert])

	// Sync credit details from Kintone
	const handleSyncCredits = async () => {
		try {
			setLoading(true)
			const response = await axios.post(
				`/api/students/${studentId}/sync-credit-details`
			)

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
				<div
					className={`${styles.tab} ${activeTab === 'jdu' ? styles.active : ''}`}
					onClick={() => setActiveTab('jdu')}
				>
					JDU
				</div>
				<div
					className={`${styles.tab} ${activeTab === 'partner' ? styles.active : ''}`}
					onClick={() => setActiveTab('partner')}
				>
					{student?.partner_university || '東京通信大学'}
				</div>
			</div>

			{/* Progress Section with Tables */}
			<CreditsProgressBar 
				breakpoints={breakpoints}
				unit="単位"
				credits={42} // Demo value
				semester={3} // Demo value
				studentId={studentId}
				student={student}
			/>
		</div>
	)
}

export default CreditDetails
