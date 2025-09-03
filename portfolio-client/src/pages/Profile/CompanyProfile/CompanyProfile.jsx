import React, {
	useEffect,
	useState,
	useContext,
	useRef,
	useCallback,
} from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import axios from '../../../utils/axiosUtils'
import { useAlert } from '../../../contexts/AlertContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useAtom } from 'jotai'
import {
	editModeAtom,
	saveStatusAtom,
	editDataAtom,
} from '../../../atoms/profileEditAtoms'
import {
	Box,
	Typography,
	Chip,
	Avatar,
	Grid,
	Button,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Snackbar,
	Alert,
	LinearProgress,
	Switch,
	Tabs,
	Tab,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import RestoreIcon from '@mui/icons-material/Restore'
// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
// Swiper CSS
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
// Icon imports from assets folder
import BusinessIcon from '../../../assets/icons/buildingLine.svg'
import WorkIcon from '../../../assets/icons/briefcase-3-line.svg'
import PersonIcon from '../../../assets/icons/group-line.svg'
import InfoIcon from '../../../assets/icons/file-text-line.svg'
import EditIcon from '../../../assets/icons/edit.svg'
import CheckboxBlankIcon from '../../../assets/icons/checkbox-blank.svg'
import CheckboxBlankIcon2 from '../../../assets/icons/checkbox-blank2.svg'
import DeleteIcon from '../../../assets/icons/delete-bin-3-line.svg'

import styles from './CompanyProfile.module.css'
import translations from '../../../locales/translations'
import { UserContext } from '../../../contexts/UserContext'
import RecruiterFiles from '../../../components/RecruiterFiles'

// Helper functions moved outside component
const safeArrayRender = array => {
	if (!Array.isArray(array)) return []
	return array
}

const safeStringValue = value => {
	if (value === null || value === undefined) return ''
	if (typeof value === 'object') return ''
	return String(value)
}

const safeParse = data => {
	if (!data) return []
	if (Array.isArray(data)) return data
	if (typeof data === 'string') {
		// Try JSON parse first
		try {
			const parsed = JSON.parse(data)
			return Array.isArray(parsed) ? parsed : []
		} catch {
			// If JSON parse fails, treat as comma-separated string
			return data
				.split(',')
				.map(item => item.trim())
				.filter(item => item)
		}
	}
	return []
}

// Determine if a value has meaningful content for view mode
const hasContent = value => {
	if (value === null || value === undefined) return false
	if (typeof value === 'string') return value.trim().length > 0
	if (Array.isArray(value)) return value.length > 0
	if (typeof value === 'object') return Object.keys(value).length > 0
	if (typeof value === 'number' || typeof value === 'boolean') return true
	return !!value
}

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = url => {
	if (!url) return null

	const regexPatterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
		/youtube\.com\/watch\?.*v=([^&\n?#]+)/,
	]

	for (const pattern of regexPatterns) {
		const match = url.match(pattern)
		if (match) return match[1]
	}
	return null
}

// Box style component for regular content
const ContentBox = ({ children }) => (
	<Box className={styles.contentBox}>{children}</Box>
)

ContentBox.propTypes = {
	children: PropTypes.node.isRequired,
}

// Box style component for header without padding
const HeaderContentBox = ({ children }) => (
	<Box className={styles.headerContentBox}>{children}</Box>
)

HeaderContentBox.propTypes = {
	children: PropTypes.node.isRequired,
}

// MOVED OUTSIDE: Custom text field component with focus handling
const CustomTextField = React.memo(
	({
		value = '',
		onChange,
		multiline = false,
		placeholder = '',
		minRows = 1,
		fieldKey = '',
		onFocus = null,
		onBlur = null,
		inputRef = null,
		maxLength = 500,
	}) => {
		const handleChange = useCallback(
			e => {
				if (onChange) {
					onChange(e)
				}
			},
			[onChange]
		)

		const handleFocus = useCallback(
			e => {
				if (onFocus) {
					onFocus(e)
				}
			},
			[onFocus]
		)

		const handleBlur = useCallback(
			e => {
				if (onBlur) {
					onBlur(e)
				}
			},
			[onBlur]
		)

		return (
			<TextField
				ref={inputRef}
				fullWidth
				variant='outlined'
				size='small'
				value={safeStringValue(value)}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				multiline={multiline}
				minRows={multiline ? minRows : 1}
				placeholder={placeholder}
				className={styles.customTextField}
				inputProps={{
					maxLength: maxLength,
				}}
				sx={{
					'& .MuiOutlinedInput-root': {
						position: 'relative',
						zIndex: 1000,
					},
					'& .MuiInputBase-input': {
						zIndex: 1000,
					},
				}}
				autoComplete='off'
				spellCheck='false'
			/>
		)
	}
)

CustomTextField.displayName = 'CustomTextField'

CustomTextField.propTypes = {
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func.isRequired,
	multiline: PropTypes.bool,
	placeholder: PropTypes.string,
	minRows: PropTypes.number,
	fieldKey: PropTypes.string,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	inputRef: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.shape({ current: PropTypes.any }),
	]),
	maxLength: PropTypes.number,
}

// Display text component
const DisplayText = ({ children }) => (
	<Box className={styles.displayText}>
		<Typography variant='body1' className={styles.displayTextContent}>
			{safeStringValue(children)}
		</Typography>
	</Box>
)

DisplayText.propTypes = {
	children: PropTypes.node.isRequired,
}

// Section header component
const SectionHeader = ({ icon, title }) => (
	<Box className={styles.sectionHeader}>
		<img src={icon} alt={title} className={styles.sectionIcon} />
		<Typography
			variant='h6'
			className={styles.sectionTitle}
			sx={{ fontWeight: 600 }}
		>
			{title}
		</Typography>
	</Box>
)

SectionHeader.propTypes = {
	icon: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
}

const CompanyProfile = ({ userId = 0 }) => {
	const role = sessionStorage.getItem('role')
	const navigate = useNavigate()
	const location = useLocation()
	const { recruiterId } = location.state || {}
	const { language } = useContext(UserContext)
	const { language: langContext, changeLanguage } = useLanguage()
	const showAlert = useAlert()
	const currentLanguage = language || langContext || 'en'
	const t = translations[currentLanguage] || translations.en

	const id = userId !== 0 ? userId : recruiterId

	const [company, setCompany] = useState(null)
	const [loading, setLoading] = useState(false)
	const [editMode, setEditMode] = useAtom(editModeAtom)
	const [activeTab, setActiveTab] = useState('company')
	const [saveStatus, setSaveStatus] = useAtom(saveStatusAtom)

	// Initial editData state
	const initialEditData = {
		newRequiredSkill: '',
		newWelcomeSkill: '',
		newTargetAudience: '',
		business_overview: '',
		target_audience: [],
		required_skills: [],
		welcome_skills: [],
		company_description: '',
		company_Address: '',
		established_Date: '',
		employee_Count: '',
		work_location: '',
		work_hours: '',
		salary: '',
		benefits: '',
		selection_process: '',
		company_video_url: [],
		newVideoUrl: '',
		first_name: '',
		last_name: '',
		company_name: '',
		photo: '',
		// New fields
		tagline: '',
		company_website: '',
		company_capital: '',
		company_revenue: '',
		company_representative: '',
		job_title: '',
		job_description: '',
		number_of_openings: '',
		employment_type: '',
		probation_period: '',
		employment_period: '',
		recommended_skills: [],
		recommended_licenses: [],
		recommended_other: [],
		newRecommendedSkill: '',
		newRecommendedLicense: '',
		newRecommendedOther: '',
		salary_increase: '',
		bonus: '',
		allowances: '',
		holidays_vacation: '',
		other_notes: '',
		interview_method: '',
		// New fields
		japanese_level: '',
		application_requirements_other: '',
		retirement_benefit: '',
		telework_availability: '',
		housing_availability: '',
		relocation_support: '',
		airport_pickup: '',
		intro_page_thumbnail: '',
	}

	const [editData, setEditData] = useAtom(editDataAtom)

	// Navigation and persistence state
	const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
	const [pendingNavigation, setPendingNavigation] = useState(null)
	const [showRecoveryDialog, setShowRecoveryDialog] = useState(false)
	const [persistedData, setPersistedData] = useState({
		exists: false,
		data: null,
		timestamp: null,
	})

	// Simple form state for unsaved changes tracking
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
	const [pendingLanguageChange, setPendingLanguageChange] = useState(null)

	// React Hook Form setup
	const {
		control,
		handleSubmit,
		formState: { isDirty },
		reset,
		getValues,
		setValue,
	} = useForm({
		defaultValues: company || {},
		mode: 'onChange',
	})

	// Watch for form changes
	useEffect(() => {
		setHasUnsavedChanges(isDirty)
	}, [isDirty])

	// Language change handling
	const handleLanguageChange = newLanguage => {
		if (editMode && hasUnsavedChanges) {
			setPendingLanguageChange(newLanguage)
			setShowUnsavedDialog(true)
		} else {
			changeLanguage(newLanguage)
		}
	}

	// Simple update function
	const handleUpdate = async data => {
		// Process the data correctly
		const processedData = {
			...data,
			// Convert null to empty strings for text fields
			company_Address: data.company_Address || '',
			established_Date: data.established_Date || '',
			employee_Count: data.employee_Count || '',
			work_location: data.work_location || '',
			work_hours: data.work_hours || '',
			salary: data.salary || '',
			benefits: data.benefits || '',
			selection_process: data.selection_process || '',

			// New optional strings
			japanese_level: data.japanese_level || '',
			application_requirements_other: data.application_requirements_other || '',
			retirement_benefit: data.retirement_benefit || '',
			telework_availability: data.telework_availability || '',
			housing_availability: data.housing_availability || '',
			relocation_support: data.relocation_support || '',
			airport_pickup: data.airport_pickup || '',
			intro_page_thumbnail: data.intro_page_thumbnail || '',

			// These should be strings (TEXT in database)
			business_overview: data.business_overview || '',
			target_audience: Array.isArray(data.target_audience)
				? data.target_audience.join(', ')
				: data.target_audience || '',
			required_skills: Array.isArray(data.required_skills)
				? data.required_skills.join(', ')
				: data.required_skills || '',
			welcome_skills: Array.isArray(data.welcome_skills)
				? data.welcome_skills.join(', ')
				: data.welcome_skills || '',
			// New arrays-as-text
			recommended_skills: Array.isArray(data.recommended_skills)
				? data.recommended_skills.join(', ')
				: data.recommended_skills || '',
			recommended_licenses: Array.isArray(data.recommended_licenses)
				? data.recommended_licenses.join(', ')
				: data.recommended_licenses || '',
			recommended_other: Array.isArray(data.recommended_other)
				? data.recommended_other.join(', ')
				: data.recommended_other || '',

			// These should remain as arrays (JSONB in database)
			gallery: Array.isArray(data.gallery) ? data.gallery : [],
			company_video_url: Array.isArray(data.company_video_url)
				? data.company_video_url
				: [],
		}

		// Remove any temporary fields that shouldn't be sent to backend
		delete processedData.newRequiredSkill
		delete processedData.newWelcomeSkill
		delete processedData.newVideoUrl
		delete processedData.newRecommendedSkill
		delete processedData.newRecommendedLicense
		delete processedData.newRecommendedOther

		// Simple implementation - just make API call
		await axios.put(`/api/recruiters/${id}`, processedData)
	}

	// Simple save function
	const handleSave = async () => {
		try {
			// Use editData instead of getValues() since this component uses state, not React Hook Form
			const formData = editData

			await handleUpdate(formData)

			// Refresh data from backend to ensure consistency
			await fetchCompany()

			// Exit edit mode
			setEditMode(false)

			// Clear unsaved changes flag
			setHasUnsavedChanges(false)

			// Clear any saved drafts
			clearStorage()

			// Show success message
			showAlert(t.changes_saved || 'Changes saved successfully!', 'success')
		} catch (error) {
			showAlert('Error saving changes', 'error')
		}
	}

	// Simple cancel function
	const handleCancel = () => {
		setEditMode(false)
		reset(company)
		setHasUnsavedChanges(false)
	}

	// localStorage functions
	const loadFromStorage = () => {
		try {
			const storageKey = `company_profile_edit_${id}_${role}`
			const savedData = localStorage.getItem(storageKey)
			return savedData ? JSON.parse(savedData) : null
		} catch (error) {
			return null
		}
	}

	const saveToStorage = data => {
		try {
			const storageKey = `company_profile_edit_${id}_${role}`
			localStorage.setItem(storageKey, JSON.stringify(data))
		} catch (error) {}
	}

	const clearStorage = () => {
		try {
			const storageKey = `company_profile_edit_${id}_${role}`
			localStorage.removeItem(storageKey)
		} catch (error) {}
	}

	const updateOriginalData = data => {
		// Simple implementation - just reset form with new data
		reset(data)
	}

	const saveToStorageIfChanged = data => {
		// Auto-save drafts when editing
		if (editMode && data) {
			saveToStorage(data)
			return true
		}
		return false
	}

	const hasChangesFromOriginal = data => {
		// Simple check - just use isDirty from React Hook Form
		return hasUnsavedChanges
	}

	// Additional simple replacements for removed functions

	const handleRecoverData = () => {
		// Simple implementation - no complex recovery
		setShowRecoveryDialog(false)
	}

	const handleDiscardRecovery = () => {
		// Simple implementation - no complex recovery
		setShowRecoveryDialog(false)
	}

	// Refs for maintaining focus
	const inputRefs = useRef({})
	const scrollPositionRef = useRef(0)

	// Warn before leaving page with unsaved changes
	useEffect(() => {
		const handleBeforeUnload = e => {
			if (editMode && role === 'Recruiter') {
				e.preventDefault()
				e.returnValue = ''
			}
		}

		window.addEventListener('beforeunload', handleBeforeUnload)
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload)
		}
	}, [editMode, role])

	// Track navigation attempts when in edit mode
	useEffect(() => {
		if (!role !== 'Recruiter') return

		let isNavigating = false
		let navigationBlocked = false

		// Override history methods to intercept navigation
		const originalPushState = window.history.pushState
		const originalReplaceState = window.history.replaceState

		const handleNavigation = url => {
			// Skip if we're already handling navigation or if edit mode is false
			if (isNavigating || navigationBlocked || !editMode) return true

			if (url && url !== window.location.pathname) {
				isNavigating = true
				navigationBlocked = true
				setPendingNavigation({ pathname: url })
				setShowUnsavedWarning(true)
				// Prevent the navigation by staying on current page
				setTimeout(() => {
					window.history.pushState(null, '', location.pathname)
					isNavigating = false
				}, 0)
				return false
			}
			return true
		}

		window.history.pushState = function (state, title, url) {
			if (handleNavigation(url)) {
				originalPushState.apply(window.history, arguments)
			}
		}

		window.history.replaceState = function (state, title, url) {
			if (handleNavigation(url)) {
				originalReplaceState.apply(window.history, arguments)
			}
		}

		const handlePopState = e => {
			if (editMode && !navigationBlocked) {
				e.preventDefault()
				navigationBlocked = true
				window.history.pushState(null, '', location.pathname)
				setShowUnsavedWarning(true)
			}
		}

		window.addEventListener('popstate', handlePopState)

		return () => {
			window.history.pushState = originalPushState
			window.history.replaceState = originalReplaceState
			window.removeEventListener('popstate', handlePopState)
		}
	}, [editMode, role, location.pathname])

	// Handle language change with unsaved changes check
	useEffect(() => {
		const handleCheckUnsavedChanges = e => {
			if (editMode && role === 'Recruiter') {
				// Always show warning in edit mode for Recruiters
				e.preventDefault()
				setShowUnsavedWarning(true)
				return false
			}
		}

		window.addEventListener('checkUnsavedChanges', handleCheckUnsavedChanges)
		return () => {
			window.removeEventListener(
				'checkUnsavedChanges',
				handleCheckUnsavedChanges
			)
		}
	}, [editMode, role])

	// Auto-save effect with change detection
	useEffect(() => {
		if (editMode && role === 'Recruiter' && editData && company) {
			const hasChanges = hasChangesFromOriginal(editData)

			if (hasChanges) {
				saveToStorageIfChanged(editData)
				setSaveStatus(prev => ({ ...prev, hasUnsavedChanges: true }))
			} else {
				setSaveStatus(prev => ({ ...prev, hasUnsavedChanges: false }))
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editData, editMode, role, company])

	// Clear navigation flags on unmount
	useEffect(() => {
		return () => {
			// Clean up flags when component unmounts
			localStorage.removeItem('isNavigatingAfterSave')
		}
	}, [])

	// Clear any stale localStorage on component mount
	useEffect(() => {
		if (role === 'Recruiter' && id) {
			try {
				// Clear all possible localStorage keys that might exist
				const keys = Object.keys(localStorage)
				const keysToRemove = keys.filter(
					key =>
						key.includes('profileEditDraft') &&
						key.includes('company_profile_edit') &&
						key.includes(String(id))
				)
				keysToRemove.forEach(key => {
					localStorage.removeItem(key)
				})
			} catch (error) {}
		}
	}, [role, id])

	// Fetch company data function
	const fetchCompany = async () => {
		if (!id) return

		try {
			const response = await axios.get(`/api/recruiters/${id}`)
			const companyData = response.data

			const processedData = {
				...companyData,
				business_overview: Array.isArray(companyData.business_overview)
					? companyData.business_overview.join('\n')
					: companyData.business_overview || '',
				target_audience: safeParse(companyData.target_audience),
				required_skills: safeParse(companyData.required_skills),
				welcome_skills: safeParse(companyData.welcome_skills),
				company_video_url: Array.isArray(companyData.company_video_url)
					? companyData.company_video_url
					: [],
				// New arrays-as-text: parse to arrays for UI
				recommended_skills: safeParse(companyData.recommended_skills),
				recommended_licenses: safeParse(companyData.recommended_licenses),
				recommended_other: safeParse(companyData.recommended_other),
				// Ensure optional string fields are non-null for UI
				japanese_level: companyData.japanese_level || '',
				application_requirements_other:
					companyData.application_requirements_other || '',
				retirement_benefit: companyData.retirement_benefit || '',
				telework_availability: companyData.telework_availability || '',
				housing_availability: companyData.housing_availability || '',
				relocation_support: companyData.relocation_support || '',
				airport_pickup: companyData.airport_pickup || '',
				intro_page_thumbnail: companyData.intro_page_thumbnail || '',
			}

			setCompany(processedData)
			const editDataWithNew = {
				...processedData,
				newRequiredSkill: '',
				newWelcomeSkill: '',
				newVideoUrl: '',
				newRecommendedSkill: '',
				newRecommendedLicense: '',
				newRecommendedOther: '',
			}
			setEditData(editDataWithNew)

			// Update the original data reference for change detection
			updateOriginalData(editDataWithNew)

			// Clear any stale localStorage data that might exist
			clearStorage()

			// Additional manual cleanup for any persisted data
			try {
				const storageKey = `profileEditDraft_company_profile_edit_${id || 'unknown'}_${role}`
				localStorage.removeItem(storageKey)
			} catch (error) {}
		} catch (error) {
			setCompany(null)
		}
	}

	// Fetch company data with proper error handling
	useEffect(() => {
		fetchCompany()
	}, [id])

	// Check for persisted data when entering edit mode
	useEffect(() => {
		// Add a small delay to ensure original data reference is updated
		const checkRecovery = () => {
			if (role === 'Recruiter' && editMode && company) {
				// Check if we just switched languages or navigated back
				const isLanguageSwitching = localStorage.getItem('isLanguageSwitching')
				const isNavigatingAfterSave = localStorage.getItem(
					'isNavigatingAfterSave'
				)

				if (isLanguageSwitching === 'true') {
					localStorage.removeItem('isLanguageSwitching')
					// Force load the saved data
					const persistedEditData = loadFromStorage()
					if (persistedEditData && Object.keys(persistedEditData).length > 0) {
						setPersistedData({
							exists: true,
							data: persistedEditData,
							timestamp: new Date().toISOString(),
						})
						setShowRecoveryDialog(true)
					}
				} else if (isNavigatingAfterSave === 'true') {
					localStorage.removeItem('isNavigatingAfterSave')
					// Check if there's saved data to restore
					const persistedEditData = loadFromStorage()
					if (persistedEditData && Object.keys(persistedEditData).length > 0) {
						setPersistedData({
							exists: true,
							data: persistedEditData,
							timestamp: new Date().toISOString(),
						})
						setShowRecoveryDialog(true)
					}
				} else {
					// For normal edit mode entry, don't show recovery dialog
					// Only show recovery for specific cases (language switch or navigation return)

					// Clear any existing localStorage to prevent future false positives
					clearStorage()
				}
			}
		}

		// Small delay to ensure original data reference is properly updated
		const timeoutId = setTimeout(checkRecovery, 100)

		return () => {
			clearTimeout(timeoutId)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [role, editMode, company])

	// Prevent scroll on edit mode
	useEffect(() => {
		if (editMode) {
			const originalBodyScrollBehavior = document.body.style.scrollBehavior
			const originalHtmlScrollBehavior =
				document.documentElement.style.scrollBehavior

			document.body.style.scrollBehavior = 'auto'
			document.documentElement.style.scrollBehavior = 'auto'

			const currentScrollPosition =
				window.pageYOffset || document.documentElement.scrollTop

			return () => {
				document.body.style.scrollBehavior = originalBodyScrollBehavior
				document.documentElement.style.scrollBehavior =
					originalHtmlScrollBehavior

				const newScrollPosition =
					window.pageYOffset || document.documentElement.scrollTop
				if (Math.abs(newScrollPosition - currentScrollPosition) > 10) {
					window.scrollTo(0, currentScrollPosition)
				}
			}
		}
	}, [editMode])

	// Optimized state update to prevent unnecessary re-renders
	const handleUpdateEditData = useCallback((key, value) => {
		if (key === 'company_video_url') {
		}
		setEditData(prevData => {
			if (prevData[key] === value) {
				return prevData
			}
			const newData = {
				...prevData,
				[key]: value,
			}
			if (key === 'company_video_url') {
			}
			return newData
		})
	}, [])

	const handleArrayChange = useCallback((arrayKey, index, value) => {
		setEditData(prevData => {
			const currentArray = safeArrayRender(prevData[arrayKey])
			if (currentArray[index] === value) {
				return prevData
			}
			const newArray = [...currentArray]
			newArray[index] = value
			return {
				...prevData,
				[arrayKey]: newArray,
			}
		})
	}, [])

	// Create ref callback for input refs
	const createInputRef = useCallback(fieldKey => {
		return el => {
			if (el && fieldKey) {
				inputRefs.current[fieldKey] = el
			}
		}
	}, [])

	// Business overview now a single multiline field (matches Company Description behavior)

	if (!company) {
		return (
			<Box className={styles.loadingContainer}>
				<Typography>{t.loading}</Typography>
			</Box>
		)
	}

	return (
		<Box className={styles.pageContainer}>
			{/* Header Section */}
			<HeaderContentBox>
				<Box className={styles.headerContainer}>
					<Box className={styles.avatarContainer}>
						<Avatar
							src={company.photo}
							alt={`${safeStringValue(company.first_name)} ${safeStringValue(company.last_name)}`}
							className={styles.avatar}
						/>
					</Box>
					<Box className={styles.infoContainer}>
						<Box className={styles.nameEmailContainer}>
							<Typography
								variant='h2'
								component='div'
								className={styles.mainTitle}
							>
								{safeStringValue(company.company_name)}
							</Typography>
						</Box>
						<Box className={styles.chipContainer}>
							{editMode && role === 'Recruiter' ? (
								<Box className={styles.taglineRow}>
									<Typography
										variant='subtitle1'
										className={styles.headerInlineLabel}
									>
										{t.tagline}
									</Typography>
									<Box className={styles.taglineInputWrap}>
										<CustomTextField
											value={safeStringValue(editData.tagline)}
											onChange={e =>
												handleUpdateEditData('tagline', e.target.value)
											}
											placeholder={t.tagline}
											fieldKey='tagline_header'
											inputRef={createInputRef('tagline_header')}
											maxLength={500}
										/>
									</Box>
								</Box>
							) : (
								((role === 'Recruiter' && editMode) ||
									hasContent(company.tagline)) && (
									<Typography variant='subtitle1' className={styles.nameText}>
										{safeStringValue(company.tagline)}
									</Typography>
								)
							)}
						</Box>
					</Box>
					{role === 'Recruiter' && (
						<Box className={styles.topControlButtons}>
							<Box className={styles.buttonsContainer}>
								{editMode ? (
									<>
										<Button
											onClick={handleCancel}
											variant='outlined'
											color='error'
											size='small'
											disabled={loading}
										>
											{t.cancel}
										</Button>
										<Button
											onClick={handleSave}
											variant='contained'
											color='primary'
											size='small'
											disabled={loading}
										>
											{loading ? t.saving : t.save}
										</Button>
									</>
								) : (
									<Button
										onClick={() => {
											// Clear any stale localStorage before entering edit mode
											clearStorage()
											setEditMode(true)
										}}
										variant='contained'
										color='primary'
										size='small'
										startIcon={
											<img
												src={EditIcon}
												alt='edit'
												className={styles.editIcon}
											/>
										}
										className={styles.editButton}
									>
										{t.edit}
									</Button>
								)}
							</Box>
						</Box>
					)}
				</Box>
			</HeaderContentBox>

			{/* Tabs: 会社情報 / 募集概要 */}
			<Box sx={{ mt: 2, mb: 2 }}>
				<Tabs
					value={activeTab}
					onChange={(e, v) => setActiveTab(v)}
					textColor='primary'
					indicatorColor='primary'
				>
					<Tab label='会社情報' value='company' />
					<Tab label='募集概要' value='recruitment' />
				</Tabs>
			</Box>

			{activeTab === 'company' && (
				<>
					{/* Company Information (会社情報) */}
					<SectionHeader
						icon={BusinessIcon}
						title={t.company_information || '会社情報'}
					/>
					<Box
						className={`${styles.companyInfoContainer} ${editMode ? styles.companyInfoContainerEdit : ''}`}
					>
						{/* company_name */}
						{(role === 'Recruiter' && editMode) ||
							(hasContent(company.company_name) && (
								<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
									<Typography variant='subtitle1' className={styles.label}>
										{t.company_name}
									</Typography>
									<Box className={`${styles.value} ${styles.valueColumn}`}>
										{editMode && role === 'Recruiter' ? (
											<CustomTextField
												value={safeStringValue(editData.company_name)}
												onChange={e =>
													handleUpdateEditData('company_name', e.target.value)
												}
												placeholder={t.company_name}
												fieldKey='company_name'
												inputRef={createInputRef('company_name')}
												maxLength={500}
											/>
										) : (
											<Typography variant='body1'>
												{safeStringValue(company.company_name)}
											</Typography>
										)}
									</Box>
								</Box>
							))}
						{(role === 'Recruiter' && editMode) ||
							(hasContent(company.company_Address) && (
								<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
									<Typography variant='subtitle1' className={styles.label}>
										{t.company_Address}
									</Typography>
									<Box className={styles.value}>
										{editMode ? (
											<CustomTextField
												value={safeStringValue(editData.company_Address)}
												onChange={e =>
													handleUpdateEditData(
														'company_Address',
														e.target.value
													)
												}
												placeholder={t.location_placeholder}
												fieldKey='company_Address'
												inputRef={createInputRef('company_Address')}
												maxLength={500}
											/>
										) : (
											<Typography variant='body1'>
												{safeStringValue(company.company_Address)}
											</Typography>
										)}
									</Box>
								</Box>
							))}

						{/* Company Website (moved up to follow the desired order) */}
						{((role === 'Recruiter' && editMode) ||
							hasContent(company.company_website)) && (
							<Box className={`${styles.infoRow} ${styles.infoRowEven}`}>
								<Typography variant='subtitle1' className={styles.label}>
									{t.company_website}
								</Typography>

								<Box className={styles.value}>
									{editMode ? (
										<CustomTextField
											value={safeStringValue(editData.company_website)}
											onChange={e =>
												handleUpdateEditData('company_website', e.target.value)
											}
											placeholder='https://example.com'
											fieldKey='company_website'
											inputRef={createInputRef('company_website')}
											maxLength={500}
										/>
									) : (
										(() => {
											const url = safeStringValue(company.company_website)
											return url ? (
												<a
													href={url.startsWith('http') ? url : `https://${url}`}
													target='_blank'
													rel='noopener noreferrer'
												>
													{url}
												</a>
											) : (
												<Typography variant='body1'>-</Typography>
											)
										})()
									)}
								</Box>
							</Box>
						)}
						{/* Company Description */}
						<Box className={`${styles.infoRow} ${styles.infoRowEven}`}>
							<Typography variant='subtitle1' className={styles.label}>
								{t.company_description}
							</Typography>
							<Box className={styles.value}>
								{editMode && role === 'Recruiter' ? (
									<CustomTextField
										value={safeStringValue(editData.company_description)}
										onChange={e =>
											handleUpdateEditData(
												'company_description',
												e.target.value
											)
										}
										multiline
										minRows={4}
										placeholder={t.company_description}
										fieldKey='company_description'
										inputRef={createInputRef('company_description')}
										maxLength={500}
									/>
								) : (
									<DisplayText>
										{safeStringValue(company.company_description)}
									</DisplayText>
								)}
							</Box>
						</Box>

						{/* Business Overview (single field) */}
						<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
							<Typography variant='subtitle1' className={styles.label}>
								{t.business_overview}
							</Typography>
							<Box className={styles.value}>
								{editMode && role === 'Recruiter' ? (
									<CustomTextField
										value={safeStringValue(editData.business_overview)}
										onChange={e =>
											handleUpdateEditData('business_overview', e.target.value)
										}
										multiline
										minRows={4}
										placeholder={t.business_content_placeholder}
										fieldKey='business_overview'
										inputRef={createInputRef('business_overview')}
										maxLength={500}
									/>
								) : (
									<DisplayText>
										{safeStringValue(company.business_overview)}
									</DisplayText>
								)}
							</Box>
						</Box>

						{/* Employee Count (moved to follow after Business Overview) */}
						{((role === 'Recruiter' && editMode) ||
							hasContent(company.employee_Count)) && (
							<Box className={`${styles.infoRow} ${styles.infoRowEven}`}>
								<Typography variant='subtitle1' className={styles.label}>
									{t.employee_Count}
								</Typography>
								<Box className={styles.value}>
									{editMode ? (
										<CustomTextField
											value={safeStringValue(editData.employee_Count)}
											onChange={e =>
												handleUpdateEditData('employee_Count', e.target.value)
											}
											placeholder={t.employee_count_placeholder}
											fieldKey='employee_Count'
											inputRef={createInputRef('employee_Count')}
											maxLength={500}
										/>
									) : (
										<Typography variant='body1'>
											{safeStringValue(company.employee_Count)}
										</Typography>
									)}
								</Box>
							</Box>
						)}

						{/* Removed Capital, Revenue, Representative per request */}
					</Box>
					{/* Company Introduction Video */}
					{(company?.company_video_url?.length > 0 || role === 'Recruiter') && (
						<ContentBox>
							<Box
								className={styles.sectionHeader}
								style={{ justifyContent: 'center', textAlign: 'center' }}
							>
								<Typography
									variant='h6'
									className={styles.sectionTitle}
									sx={{ fontWeight: 600 }}
								>
									{t.company_introduction_video}
								</Typography>
							</Box>
							{editMode ? (
								<Box>
									{/* Existing videos */}
									{Array.isArray(editData.company_video_url) &&
										editData.company_video_url.map((videoUrl, index) => (
											<Box
												key={`video-${index}`}
												className={styles.videoEditItem}
											>
												<Box className={styles.videoEditContent}>
													<CustomTextField
														value={safeStringValue(videoUrl)}
														onChange={e => {
															const newArray = [...editData.company_video_url]
															newArray[index] = e.target.value
															handleUpdateEditData(
																'company_video_url',
																newArray
															)
														}}
														placeholder={t.company_video_url_placeholder}
														fieldKey={`company_video_url_${index}`}
														inputRef={createInputRef(
															`company_video_url_${index}`
														)}
														maxLength={500}
													/>
													<button
														type='button'
														className={styles.videoDeleteButton}
														onClick={e => {
															e.preventDefault()

															const currentArray = Array.isArray(
																editData.company_video_url
															)
																? editData.company_video_url
																: []
															const newArray = currentArray.filter(
																(_, i) => i !== index
															)

															handleUpdateEditData(
																'company_video_url',
																newArray
															)
														}}
													>
														<img
															src={DeleteIcon}
															alt='delete'
															className={styles.deleteIcon}
														/>
													</button>
												</Box>
											</Box>
										))}

									{/* New video input */}
									<Box className={styles.videoInputContainer}>
										<CustomTextField
											value={safeStringValue(editData.newVideoUrl)}
											onChange={e => {
												const newUrl = e.target.value
												handleUpdateEditData('newVideoUrl', newUrl)
												// Auto-add to array when user presses Enter or loses focus
												if (
													newUrl.trim() &&
													(e.key === 'Enter' || e.type === 'blur')
												) {
													const currentArray = Array.isArray(
														editData.company_video_url
													)
														? editData.company_video_url
														: []
													handleUpdateEditData('company_video_url', [
														...currentArray,
														newUrl.trim(),
													])
													handleUpdateEditData('newVideoUrl', '')
												}
											}}
											onKeyPress={e => {
												if (e.key === 'Enter') {
													e.preventDefault()
													const newUrl = safeStringValue(editData.newVideoUrl)
													if (newUrl.trim()) {
														const currentArray = Array.isArray(
															editData.company_video_url
														)
															? editData.company_video_url
															: []
														handleUpdateEditData('company_video_url', [
															...currentArray,
															newUrl.trim(),
														])
														handleUpdateEditData('newVideoUrl', '')
													}
												}
											}}
											placeholder={t.company_video_url_placeholder}
											fieldKey='newVideoUrl'
											inputRef={createInputRef('newVideoUrl')}
										/>
									</Box>
								</Box>
							) : (
								<Box>
									{Array.isArray(company?.company_video_url) &&
									company.company_video_url.length > 0 ? (
										<Box>
											<Typography
												variant='body2'
												className={styles.videoDescription}
												style={{ textAlign: 'center', marginBottom: '16px' }}
											>
												{t.company_introduction_video_description}
											</Typography>
											{company.company_video_url.length === 1 ? (
												// Single video - display directly
												(() => {
													const videoId = extractYouTubeId(
														company.company_video_url[0]
													)
													return videoId ? (
														<Box className={styles.videoContainer}>
															<iframe
																src={`https://www.youtube.com/embed/${videoId}?enablejsapi=0&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0`}
																title='Company Introduction Video'
																className={styles.videoIframe}
																allowFullScreen
																loading='lazy'
																referrerPolicy='no-referrer-when-downgrade'
															/>
														</Box>
													) : null
												})()
											) : (
												// Multiple videos - display in carousel
												<Box className={styles.videoCarouselContainer}>
													<Swiper
														modules={[Navigation, Pagination]}
														navigation={true}
														pagination={{
															clickable: true,
															dynamicBullets: true,
														}}
														loop={company.company_video_url.length > 1}
														spaceBetween={16}
														slidesPerView={1}
														className={styles.videoSwiper}
														watchSlidesProgress={true}
													>
														{company.company_video_url.map(
															(videoUrl, index) => {
																const videoId = extractYouTubeId(videoUrl)
																return videoId ? (
																	<SwiperSlide key={`video-slide-${index}`}>
																		<Box className={styles.videoContainer}>
																			<iframe
																				src={`https://www.youtube.com/embed/${videoId}?enablejsapi=0&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0`}
																				title={`Company Introduction Video ${index + 1}`}
																				className={styles.videoIframe}
																				allowFullScreen
																				loading='lazy'
																				referrerPolicy='no-referrer-when-downgrade'
																			/>
																		</Box>
																	</SwiperSlide>
																) : null
															}
														)}
													</Swiper>
												</Box>
											)}
										</Box>
									) : (
										<Box
											className={styles.videoPlaceholder}
											style={{ textAlign: 'center' }}
										>
											{t.no_video_set}
										</Box>
									)}
								</Box>
							)}
						</ContentBox>
					)}

					{/* Company Documents (資料) */}
					{((role === 'Recruiter' && editMode) ||
						role === 'Admin' ||
						role === 'Staff' ||
						role === 'Student') && (
						<RecruiterFiles
							editMode={editMode}
							recruiterId={id}
							currentRole={role}
						/>
					)}

					{/* Intro Page Thumbnail (after video, below 資料) */}
					<ContentBox>
						<SectionHeader
							icon={BusinessIcon}
							title={t.intro_page_thumbnail || '紹介ページ サムネイルあり'}
						/>
						{editMode ? (
							<CustomTextField
								value={safeStringValue(editData.intro_page_thumbnail)}
								onChange={e =>
									handleUpdateEditData('intro_page_thumbnail', e.target.value)
								}
								placeholder={
									t.intro_page_thumbnail || '紹介ページ サムネイルあり'
								}
								fieldKey='intro_page_thumbnail'
								inputRef={createInputRef('intro_page_thumbnail')}
								maxLength={500}
							/>
						) : (
							<DisplayText>
								{safeStringValue(company.intro_page_thumbnail)}
							</DisplayText>
						)}
					</ContentBox>
				</>
			)}

			{activeTab === 'recruitment' && (
				<>
					<ContentBox>
						<SectionHeader icon={WorkIcon} title={'募集概要'} />
						<Box
							className={`${styles.companyInfoContainer} ${editMode ? styles.companyInfoContainerEdit : ''}`}
							sx={{ p: 0, m: 0 }}
						>
							{/* Job Details */}
							{[
								{
									key: 'number_of_openings',
									label: t.number_of_openings,
									multiline: false,
								},
								{
									key: 'employment_type',
									label: t.employment_type,
									multiline: false,
								},
								{
									key: 'probation_period',
									label: t.probation_period,
									multiline: true,
								},
								{
									key: 'employment_period',
									label: t.employment_period,
									multiline: true,
								},
								{
									key: 'work_location',
									label: t.work_location,
									multiline: false,
								},
							]
								.filter(
									({ key }) =>
										role === 'Recruiter' ||
										(editMode && role === 'Recruiter') ||
										hasContent(company[key])
								)
								.map(({ key, label, multiline }, idx) => (
									<Box
										key={key}
										className={`${styles.infoRow} ${idx % 2 === 0 ? styles.infoRowOdd : styles.infoRowEven}`}
										sx={{ m: 0, p: 0 }}
									>
										<Typography variant='subtitle1' className={styles.label}>
											{label}
										</Typography>
										<Box className={styles.value}>
											{editMode && role === 'Recruiter' ? (
												<CustomTextField
													value={safeStringValue(editData[key])}
													onChange={e =>
														handleUpdateEditData(key, e.target.value)
													}
													multiline={multiline}
													minRows={multiline ? 3 : 1}
													placeholder={label}
													fieldKey={key}
													inputRef={createInputRef(key)}
												/>
											) : (
												<DisplayText>
													{safeStringValue(company[key])}
												</DisplayText>
											)}
										</Box>
									</Box>
								))}

							{/* Recruitment Overview fields */}
							{[
								{ key: 'job_title', label: t.job_title, multiline: false },
								{
									key: 'job_description',
									label: t.job_description,
									multiline: true,
								},
								{
									key: 'japanese_level',
									label: t.japanese_level,
									multiline: false,
								},
								{
									key: 'application_requirements_other',
									label: t.application_requirements_other,
									multiline: true,
								},
							]
								.filter(
									({ key }) =>
										(role === 'Recruiter' && editMode) ||
										hasContent(company[key])
								)
								.map(({ key, label, multiline }, idx) => (
									<Box
										key={key}
										className={`${styles.infoRow} ${idx % 2 === 0 ? styles.infoRowOdd : styles.infoRowEven}`}
										sx={{ m: 0, p: 0 }}
									>
										<Typography variant='subtitle1' className={styles.label}>
											{label}
										</Typography>
										<Box className={styles.value}>
											{editMode && role === 'Recruiter' ? (
												<CustomTextField
													value={safeStringValue(editData[key])}
													onChange={e =>
														handleUpdateEditData(key, e.target.value)
													}
													multiline={multiline}
													minRows={multiline ? 3 : 1}
													placeholder={label}
													fieldKey={key}
													inputRef={createInputRef(key)}
													maxLength={500}
												/>
											) : (
												<DisplayText>
													{safeStringValue(company[key])}
												</DisplayText>
											)}
										</Box>
									</Box>
								))}

							{/* Recommended Skills */}
							{((role === 'Recruiter' && editMode) ||
								hasContent(company.recommended_skills)) && (
								<Box
									className={`${styles.infoRow} ${styles.infoRowOdd}`}
									sx={{ m: 0, p: 0 }}
								>
									<Typography variant='subtitle1' className={styles.label}>
										{t.recommended_skills || 'Recommended Skills'}
									</Typography>
									<Box className={styles.value}>
										{editMode && role === 'Recruiter' ? (
											<Box className={styles.recruitmentEditColumn}>
												{safeArrayRender(editData.recommended_skills).map(
													(item, index) => (
														<Box
															key={`reco-skill-${index}`}
															className={styles.recruitmentSavedItem}
														>
															<CustomTextField
																value={safeStringValue(item)}
																onChange={e =>
																	handleArrayChange(
																		'recommended_skills',
																		index,
																		e.target.value
																	)
																}
																placeholder={
																	t.recommended_skills_placeholder ||
																	'e.g., TypeScript, Docker'
																}
																fieldKey={`recommended_skills_${index}`}
																inputRef={createInputRef(
																	`recommended_skills_${index}`
																)}
																maxLength={500}
															/>
															<button
																type='button'
																className={styles.recruitmentDeleteButton}
																onClick={e => {
																	e.preventDefault()
																	const arr = safeArrayRender(
																		editData.recommended_skills
																	)
																	handleUpdateEditData(
																		'recommended_skills',
																		arr.filter((_, i) => i !== index)
																	)
																}}
															>
																<img
																	src={DeleteIcon}
																	alt='delete'
																	className={styles.deleteIcon}
																/>
															</button>
														</Box>
													)
												)}
												<Box className={styles.recruitmentInputContainer}>
													<CustomTextField
														value={safeStringValue(
															editData.newRecommendedSkill
														)}
														onChange={e => {
															const val = e.target.value
															handleUpdateEditData('newRecommendedSkill', val)
														}}
														onKeyPress={e => {
															if (e.key === 'Enter') {
																e.preventDefault()
																const val = safeStringValue(
																	editData.newRecommendedSkill
																).trim()
																if (val) {
																	const arr = safeArrayRender(
																		editData.recommended_skills
																	)
																	handleUpdateEditData('recommended_skills', [
																		...arr,
																		val,
																	])
																	handleUpdateEditData(
																		'newRecommendedSkill',
																		''
																	)
																}
															}
														}}
														placeholder={
															t.recommended_skills_placeholder ||
															'e.g., TypeScript, Docker'
														}
														fieldKey='newRecommendedSkill'
														inputRef={createInputRef('newRecommendedSkill')}
														maxLength={500}
													/>
												</Box>
											</Box>
										) : (
											<Box className={styles.recruitmentViewColumn}>
												{safeArrayRender(company.recommended_skills).map(
													(item, index) => (
														<Box
															key={`view-reco-skill-${index}`}
															className={styles.requirementItemWithIcon}
														>
															<Box className={styles.iconContainerPurple}>
																<img
																	src={CheckIcon}
																	alt='check'
																	className={styles.checkIcon}
																/>
															</Box>
															<Box className={styles.requirementContent}>
																<DisplayText>
																	{safeStringValue(item)}
																</DisplayText>
															</Box>
														</Box>
													)
												)}
											</Box>
										)}
									</Box>
								</Box>
							)}

							{/* Recommended Licenses */}
							{((role === 'Recruiter' && editMode) ||
								hasContent(company.recommended_licenses)) && (
								<Box
									className={`${styles.infoRow} ${styles.infoRowEven}`}
									sx={{ m: 0, p: 0 }}
								>
									<Typography variant='subtitle1' className={styles.label}>
										{t.recommended_licenses || 'Recommended Licenses'}
									</Typography>
									<Box className={styles.value}>
										{editMode && role === 'Recruiter' ? (
											<Box className={styles.recruitmentEditColumn}>
												{safeArrayRender(editData.recommended_licenses).map(
													(item, index) => (
														<Box
															key={`reco-lic-${index}`}
															className={styles.recruitmentSavedItem}
														>
															<CustomTextField
																value={safeStringValue(item)}
																onChange={e =>
																	handleArrayChange(
																		'recommended_licenses',
																		index,
																		e.target.value
																	)
																}
																placeholder={
																	t.recommended_licenses_placeholder ||
																	'e.g., JLPT N2'
																}
																fieldKey={`recommended_licenses_${index}`}
																inputRef={createInputRef(
																	`recommended_licenses_${index}`
																)}
																maxLength={500}
															/>
															<button
																type='button'
																className={styles.recruitmentDeleteButton}
																onClick={e => {
																	e.preventDefault()
																	const arr = safeArrayRender(
																		editData.recommended_licenses
																	)
																	handleUpdateEditData(
																		'recommended_licenses',
																		arr.filter((_, i) => i !== index)
																	)
																}}
															>
																<img
																	src={DeleteIcon}
																	alt='delete'
																	className={styles.deleteIcon}
																/>
															</button>
														</Box>
													)
												)}
												<Box className={styles.recruitmentInputContainer}>
													<CustomTextField
														value={safeStringValue(
															editData.newRecommendedLicense
														)}
														onChange={e => {
															const val = e.target.value
															handleUpdateEditData('newRecommendedLicense', val)
														}}
														onKeyPress={e => {
															if (e.key === 'Enter') {
																e.preventDefault()
																const val = safeStringValue(
																	editData.newRecommendedLicense
																).trim()
																if (val) {
																	const arr = safeArrayRender(
																		editData.recommended_licenses
																	)
																	handleUpdateEditData('recommended_licenses', [
																		...arr,
																		val,
																	])
																	handleUpdateEditData(
																		'newRecommendedLicense',
																		''
																	)
																}
															}
														}}
														placeholder={
															t.recommended_licenses_placeholder ||
															'e.g., JLPT N2'
														}
														fieldKey='newRecommendedLicense'
														inputRef={createInputRef('newRecommendedLicense')}
														maxLength={500}
													/>
												</Box>
											</Box>
										) : (
											<Box className={styles.recruitmentViewColumn}>
												{safeArrayRender(company.recommended_licenses).map(
													(item, index) => (
														<Box
															key={`view-reco-lic-${index}`}
															className={styles.requirementItemWithIcon}
														>
															<Box className={styles.iconContainerPurple}>
																<img
																	src={CheckIcon}
																	alt='check'
																	className={styles.checkIcon}
																/>
															</Box>
															<Box className={styles.requirementContent}>
																<DisplayText>
																	{safeStringValue(item)}
																</DisplayText>
															</Box>
														</Box>
													)
												)}
											</Box>
										)}
									</Box>
								</Box>
							)}

							{/* Recommended Other */}
							{((role === 'Recruiter' && editMode) ||
								hasContent(company.recommended_other)) && (
								<Box
									className={`${styles.infoRow} ${styles.infoRowOdd}`}
									sx={{ m: 0, p: 0 }}
								>
									<Typography variant='subtitle1' className={styles.label}>
										{t.recommended_other || 'Other Recommendations'}
									</Typography>
									<Box className={styles.value}>
										{editMode && role === 'Recruiter' ? (
											<Box className={styles.recruitmentEditColumn}>
												{safeArrayRender(editData.recommended_other).map(
													(item, index) => (
														<Box
															key={`reco-oth-${index}`}
															className={styles.recruitmentSavedItem}
														>
															<CustomTextField
																value={safeStringValue(item)}
																onChange={e =>
																	handleArrayChange(
																		'recommended_other',
																		index,
																		e.target.value
																	)
																}
																placeholder={
																	t.recommended_other_placeholder ||
																	'e.g., Internship experience'
																}
																fieldKey={`recommended_other_${index}`}
																inputRef={createInputRef(
																	`recommended_other_${index}`
																)}
																maxLength={500}
															/>
															<button
																type='button'
																className={styles.recruitmentDeleteButton}
																onClick={e => {
																	e.preventDefault()
																	const arr = safeArrayRender(
																		editData.recommended_other
																	)
																	handleUpdateEditData(
																		'recommended_other',
																		arr.filter((_, i) => i !== index)
																	)
																}}
															>
																<img
																	src={DeleteIcon}
																	alt='delete'
																	className={styles.deleteIcon}
																/>
															</button>
														</Box>
													)
												)}
												<Box className={styles.recruitmentInputContainer}>
													<CustomTextField
														value={safeStringValue(
															editData.newRecommendedOther
														)}
														onChange={e => {
															const val = e.target.value
															handleUpdateEditData('newRecommendedOther', val)
														}}
														onKeyPress={e => {
															if (e.key === 'Enter') {
																e.preventDefault()
																const val = safeStringValue(
																	editData.newRecommendedOther
																).trim()
																if (val) {
																	const arr = safeArrayRender(
																		editData.recommended_other
																	)
																	handleUpdateEditData('recommended_other', [
																		...arr,
																		val,
																	])
																	handleUpdateEditData(
																		'newRecommendedOther',
																		''
																	)
																}
															}
														}}
														placeholder={
															t.recommended_other_placeholder ||
															'e.g., Internship experience'
														}
														fieldKey='newRecommendedOther'
														inputRef={createInputRef('newRecommendedOther')}
														maxLength={500}
													/>
												</Box>
											</Box>
										) : (
											<Box className={styles.recruitmentViewColumn}>
												{safeArrayRender(company.recommended_other).map(
													(item, index) => (
														<Box
															key={`view-reco-oth-${index}`}
															className={styles.requirementItemWithIcon}
														>
															<Box className={styles.iconContainerPurple}>
																<img
																	src={CheckIcon}
																	alt='check'
																	className={styles.checkIcon}
																/>
															</Box>
															<Box className={styles.requirementContent}>
																<DisplayText>
																	{safeStringValue(item)}
																</DisplayText>
															</Box>
														</Box>
													)
												)}
											</Box>
										)}
									</Box>
								</Box>
							)}

							{/* Target Audience */}
							<Box
								className={`${styles.infoRow} ${styles.infoRowOdd}`}
								sx={{ m: 0, p: 0 }}
							>
								<Typography variant='subtitle1' className={styles.label}>
									{t.target_person}
								</Typography>
								<Box className={styles.value}>
									{editMode ? (
										<Box>
											{safeArrayRender(editData.target_audience).map(
												(item, index) => (
													<Box
														key={`target-${index}`}
														sx={{
															mb: 1,
															display: 'flex',
															gap: 1,
															alignItems: 'flex-start',
														}}
													>
														<CustomTextField
															value={safeStringValue(item)}
															onChange={e =>
																handleArrayChange(
																	'target_audience',
																	index,
																	e.target.value
																)
															}
															multiline
															minRows={2}
															placeholder={t.target_audience_placeholder}
															fieldKey={`target_audience_${index}`}
															inputRef={createInputRef(
																`target_audience_${index}`
															)}
															maxLength={500}
														/>
														<button
															type='button'
															className={styles.recruitmentDeleteButton}
															onClick={e => {
																e.preventDefault()
																const currentArray = safeArrayRender(
																	editData.target_audience
																)
																const newArray = currentArray.filter(
																	(_, i) => i !== index
																)
																handleUpdateEditData(
																	'target_audience',
																	newArray
																)
															}}
														>
															<img
																src={DeleteIcon}
																alt='delete'
																className={styles.deleteIcon}
															/>
														</button>
													</Box>
												)
											)}
											<Box className={styles.recruitmentInputContainer}>
												<CustomTextField
													value={safeStringValue(
														editData.newTargetAudience || ''
													)}
													onChange={e => {
														const val = e.target.value
														handleUpdateEditData('newTargetAudience', val)
													}}
													onKeyPress={e => {
														if (e.key === 'Enter' && !e.shiftKey) {
															e.preventDefault()
															const val = safeStringValue(
																editData.newTargetAudience || ''
															).trim()
															if (val) {
																const currentArray = safeArrayRender(
																	editData.target_audience
																)
																handleUpdateEditData('target_audience', [
																	...currentArray,
																	val,
																])
																handleUpdateEditData('newTargetAudience', '')
															}
														}
													}}
													multiline
													minRows={2}
													placeholder={
														t.target_audience_placeholder ||
														'Enter target audience description...'
													}
													fieldKey='newTargetAudience'
													inputRef={createInputRef('newTargetAudience')}
													maxLength={500}
												/>
											</Box>
										</Box>
									) : (
										<Box>
											{safeArrayRender(company.target_audience).map(
												(item, index) => (
													<DisplayText key={`target-view-${index}`}>
														{safeStringValue(item)}
													</DisplayText>
												)
											)}
										</Box>
									)}
								</Box>
							</Box>

							{/* Selection Process */}
							{((role === 'Recruiter' && editMode) ||
								hasContent(company.selection_process)) && (
								<Box
									className={`${styles.infoRow} ${styles.infoRowEven}`}
									sx={{ m: 0, p: 0 }}
								>
									<Typography variant='subtitle1' className={styles.label}>
										{t.selection_process}
									</Typography>
									<Box className={styles.value}>
										{editMode && role === 'Recruiter' ? (
											<CustomTextField
												value={safeStringValue(editData.selection_process)}
												onChange={e =>
													handleUpdateEditData(
														'selection_process',
														e.target.value
													)
												}
												multiline
												minRows={3}
												placeholder={t.selection_process}
												fieldKey='selection_process'
												inputRef={createInputRef('selection_process')}
												maxLength={500}
											/>
										) : (
											<DisplayText>
												{safeStringValue(company.selection_process)}
											</DisplayText>
										)}
									</Box>
								</Box>
							)}

							{/* Interview Method */}
							{((role === 'Recruiter' && editMode) ||
								hasContent(company.interview_method)) && (
								<Box
									className={`${styles.infoRow} ${styles.infoRowOdd}`}
									sx={{ m: 0, p: 0 }}
								>
									<Typography variant='subtitle1' className={styles.label}>
										{t.interview_method}
									</Typography>
									<Box className={styles.value}>
										{editMode && role === 'Recruiter' ? (
											<CustomTextField
												value={safeStringValue(editData.interview_method)}
												onChange={e =>
													handleUpdateEditData(
														'interview_method',
														e.target.value
													)
												}
												placeholder={t.interview_method}
												fieldKey='interview_method'
												inputRef={createInputRef('interview_method')}
												maxLength={500}
											/>
										) : (
											<DisplayText>
												{safeStringValue(company.interview_method)}
											</DisplayText>
										)}
									</Box>
								</Box>
							)}

							{/* Required Skills */}
							{((role === 'Recruiter' && editMode) ||
								hasContent(company.required_skills)) && (
								<Box
									className={`${styles.infoRow} ${styles.infoRowEven}`}
									sx={{ m: 0, p: 0 }}
								>
									<Typography variant='subtitle1' className={styles.label}>
										{t.required_skills}
									</Typography>
									<Box className={styles.value}>
										{editMode && role === 'Recruiter' ? (
											<Box className={styles.recruitmentEditColumn}>
												{safeArrayRender(editData.required_skills).map(
													(item, index) => (
														<Box
															key={`required-${index}`}
															className={styles.recruitmentSavedItem}
														>
															<CustomTextField
																value={safeStringValue(item)}
																onChange={e =>
																	handleArrayChange(
																		'required_skills',
																		index,
																		e.target.value
																	)
																}
																placeholder={t.required_skills_placeholder}
																fieldKey={`required_skills_${index}`}
																inputRef={createInputRef(
																	`required_skills_${index}`
																)}
																maxLength={500}
															/>
															<button
																type='button'
																className={styles.recruitmentDeleteButton}
																onClick={e => {
																	e.preventDefault()
																	const currentArray = safeArrayRender(
																		editData.required_skills
																	)
																	const newArray = currentArray.filter(
																		(_, i) => i !== index
																	)
																	handleUpdateEditData(
																		'required_skills',
																		newArray
																	)
																}}
															>
																<img
																	src={DeleteIcon}
																	alt='delete'
																	className={styles.deleteIcon}
																/>
															</button>
														</Box>
													)
												)}
												<Box className={styles.recruitmentInputContainer}>
													<CustomTextField
														value={safeStringValue(editData.newRequiredSkill)}
														onChange={e => {
															const val = e.target.value
															handleUpdateEditData('newRequiredSkill', val)
														}}
														onKeyPress={e => {
															if (e.key === 'Enter') {
																e.preventDefault()
																const val = safeStringValue(
																	editData.newRequiredSkill
																).trim()
																if (val) {
																	const currentArray = safeArrayRender(
																		editData.required_skills
																	)
																	handleUpdateEditData('required_skills', [
																		...currentArray,
																		val,
																	])
																	handleUpdateEditData('newRequiredSkill', '')
																}
															}
														}}
														placeholder={t.required_skills_placeholder}
														fieldKey='newRequiredSkill'
														inputRef={createInputRef('newRequiredSkill')}
														maxLength={500}
													/>
												</Box>
											</Box>
										) : (
											<Box className={styles.recruitmentViewColumn}>
												{safeArrayRender(company.required_skills).map(
													(item, index) => (
														<Box
															key={`view-req-${index}`}
															className={styles.requirementItemWithIcon}
														>
															<Box className={styles.iconContainerPurple}>
																<img
																	src={CheckIcon}
																	alt='check'
																	className={styles.checkIcon}
																/>
															</Box>
															<Box className={styles.requirementContent}>
																<DisplayText>
																	{safeStringValue(item)}
																</DisplayText>
															</Box>
														</Box>
													)
												)}
											</Box>
										)}
									</Box>
								</Box>
							)}
							{/* Required Skills */}
							{((role === 'Recruiter' && editMode) ||
								hasContent(company.required_skills)) && (
								<Box
									className={`${styles.infoRow} ${styles.infoRowOdd}`}
									sx={{ m: 0, p: 0 }}
								>
									<Typography variant='subtitle1' className={styles.label}>
										{t.required_skills}
									</Typography>
									<Box className={styles.value}>
										{editMode && role === 'Recruiter' ? (
											<Box className={styles.recruitmentEditColumn}>
												{safeArrayRender(editData.required_skills).map(
													(item, index) => (
														<Box
															key={`required-${index}`}
															className={styles.recruitmentSavedItem}
														>
															<CustomTextField
																value={safeStringValue(item)}
																onChange={e =>
																	handleArrayChange(
																		'required_skills',
																		index,
																		e.target.value
																	)
																}
																placeholder={t.required_skills_placeholder}
																fieldKey={`required_skills_${index}`}
																inputRef={createInputRef(
																	`required_skills_${index}`
																)}
																maxLength={500}
															/>
															<button
																type='button'
																className={styles.recruitmentDeleteButton}
																onClick={e => {
																	e.preventDefault()
																	const currentArray = safeArrayRender(
																		editData.required_skills
																	)
																	const newArray = currentArray.filter(
																		(_, i) => i !== index
																	)
																	handleUpdateEditData(
																		'required_skills',
																		newArray
																	)
																}}
															>
																<img
																	src={DeleteIcon}
																	alt='delete'
																	className={styles.deleteIcon}
																/>
															</button>
														</Box>
													)
												)}
												<Box className={styles.recruitmentInputContainer}>
													<CustomTextField
														value={safeStringValue(editData.newRequiredSkill)}
														onChange={e => {
															const val = e.target.value
															handleUpdateEditData('newRequiredSkill', val)
														}}
														onKeyPress={e => {
															if (e.key === 'Enter') {
																e.preventDefault()
																const newValue = safeStringValue(
																	editData.newRequiredSkill
																).trim()
																if (newValue) {
																	const currentArray = safeArrayRender(
																		editData.required_skills
																	)
																	handleUpdateEditData('required_skills', [
																		...currentArray,
																		newValue,
																	])
																	handleUpdateEditData('newRequiredSkill', '')
																}
															}
														}}
														placeholder={t.required_skills_placeholder}
														fieldKey='newRequiredSkill'
														inputRef={createInputRef('newRequiredSkill')}
														maxLength={500}
													/>
												</Box>
											</Box>
										) : (
											<Box className={styles.recruitmentViewColumn}>
												{safeArrayRender(company.required_skills).map(
													(item, index) => (
														<Box
															key={`view-req-${index}`}
															className={styles.requirementItemWithIcon}
														>
															<Box className={styles.iconContainerRed}>
																<img
																	src={CheckIcon}
																	alt='check'
																	className={styles.checkIcon}
																/>
															</Box>
															<Box className={styles.requirementContent}>
																<DisplayText>
																	{safeStringValue(item)}
																</DisplayText>
															</Box>
														</Box>
													)
												)}
											</Box>
										)}
									</Box>
								</Box>
							)}

							{/* Welcome Skills */}
							{((role === 'Recruiter' && editMode) ||
								hasContent(company.welcome_skills)) && (
								<Box
									className={`${styles.infoRow} ${styles.infoRowOdd}`}
									sx={{ m: 0, p: 0 }}
								>
									<Typography variant='subtitle1' className={styles.label}>
										{t.welcome_skills}
									</Typography>
									<Box className={styles.value}>
										{editMode && role === 'Recruiter' ? (
											<Box className={styles.recruitmentEditColumn}>
												{safeArrayRender(editData.welcome_skills).map(
													(item, index) => (
														<Box
															key={`welcome-${index}`}
															className={styles.recruitmentSavedItem}
														>
															<CustomTextField
																value={safeStringValue(item)}
																onChange={e =>
																	handleArrayChange(
																		'welcome_skills',
																		index,
																		e.target.value
																	)
																}
																placeholder={t.preferred_skills_placeholder}
																fieldKey={`welcome_skills_${index}`}
																inputRef={createInputRef(
																	`welcome_skills_${index}`
																)}
																maxLength={500}
															/>
															<button
																type='button'
																className={styles.recruitmentDeleteButton}
																onClick={e => {
																	e.preventDefault()
																	const currentArray = safeArrayRender(
																		editData.welcome_skills
																	)
																	const newArray = currentArray.filter(
																		(_, i) => i !== index
																	)
																	handleUpdateEditData(
																		'welcome_skills',
																		newArray
																	)
																}}
															>
																<img
																	src={DeleteIcon}
																	alt='delete'
																	className={styles.deleteIcon}
																/>
															</button>
														</Box>
													)
												)}
												<Box className={styles.recruitmentInputContainer}>
													<CustomTextField
														value={safeStringValue(editData.newWelcomeSkill)}
														onChange={e => {
															const val = e.target.value
															handleUpdateEditData('newWelcomeSkill', val)
														}}
														onKeyPress={e => {
															if (e.key === 'Enter') {
																e.preventDefault()
																const newValue = safeStringValue(
																	editData.newWelcomeSkill
																).trim()
																if (newValue) {
																	const currentArray = safeArrayRender(
																		editData.welcome_skills
																	)
																	handleUpdateEditData('welcome_skills', [
																		...currentArray,
																		newValue,
																	])
																	handleUpdateEditData('newWelcomeSkill', '')
																}
															}
														}}
														placeholder={t.preferred_skills_placeholder}
														fieldKey='newWelcomeSkill'
														inputRef={createInputRef('newWelcomeSkill')}
														maxLength={500}
													/>
												</Box>
											</Box>
										) : (
											<Box className={styles.recruitmentViewColumn}>
												{safeArrayRender(company.welcome_skills).map(
													(item, index) => (
														<Box
															key={`view-wel-${index}`}
															className={styles.requirementItemWithIcon}
														>
															<Box className={styles.iconContainerPurple}>
																<img
																	src={CheckIcon}
																	alt='check'
																	className={styles.checkIcon}
																/>
															</Box>
															<Box className={styles.requirementContent}>
																<DisplayText>
																	{safeStringValue(item)}
																</DisplayText>
															</Box>
														</Box>
													)
												)}
											</Box>
										)}
									</Box>
								</Box>
							)}

							{/* Compensation & Benefits (給与・待遇・福利厚生) */}
							<Box sx={{ paddingTop: 4 }}>
								<SectionHeader
									icon={InfoIcon}
									title={t.compensation_benefits || 'Compensation & Benefits'}
								/>
								<Box
									className={`${styles.companyInfoContainer} ${editMode ? styles.companyInfoContainerEdit : ''}`}
								>
									{/* Salary */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.salary)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.salary}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(editData.salary)}
														onChange={e =>
															handleUpdateEditData('salary', e.target.value)
														}
														placeholder={t.salary}
														fieldKey='salary'
														inputRef={createInputRef('salary')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.salary)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}

									{/* Work Hours */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.work_hours)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowEven}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.work_hours}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(editData.work_hours)}
														onChange={e =>
															handleUpdateEditData('work_hours', e.target.value)
														}
														placeholder={t.work_hours}
														fieldKey='work_hours'
														inputRef={createInputRef('work_hours')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.work_hours)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}

									{/* Benefits */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.benefits)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.benefits || 'Benefits'}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(editData.benefits)}
														onChange={e =>
															handleUpdateEditData('benefits', e.target.value)
														}
														multiline
														minRows={3}
														placeholder={t.benefits || 'Benefits'}
														fieldKey='benefits'
														inputRef={createInputRef('benefits')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.benefits)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}

									{/* Salary Increase */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.salary_increase)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowEven}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.salary_increase || '昇給'}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(editData.salary_increase)}
														onChange={e =>
															handleUpdateEditData(
																'salary_increase',
																e.target.value
															)
														}
														placeholder={t.salary_increase || '昇給'}
														fieldKey='salary_increase'
														inputRef={createInputRef('salary_increase')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.salary_increase)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}

									{/* Bonus */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.bonus)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.bonus || '賞与'}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(editData.bonus)}
														onChange={e =>
															handleUpdateEditData('bonus', e.target.value)
														}
														placeholder={t.bonus || '賞与'}
														fieldKey='bonus'
														inputRef={createInputRef('bonus')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.bonus)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}

									{/* Holidays & Vacation */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.holidays_vacation)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowEven}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.holidays_vacation || '休日・休暇'}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(editData.holidays_vacation)}
														onChange={e =>
															handleUpdateEditData(
																'holidays_vacation',
																e.target.value
															)
														}
														multiline
														minRows={3}
														placeholder={t.holidays_vacation || '休日・休暇'}
														fieldKey='holidays_vacation'
														inputRef={createInputRef('holidays_vacation')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.holidays_vacation)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}

									{/* Allowances */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.allowances)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.allowances || 'その他手当（福利厚生）'}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(editData.allowances)}
														onChange={e =>
															handleUpdateEditData('allowances', e.target.value)
														}
														multiline
														minRows={3}
														placeholder={
															t.allowances || 'その他手当（福利厚生）'
														}
														fieldKey='allowances'
														inputRef={createInputRef('allowances')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.allowances)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}

									{/* Retirement Benefit */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.retirement_benefit)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowEven}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.retirement_benefit || '退職金'}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(editData.retirement_benefit)}
														onChange={e =>
															handleUpdateEditData(
																'retirement_benefit',
																e.target.value
															)
														}
														placeholder={t.retirement_benefit || '退職金'}
														fieldKey='retirement_benefit'
														inputRef={createInputRef('retirement_benefit')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.retirement_benefit)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}

									{/* Telework Availability */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.telework_availability)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.telework_availability || 'テレワークの有無'}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(
															editData.telework_availability
														)}
														onChange={e =>
															handleUpdateEditData(
																'telework_availability',
																e.target.value
															)
														}
														placeholder={
															t.telework_availability || 'テレワークの有無'
														}
														fieldKey='telework_availability'
														inputRef={createInputRef('telework_availability')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.telework_availability)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}

									{/* Housing Availability */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.housing_availability)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowEven}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.housing_availability || '寮、社宅等の有無'}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(
															editData.housing_availability
														)}
														onChange={e =>
															handleUpdateEditData(
																'housing_availability',
																e.target.value
															)
														}
														placeholder={
															t.housing_availability || '寮、社宅等の有無'
														}
														fieldKey='housing_availability'
														inputRef={createInputRef('housing_availability')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.housing_availability)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}

									{/* Relocation Support */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.relocation_support)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.relocation_support || '航空券代・赴任費用の負担'}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(editData.relocation_support)}
														onChange={e =>
															handleUpdateEditData(
																'relocation_support',
																e.target.value
															)
														}
														multiline
														minRows={3}
														placeholder={
															t.relocation_support || '航空券代・赴任費用の負担'
														}
														fieldKey='relocation_support'
														inputRef={createInputRef('relocation_support')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.relocation_support)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}

									{/* Airport Pickup */}
									{((role === 'Recruiter' && editMode) ||
										hasContent(company.airport_pickup)) && (
										<Box className={`${styles.infoRow} ${styles.infoRowEven}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.airport_pickup || '来日時の送迎'}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(editData.airport_pickup)}
														onChange={e =>
															handleUpdateEditData(
																'airport_pickup',
																e.target.value
															)
														}
														placeholder={t.airport_pickup || '来日時の送迎'}
														fieldKey='airport_pickup'
														inputRef={createInputRef('airport_pickup')}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.airport_pickup)}
													</DisplayText>
												)}
											</Box>
										</Box>
									)}
								</Box>
							</Box>

							{/* Compensation & Benefits (給与・待遇・福利厚生) */}
							{/* Other (その他) - placed at the very end */}
							{hasContent(company.other_notes) && (
								<>
									<SectionHeader icon={InfoIcon} title={t.other || 'その他'} />
									<Box
										className={`${styles.companyInfoContainer} ${editMode ? styles.companyInfoContainerEdit : ''}`}
									>
										<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
											<Typography variant='subtitle1' className={styles.label}>
												{t.other_notes}
											</Typography>
											<Box className={styles.value}>
												{editMode && role === 'Recruiter' ? (
													<CustomTextField
														value={safeStringValue(editData.other_notes)}
														onChange={e =>
															handleUpdateEditData(
																'other_notes',
																e.target.value
															)
														}
														multiline
														minRows={3}
														placeholder={t.other_notes}
														fieldKey='other_notes'
														inputRef={createInputRef('other_notes')}
														maxLength={500}
													/>
												) : (
													<DisplayText>
														{safeStringValue(company.other_notes)}
													</DisplayText>
												)}
											</Box>
										</Box>
									</Box>
								</>
							)}
						</Box>
					</ContentBox>

					{/* Additional Information removed — fields moved to 募集概要 */}
				</>
			)}

			{/* Auto-save indicator */}
			{editMode && role === 'Recruiter' && (
				<Snackbar
					open={saveStatus.isSaving || !!saveStatus.lastSaved}
					autoHideDuration={saveStatus.isSaving ? null : 2000}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					onClose={() => setSaveStatus(prev => ({ ...prev, lastSaved: null }))}
				>
					<Alert
						severity='info'
						icon={saveStatus.isSaving ? <SaveIcon /> : <SaveIcon />}
						sx={{ alignItems: 'center' }}
					>
						{saveStatus.isSaving
							? t.savingChanges || 'Saving...'
							: t.changesSaved || 'Changes saved'}
						{saveStatus.isSaving && (
							<LinearProgress color='inherit' sx={{ ml: 2, width: 100 }} />
						)}
					</Alert>
				</Snackbar>
			)}

			{/* Recovery dialog */}
			<Dialog
				open={showRecoveryDialog}
				onClose={() => setShowRecoveryDialog(false)}
			>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<RestoreIcon color='info' />
					{t.recoverUnsavedChanges || 'Recover Unsaved Changes?'}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{t.unsavedChangesFound ||
							'We found unsaved changes from your previous editing session. Would you like to restore them?'}
					</Typography>
					{persistedData.timestamp && (
						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ mt: 1, display: 'block' }}
						>
							{t.lastModified || 'Last modified'}:{' '}
							{new Date(persistedData.timestamp).toLocaleString()}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDiscardRecovery} color='error'>
						{t.discard || 'Discard'}
					</Button>
					<Button
						onClick={handleRecoverData}
						variant='contained'
						startIcon={<RestoreIcon />}
					>
						{t.restore || 'Restore'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Simple Unsaved Changes Dialog */}
			<Dialog
				open={showUnsavedDialog}
				onClose={() => setShowUnsavedDialog(false)}
			>
				<DialogTitle>
					{t.unsaved_changes_title || 'Unsaved Changes'}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{t.language_change_unsaved_message ||
							'You have unsaved changes. Would you like to save them before changing the language?'}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowUnsavedDialog(false)}>
						{t.cancel || 'Cancel'}
					</Button>
					<Button
						onClick={() => {
							handleCancel()
							setShowUnsavedDialog(false)
							changeLanguage(pendingLanguageChange)
						}}
						color='warning'
					>
						{t.discard_changes || 'Discard Changes'}
					</Button>
					<Button
						onClick={async () => {
							await handleSave()
							setShowUnsavedDialog(false)
							changeLanguage(pendingLanguageChange)
						}}
						variant='contained'
						color='primary'
					>
						{t.save_and_continue || 'Save and Continue'}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}

// Main component PropTypes
CompanyProfile.propTypes = {
	userId: PropTypes.number,
}

export default CompanyProfile
