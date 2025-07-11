import React, {
	useEffect,
	useState,
	useContext,
	useRef,
	useCallback,
} from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFormPersistence } from '../../../hooks/useFormPersistence'
import axios from '../../../utils/axiosUtils'
import { useAlert } from '../../../contexts/AlertContext'
import { useLanguage } from '../../../contexts/LanguageContext'
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
import DescriptionIcon from '../../../assets/icons/briefcase-3-line.svg'
import EditIcon from '../../../assets/icons/edit.svg'
import CheckboxIcon from '../../../assets/icons/checkbox-circle-fill.svg'
import CheckboxBlankIcon from '../../../assets/icons/checkbox-blank.svg'
import CheckboxBlankIcon2 from '../../../assets/icons/checkbox-blank2.svg'
import DeleteIcon from '../../../assets/icons/delete-bin-3-line.svg'

import styles from './CompanyProfile.module.css'
import translations from '../../../locales/translations'
import { UserContext } from '../../../contexts/UserContext'

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
	if (typeof data === 'string') {
		try {
			const parsed = JSON.parse(data)
			return Array.isArray(parsed) ? parsed : []
		} catch {
			return []
		}
	}
	return Array.isArray(data) ? data : []
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
	const { language: langContext, pendingLanguageChange, confirmLanguageChange, cancelLanguageChange } = useLanguage()
	const showAlert = useAlert()
	const currentLanguage = language || langContext || 'en'
	const t = translations[currentLanguage] || translations.en

	const id = userId !== 0 ? userId : recruiterId

	const [company, setCompany] = useState(null)
	const [loading, setLoading] = useState(false)
	const [editMode, setEditMode] = useState(false)

	// Initial editData state
	const initialEditData = {
		newBusinessOverview: '',
		newRequiredSkill: '',
		newWelcomeSkill: '',
		business_overview: [],
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
	}

	const [editData, setEditData] = useState(initialEditData)

	// Navigation and persistence state
	const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
	const [pendingNavigation, setPendingNavigation] = useState(null)
	const [showRecoveryDialog, setShowRecoveryDialog] = useState(false)
	const [saveStatus, setSaveStatus] = useState({
		isSaving: false,
		lastSaved: null,
		hasUnsavedChanges: false,
	})
	const [persistedData, setPersistedData] = useState({
		exists: false,
		data: null,
		timestamp: null,
	})

	// Form persistence setup
	const formPersistenceKey = `company_profile_edit_${id || 'unknown'}_${role}`
	const {
		loadFromStorage,
		saveToStorage,
		saveToStorageIfChanged,
		clearStorage,
		hasUnsavedChanges,
		hasChangesFromOriginal,
		immediateSave,
		immediateSaveIfChanged,
		updateOriginalData,
	} = useFormPersistence(formPersistenceKey, initialEditData, {
		debounceMs: 2000,
		enabled: role === 'Recruiter' && editMode,
		originalData: company ? {
			...company,
			newBusinessOverview: '',
			newRequiredSkill: '',
			newWelcomeSkill: '',
			newVideoUrl: '',
		} : null,
		onSaveStart: () => {
			console.log('Starting save to localStorage')
			setSaveStatus(prev => ({ ...prev, isSaving: true }))
		},
		onSaveComplete: () => {
			console.log('Save to localStorage complete')
			setSaveStatus(prev => ({
				...prev,
				isSaving: false,
				lastSaved: new Date().toISOString(),
			}))
		},
		onLoadComplete: (data) => {
			console.log('Loaded data from localStorage:', data)
			setPersistedData({
				exists: true,
				data: data,
				timestamp: new Date().toISOString(),
			})
		},
	})

	// Refs for maintaining focus
	const inputRefs = useRef({})
	const scrollPositionRef = useRef(0)

	// Warn before leaving page with unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e) => {
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
		if (!editMode || role !== 'Recruiter') return

		let isNavigating = false
		let navigationBlocked = false

		// Override history methods to intercept navigation
		const originalPushState = window.history.pushState
		const originalReplaceState = window.history.replaceState

		const handleNavigation = (url) => {
			// Skip if we're already handling navigation or if edit mode is false
			if (isNavigating || navigationBlocked || !editMode) return true
			
			if (url && url !== window.location.pathname) {
				console.log('Navigation intercepted to:', url)
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

		window.history.pushState = function(state, title, url) {
			if (handleNavigation(url)) {
				originalPushState.apply(window.history, arguments)
			}
		}

		window.history.replaceState = function(state, title, url) {
			if (handleNavigation(url)) {
				originalReplaceState.apply(window.history, arguments)
			}
		}

		const handlePopState = (e) => {
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
		const handleCheckUnsavedChanges = (e) => {
			console.log('checkUnsavedChanges event received:', { 
				editMode, 
				role, 
				eventDetail: e.detail,
				shouldPrevent: editMode && role === 'Recruiter' 
			})
			if (editMode && role === 'Recruiter') {
				// Always show warning in edit mode for Recruiters
				e.preventDefault()
				setShowUnsavedWarning(true)
				return false
			}
		}

		window.addEventListener('checkUnsavedChanges', handleCheckUnsavedChanges)
		return () => {
			window.removeEventListener('checkUnsavedChanges', handleCheckUnsavedChanges)
		}
	}, [editMode, role])

	// Auto-save effect with change detection
	useEffect(() => {
		if (editMode && role === 'Recruiter' && editData && company) {
			const hasChanges = hasChangesFromOriginal(editData)
			console.log('Auto-save check:', { editMode, role, hasData: !!editData, hasChanges })
			
			if (hasChanges) {
				console.log('Changes detected, saving to localStorage')
				saveToStorageIfChanged(editData)
				setSaveStatus(prev => ({ ...prev, hasUnsavedChanges: true }))
			} else {
				console.log('No changes detected, skipping auto-save')
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
				const keysToRemove = keys.filter(key => 
					key.includes('profileEditDraft') && 
					key.includes('company_profile_edit') &&
					key.includes(String(id))
				)
				keysToRemove.forEach(key => {
					localStorage.removeItem(key)
					console.log('Removed stale localStorage key:', key)
				})
			} catch (error) {
				console.error('Error clearing stale localStorage:', error)
			}
		}
	}, [role, id])

	// Fetch company data with proper error handling
	useEffect(() => {
		const fetchCompany = async () => {
			if (!id) return

			try {
				const response = await axios.get(`/api/recruiters/${id}`)
				const companyData = response.data

				const processedData = {
					...companyData,
					business_overview: safeParse(companyData.business_overview),
					target_audience: safeParse(companyData.target_audience),
					required_skills: safeParse(companyData.required_skills),
					welcome_skills: safeParse(companyData.welcome_skills),
					company_video_url: Array.isArray(companyData.company_video_url)
						? companyData.company_video_url
						: [],
				}

				setCompany(processedData)
				const editDataWithNew = {
					...processedData,
					newBusinessOverview: '',
					newRequiredSkill: '',
					newWelcomeSkill: '',
					newVideoUrl: '',
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
					console.log('Manually cleared localStorage with key:', storageKey)
				} catch (error) {
					console.error('Error clearing localStorage manually:', error)
				}
			} catch (error) {
				console.error('Error fetching company data:', error)
				setCompany(null)
			}
		}

		fetchCompany()
	}, [id])

	// Check for persisted data when entering edit mode
	useEffect(() => {
		// Add a small delay to ensure original data reference is updated
		const checkRecovery = () => {
			if (role === 'Recruiter' && editMode && company) {
				// Check if we just switched languages or navigated back
				const isLanguageSwitching = localStorage.getItem('isLanguageSwitching')
				const isNavigatingAfterSave = localStorage.getItem('isNavigatingAfterSave')
				
				if (isLanguageSwitching === 'true') {
					localStorage.removeItem('isLanguageSwitching')
					// Force load the saved data
					const persistedEditData = loadFromStorage()
					if (persistedEditData && Object.keys(persistedEditData).length > 0) {
						console.log('Found saved data after language change:', persistedEditData)
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
						console.log('Found saved data after navigation:', persistedEditData)
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
					console.log('Normal edit mode entry - no recovery check needed')
					
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

	const handleSave = async () => {
		if (!id) return

		console.log('🔄 SAVE STARTED - editData:', editData)
		console.log('🔄 SAVE STARTED - company (current):', company)

		setLoading(true)
		try {
			// Clean and validate data before sending
			const cleanedData = {
				...editData,
				business_overview: JSON.stringify(
					safeArrayRender(editData.business_overview)
				),
				target_audience: JSON.stringify(
					safeArrayRender(editData.target_audience)
				),
				required_skills: JSON.stringify(
					safeArrayRender(editData.required_skills)
				),
				welcome_skills: JSON.stringify(
					safeArrayRender(editData.welcome_skills)
				),
				company_video_url: Array.isArray(editData.company_video_url)
					? editData.company_video_url
					: [],
			}

			// Remove new item fields and invalid fields
			delete cleanedData.newBusinessOverview
			delete cleanedData.newRequiredSkill
			delete cleanedData.newWelcomeSkill
			delete cleanedData.newTargetAudience
			delete cleanedData.newVideoUrl

			// Prepare data for backend validation
			const dataToSave = {}

			// Always include company_video_url first (even if empty array)
			dataToSave.company_video_url = Array.isArray(
				cleanedData.company_video_url
			)
				? cleanedData.company_video_url
				: []

			// Include all fields, even empty ones, to allow clearing data
			Object.keys(cleanedData).forEach(key => {
				const value = cleanedData[key]

				// Skip company_video_url since we already handled it above
				if (key === 'company_video_url') {
					return
				}

				// Always include the field, even if it's empty (to allow clearing)
				if (value !== null && value !== undefined) {
					// Handle phone_number validation (must be numeric string or null to clear)
					if (key === 'phone_number') {
						const phoneStr = String(value).replace(/\D/g, '') // Remove non-digits
						if (phoneStr === '') {
							dataToSave[key] = null // Send null to clear the field
						} else {
							dataToSave[key] = phoneStr
						}
					}
					// Handle date_of_birth validation (must be ISO8601 format or null to clear)
					else if (key === 'date_of_birth') {
						if (value === '') {
							dataToSave[key] = null // Send null to clear date
						} else if (value instanceof Date || typeof value === 'string') {
							try {
								const date = new Date(value)
								if (!isNaN(date.getTime())) {
									dataToSave[key] = date.toISOString().split('T')[0] // YYYY-MM-DD format
								} else {
									dataToSave[key] = null // Invalid date becomes null
								}
							} catch (e) {
								console.warn('Invalid date_of_birth:', value)
								dataToSave[key] = null // Invalid date becomes null
							}
						}
					}
					// Handle email validation (must be valid email or null to clear)
					else if (key === 'email') {
						if (value === '') {
							dataToSave[key] = null // Send null to clear email
						} else {
							const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
							if (emailRegex.test(value)) {
								dataToSave[key] = value
							} else {
								console.warn('Invalid email format:', value)
								dataToSave[key] = String(value) // Keep invalid email as-is for user to fix
							}
						}
					}
					// Include other fields as strings (empty strings are allowed for these)
					else {
						dataToSave[key] = String(value)
					}
				}
			})

			// Debug: Log the data being sent
			console.log('💾 Data being sent to server:', dataToSave)
			console.log('💾 Company video URLs being sent:', dataToSave.company_video_url)
			console.log('💾 Video URLs count:', dataToSave.company_video_url?.length)
			console.log('💾 Recruiter ID:', id)

			const saveResponse = await axios.put(`/api/recruiters/${id}`, dataToSave)
			console.log('💾 Successfully saved to backend, response:', saveResponse.data)

			// Fetch fresh data from backend to ensure consistency
			try {
				const freshResponse = await axios.get(`/api/recruiters/${id}`)
				const freshData = freshResponse.data

				const processedFreshData = {
					...freshData,
					business_overview: safeParse(freshData.business_overview),
					target_audience: safeParse(freshData.target_audience),
					required_skills: safeParse(freshData.required_skills),
					welcome_skills: safeParse(freshData.welcome_skills),
					company_video_url: Array.isArray(freshData.company_video_url)
						? freshData.company_video_url
						: [],
				}

				console.log('💾 Fresh data from backend after save:', processedFreshData)
				console.log('💾 Fresh company_video_url:', processedFreshData.company_video_url)
				setCompany(processedFreshData)

				// Also update editData to keep it in sync
				const freshEditData = {
					...processedFreshData,
					newBusinessOverview: '',
					newRequiredSkill: '',
					newWelcomeSkill: '',
					newVideoUrl: '',
				}
				setEditData(freshEditData)
				
				// Update the original data reference with fresh data from server
				if (role === 'Recruiter') {
					updateOriginalData(freshEditData)
				}
				
				console.log('💾 Final editData after fresh data:', freshEditData)
				console.log('💾 Original data reference updated to:', freshEditData)
			} catch (fetchError) {
				console.warn('Could not fetch fresh data after save:', fetchError)
				// Fallback to local data
				const updatedCompany = {
					...editData,
					company_video_url: Array.isArray(editData.company_video_url)
						? editData.company_video_url
						: [],
				}
				setCompany(updatedCompany)

				// Also update editData in fallback case
				const fallbackEditData = {
					...updatedCompany,
					newBusinessOverview: '',
					newRequiredSkill: '',
					newWelcomeSkill: '',
					newVideoUrl: '',
				}
				setEditData(fallbackEditData)
				
				// Update the original data reference with fallback data
				if (role === 'Recruiter') {
					updateOriginalData(fallbackEditData)
				}
			}

			setEditMode(false)
			
			// Clear localStorage after successful save
			if (role === 'Recruiter') {
				clearStorage()
				setSaveStatus({
					isSaving: false,
					lastSaved: null,
					hasUnsavedChanges: false,
				})
			}

			// Show success notification
			showAlert(t.changes_saved || 'Changes saved successfully!', 'success')
		} catch (error) {
			console.error('Error saving company data:', error)
			if (error.response) {
				console.error('Error response data:', error.response.data)
				console.error('Error response status:', error.response.status)
				console.error('Error response headers:', error.response.headers)
			}

			// Show error notification
			showAlert(
				t.errorSavingChanges || 'Error saving changes. Please try again.',
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

	const handleCancel = () => {
		if (editMode && role === 'Recruiter') {
			// Only show warning if there are actual changes
			if (hasChangesFromOriginal(editData)) {
				setShowUnsavedWarning(true)
			} else {
				// No changes, just exit edit mode
				setEditMode(false)
				clearStorage()
				setSaveStatus({
					isSaving: false,
					lastSaved: null,
					hasUnsavedChanges: false,
				})
			}
		} else {
			if (company) {
				const restoredData = {
					...company,
					newBusinessOverview: '',
					newRequiredSkill: '',
					newWelcomeSkill: '',
					newVideoUrl: '',
				}
				setEditData(restoredData)
				// Update original data reference when restoring from company data
				if (role === 'Recruiter') {
					updateOriginalData(restoredData)
				}
			}
			setEditMode(false)
			if (role === 'Recruiter') {
				clearStorage()
				setSaveStatus({
					isSaving: false,
					lastSaved: null,
					hasUnsavedChanges: false,
				})
			}
		}
	}

	const handleConfirmCancel = () => {
		// Save data before proceeding if there's a pending language change
		if (pendingLanguageChange) {
			console.log('Saving data before language change:', editData)
			// Save the data immediately only if there are changes
			const saved = immediateSaveIfChanged(editData)
			if (saved) {
				// Set a flag to indicate we're switching languages after save
				localStorage.setItem('isLanguageSwitching', 'true')
			}
			// Clear edit mode to prevent browser warning
			setEditMode(false)
			// Small delay to ensure localStorage writes complete
			setTimeout(() => {
				confirmLanguageChange()
			}, 100)
		} else if (pendingNavigation) {
			// Handle navigation with discard
			console.log('Discarding changes and navigating to:', pendingNavigation.pathname)
			if (company) {
				const restoredData = {
					...company,
					newBusinessOverview: '',
					newRequiredSkill: '',
					newWelcomeSkill: '',
					newVideoUrl: '',
				}
				setEditData(restoredData)
				// Update original data reference when restoring from company data
				if (role === 'Recruiter') {
					updateOriginalData(restoredData)
				}
			}
			setEditMode(false)
			clearStorage()
			setSaveStatus({
				isSaving: false,
				lastSaved: null,
				hasUnsavedChanges: false,
			})
			// Small delay to ensure state updates
			setTimeout(() => {
				if (pendingNavigation) {
					// Use window.location for a clean navigation
					window.location.href = pendingNavigation.pathname
				}
				setPendingNavigation(null)
			}, 100)
		} else {
			if (company) {
				const restoredData = {
					...company,
					newBusinessOverview: '',
					newRequiredSkill: '',
					newWelcomeSkill: '',
					newVideoUrl: '',
				}
				setEditData(restoredData)
				// Update original data reference when restoring from company data
				if (role === 'Recruiter') {
					updateOriginalData(restoredData)
				}
			}
			setEditMode(false)
			clearStorage()
			setSaveStatus({
				isSaving: false,
				lastSaved: null,
				hasUnsavedChanges: false,
			})
		}
		setShowUnsavedWarning(false)
	}

	const handleSaveAndNavigate = () => {
		console.log('Saving data before navigation:', editData)
		// Save the data immediately only if there are changes
		const saved = immediateSaveIfChanged(editData)
		if (saved) {
			// Set a flag to indicate we're navigating after save
			localStorage.setItem('isNavigatingAfterSave', 'true')
		}
		// Exit edit mode to allow navigation
		setEditMode(false)
		// Clear the warning dialog
		setShowUnsavedWarning(false)
		// Small delay to ensure state updates and localStorage writes complete
		setTimeout(() => {
			if (pendingNavigation) {
				console.log('Navigating to:', pendingNavigation.pathname)
				// Use window.location for a clean navigation
				window.location.href = pendingNavigation.pathname
			}
			setPendingNavigation(null)
		}, 100)
	}

	const handleRecoverData = () => {
		if (persistedData?.data) {
			console.log('Recovering data:', persistedData.data)
			setEditData(persistedData.data)
			setEditMode(true)
			showAlert(t.dataRecovered || 'Data recovered successfully', 'success')
		}
		setShowRecoveryDialog(false)
	}

	const handleDiscardRecovery = () => {
		clearStorage()
		setShowRecoveryDialog(false)
		setPersistedData({ exists: false, data: null, timestamp: null })
	}

	// Optimized state update to prevent unnecessary re-renders
	const handleUpdateEditData = useCallback((key, value) => {
		console.log(`📝 Updating editData[${key}]:`, value)
		if (key === 'company_video_url') {
			console.log(
				`📝 Video URL update - Array length: ${Array.isArray(value) ? value.length : 'Not an array'}`
			)
		}
		setEditData(prevData => {
			if (prevData[key] === value) {
				console.log(`📝 No change needed for ${key}`)
				return prevData
			}
			const newData = {
				...prevData,
				[key]: value,
			}
			if (key === 'company_video_url') {
				console.log(`📝 Updated company_video_url:`, newData[key])
				console.log(`📝 Updated array length:`, newData[key]?.length)
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

	// Business overview rendering with editable fields - UPDATED
	const renderBusinessOverview = () => {
		const businessOverview = safeArrayRender(editData.business_overview)

		if (editMode) {
			return (
				<Box className={styles.businessOverviewEditContainer}>
					{businessOverview.map((item, index) => (
						<Box
							key={`business-${index}`}
							className={styles.businessOverviewSavedItem}
						>
							<Box className={styles.businessOverviewSavedContent}>
								<Box className={styles.iconContainerCheck}>
									<img
										src={CheckboxIcon}
										alt='checkbox'
										className={styles.checkboxIcon}
									/>
								</Box>
								{/* CHANGED: Replace Typography with CustomTextField for editing */}
								<CustomTextField
									value={safeStringValue(item)}
									onChange={e =>
										handleArrayChange(
											'business_overview',
											index,
											e.target.value
										)
									}
									multiline
									placeholder={
										t.business_content_placeholder
									}
									fieldKey={`business_overview_${index}`}
									inputRef={createInputRef(`business_overview_${index}`)}
								/>
							</Box>
							<button
								type='button'
								className={styles.businessOverviewDeleteButton}
								onClick={e => {
									e.preventDefault()
									const newArray = businessOverview.filter(
										(_, i) => i !== index
									)
									handleUpdateEditData('business_overview', newArray)
								}}
							>
								<img
									src={DeleteIcon}
									alt='delete'
									className={styles.deleteIcon}
								/>
							</button>
						</Box>
					))}

					<Box className={styles.businessOverviewInputContainer}>
						<CustomTextField
							value={safeStringValue(editData.newBusinessOverview)}
							onChange={e =>
								handleUpdateEditData('newBusinessOverview', e.target.value)
							}
							multiline
							placeholder={
								t.business_content_placeholder
							}
							fieldKey='newBusinessOverview'
							inputRef={createInputRef('newBusinessOverview')}
							sx={{ padding: '0px' }}
						/>
						<button
							type='button'
							className={styles.businessOverviewSaveButton}
							onClick={e => {
								e.preventDefault()
								const newValue = safeStringValue(editData.newBusinessOverview)
								if (newValue.trim()) {
									handleUpdateEditData('business_overview', [
										...businessOverview,
										newValue.trim(),
									])
									handleUpdateEditData('newBusinessOverview', '')
								}
							}}
						>
							{t.save || 'Save'}
						</button>
					</Box>
				</Box>
			)
		} else {
			return businessOverview.map((item, index) => (
				<Box
					key={`business-view-${index}`}
					className={styles.businessOverviewItem}
				>
					<Box className={styles.businessOverviewItemWithIcon}>
						<Box className={styles.iconContainerCheck}>
							<img
								src={CheckboxIcon}
								alt='checkbox'
								className={styles.checkboxIcon}
							/>
						</Box>
						<Box
							className={`${styles.businessOverviewContent} ${styles.contentTextMuted}`}
						>
							<DisplayText>{safeStringValue(item)}</DisplayText>
						</Box>
					</Box>
				</Box>
			))
		}
	}

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
							<Typography variant='body4' className={styles.nameText}>
								{safeStringValue(company.first_name)}
								{safeStringValue(company.last_name)}
							</Typography>
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
											console.log('🔄 ENTERING EDIT MODE')
											console.log('🔄 Current company data:', company)
											console.log('🔄 Current editData before entering edit:', editData)
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

				{/* Company Info Section */}
				{role === 'Recruiter' && (
					<Box className={styles.companyInfoContainer}>
						<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
							<Typography variant='subtitle1' className={styles.label}>
								{t.location}
							</Typography>
							<Box className={styles.value}>
								{editMode ? (
									<CustomTextField
										value={safeStringValue(editData.company_Address)}
										onChange={e =>
											handleUpdateEditData('company_Address', e.target.value)
										}
										placeholder={t.location_placeholder}
										fieldKey='company_Address'
										inputRef={createInputRef('company_Address')}
									/>
								) : (
									<Typography variant='body1'>
										{safeStringValue(company.company_Address)}
									</Typography>
								)}
							</Box>
						</Box>

						<Box className={`${styles.infoRow} ${styles.infoRowEven}`}>
							<Typography variant='subtitle1' className={styles.label}>
								{t.established}
							</Typography>
							<Box className={styles.value}>
								{editMode ? (
									<CustomTextField
										value={safeStringValue(editData.established_Date)}
										onChange={e =>
											handleUpdateEditData('established_Date', e.target.value)
										}
										placeholder={
											t.established_placeholder
										}
										fieldKey='established_Date'
										inputRef={createInputRef('established_Date')}
									/>
								) : (
									<Typography variant='body1'>
										{safeStringValue(company.established_Date)}
									</Typography>
								)}
							</Box>
						</Box>

						<Box className={`${styles.infoRow} ${styles.infoRowOdd}`}>
							<Typography variant='subtitle1' className={styles.label}>
								{t.employee_count}
							</Typography>
							<Box className={styles.value}>
								{editMode ? (
									<CustomTextField
										value={safeStringValue(editData.employee_Count)}
										onChange={e =>
											handleUpdateEditData('employee_Count', e.target.value)
										}
										placeholder={
											t.employee_count_placeholder
										}
										fieldKey='employee_Count'
										inputRef={createInputRef('employee_Count')}
									/>
								) : (
									<Typography variant='body1'>
										{safeStringValue(company.employee_Count)}
									</Typography>
								)}
							</Box>
						</Box>
					</Box>
				)}
			</HeaderContentBox>

			{/* Company Introduction Video */}
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
								<Box key={`video-${index}`} className={styles.videoEditItem}>
									<Box className={styles.videoEditContent}>
										<CustomTextField
											value={safeStringValue(videoUrl)}
											onChange={e => {
												const newArray = [...editData.company_video_url]
												newArray[index] = e.target.value
												handleUpdateEditData('company_video_url', newArray)
											}}
											placeholder={
												t.company_video_url_placeholder
											}
											fieldKey={`company_video_url_${index}`}
											inputRef={createInputRef(`company_video_url_${index}`)}
										/>
										<button
											type='button'
											className={styles.videoDeleteButton}
											onClick={e => {
												e.preventDefault()
												console.log('🗑️ Deleting video at index:', index)
												console.log(
													'🗑️ Current array before deletion:',
													editData.company_video_url
												)
												console.log(
													'🗑️ Array length before deletion:',
													editData.company_video_url?.length
												)

												const currentArray = Array.isArray(
													editData.company_video_url
												)
													? editData.company_video_url
													: []
												const newArray = currentArray.filter(
													(_, i) => i !== index
												)

												console.log('🗑️ New array after deletion:', newArray)
												console.log(
													'🗑️ New array length after deletion:',
													newArray.length
												)
												handleUpdateEditData('company_video_url', newArray)

												// Additional debug to confirm state update
												setTimeout(() => {
													console.log(
														'🗑️ EditData after state update:',
														editData.company_video_url
													)
												}, 100)
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
								onChange={e =>
									handleUpdateEditData('newVideoUrl', e.target.value)
								}
								placeholder={
									t.company_video_url_placeholder
								}
								fieldKey='newVideoUrl'
								inputRef={createInputRef('newVideoUrl')}
							/>
							<button
								type='button'
								className={styles.videoSaveButton}
								onClick={e => {
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
								}}
							>
								{t.save_button}
							</button>
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
											{company.company_video_url.map((videoUrl, index) => {
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
											})}
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

			{/* Company Overview */}
			<ContentBox>
				<SectionHeader
					icon={DescriptionIcon}
					title={t.company_overview}
				/>
				{editMode ? (
					<CustomTextField
						value={safeStringValue(editData.company_description)}
						onChange={e =>
							handleUpdateEditData('company_description', e.target.value)
						}
						multiline
						minRows={6}
						placeholder={
							t.company_description_placeholder
						}
						fieldKey='company_description'
						inputRef={createInputRef('company_description')}
					/>
				) : (
					<DisplayText>
						{safeStringValue(company.company_description)}
					</DisplayText>
				)}
			</ContentBox>

			{/* Business Overview */}
			<ContentBox>
				<SectionHeader
					icon={BusinessIcon}
					title={t.business_overview}
				/>
				<Box>{renderBusinessOverview()}</Box>
			</ContentBox>

			{/* Recruitment Requirements - UPDATED */}
			<ContentBox>
				<SectionHeader
					icon={WorkIcon}
					title={t.recruitment_requirements}
				/>
				{editMode ? (
					<Grid container spacing={3}>
						{/* Required Skills Column */}
						<Grid item xs={12} md={6}>
							<Typography variant='subtitle1' className={styles.fieldLabel}>
								{t.required_skills}
							</Typography>
							<Box className={styles.recruitmentEditColumn}>
								{/* CHANGED: Editable saved items */}
								{safeArrayRender(editData.required_skills).map(
									(item, index) => (
										<Box
											key={`required-${index}`}
											className={styles.recruitmentSavedItem}
										>
											<Box className={styles.recruitmentSavedContent}>
												<Box className={styles.iconContainerFullPurple}>
													<img
														src={CheckboxBlankIcon}
														alt='checkbox'
														className={styles.CheckboxBlankIcon}
													/>
												</Box>
												{/* CHANGED: Replace Typography with CustomTextField */}
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
													inputRef={createInputRef(`required_skills_${index}`)}
												/>
											</Box>
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
													handleUpdateEditData('required_skills', newArray)
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
								{/* Input for new item */}
								<Box className={styles.recruitmentInputContainer}>
									<CustomTextField
										value={safeStringValue(editData.newRequiredSkill)}
										onChange={e =>
											handleUpdateEditData('newRequiredSkill', e.target.value)
										}
										placeholder={t.required_skills_placeholder}
										fieldKey='newRequiredSkill'
										inputRef={createInputRef('newRequiredSkill')}
									/>
									<button
										type='button'
										className={styles.recruitmentSaveButton}
										onClick={e => {
											e.preventDefault()
											const newValue = safeStringValue(
												editData.newRequiredSkill
											)
											if (newValue.trim()) {
												const currentArray = safeArrayRender(
													editData.required_skills
												)
												handleUpdateEditData('required_skills', [
													...currentArray,
													newValue.trim(),
												])
												handleUpdateEditData('newRequiredSkill', '')
											}
										}}
									>
										{t.save}
									</button>
								</Box>
							</Box>
						</Grid>

						{/* Welcome Skills Column */}
						<Grid item xs={12} md={6}>
							<Typography variant='subtitle1' className={styles.fieldLabel}>
								{t.welcome_skills}
							</Typography>
							<Box className={styles.recruitmentEditColumn}>
								{/* CHANGED: Editable saved items */}
								{safeArrayRender(editData.welcome_skills).map((item, index) => (
									<Box
										key={`welcome-${index}`}
										className={styles.recruitmentSavedItem}
									>
										<Box className={styles.recruitmentSavedContent}>
											<Box className={styles.iconContainerPurple}>
												<img
													src={CheckboxBlankIcon2}
													alt='checkbox'
													className={styles.CheckboxBlankIcon2}
												/>
											</Box>
											{/* CHANGED: Replace Typography with CustomTextField */}
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
												inputRef={createInputRef(`welcome_skills_${index}`)}
											/>
										</Box>
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
												handleUpdateEditData('welcome_skills', newArray)
											}}
										>
											<img
												src={DeleteIcon}
												alt='delete'
												className={styles.deleteIcon}
											/>
										</button>
									</Box>
								))}
								{/* Input for new item */}
								<Box className={styles.recruitmentInputContainer}>
									<CustomTextField
										value={safeStringValue(editData.newWelcomeSkill)}
										onChange={e =>
											handleUpdateEditData('newWelcomeSkill', e.target.value)
										}
										placeholder={t.preferred_skills_placeholder}
										fieldKey='newWelcomeSkill'
										inputRef={createInputRef('newWelcomeSkill')}
									/>
									<button
										type='button'
										className={styles.recruitmentSaveButton}
										onClick={e => {
											e.preventDefault()
											const newValue = safeStringValue(editData.newWelcomeSkill)
											if (newValue.trim()) {
												const currentArray = safeArrayRender(
													editData.welcome_skills
												)
												handleUpdateEditData('welcome_skills', [
													...currentArray,
													newValue.trim(),
												])
												handleUpdateEditData('newWelcomeSkill', '')
											}
										}}
									>
										{t.save}
									</button>
								</Box>
							</Box>
						</Grid>
					</Grid>
				) : (
					// View mode with vertical divider
					<Box className={styles.recruitmentViewContainer}>
						<Grid container spacing={0}>
							<Grid
								item
								xs={12}
								md={6}
								className={styles.recruitmentViewColumn}
							>
								<Typography
									variant='subtitle1'
									className={styles.fieldLabel}
									sx={{ marginBottom: '16px', fontWeight: '600' }}
								>
									{t.required_skills}
								</Typography>
								{safeArrayRender(company.required_skills).map((item, index) => (
									<Box
										key={`required-view-${index}`}
										className={styles.requirementItemWithIcon}
									>
										<Box className={styles.iconContainer}>
											<img
												src={CheckboxBlankIcon}
												alt='checkbox'
												className={styles.CheckboxBlankIcon}
											/>
										</Box>
										<Box
											className={`${styles.requirementContent} ${styles.contentTextMuted}`}
										>
											<Typography>{safeStringValue(item)}</Typography>
										</Box>
									</Box>
								))}
							</Grid>
							<Grid
								item
								xs={12}
								md={6}
								className={styles.recruitmentViewColumn}
							>
								<Typography
									variant='subtitle1'
									className={styles.fieldLabel}
									sx={{ marginBottom: '16px', fontWeight: '600' }}
								>
									{t.welcome_skills}
								</Typography>
								{safeArrayRender(company.welcome_skills).map((item, index) => (
									<Box
										key={`welcome-view-${index}`}
										className={styles.requirementItemWithIcon}
									>
										<Box className={styles.iconContainerPurple}>
											<img
												src={CheckboxBlankIcon2}
												alt='checkbox'
												className={styles.CheckboxBlankIcon2}
											/>
										</Box>
										<Box
											className={`${styles.requirementContent} ${styles.contentTextMuted}`}
										>
											<Typography>{safeStringValue(item)}</Typography>
										</Box>
									</Box>
								))}
							</Grid>
						</Grid>
					</Box>
				)}
			</ContentBox>

			{/* Target Audience */}
			<ContentBox>
				<SectionHeader
					icon={PersonIcon}
					title={t.target_audience}
				/>
				{editMode ? (
					<Box>
						{/* Single label for the entire Target Audience section */}
						<Typography
							variant='subtitle2'
							className={styles.sectionSubLabel}
							sx={{
								fontWeight: '600',
								marginBottom: '16px',
								color: 'text.primary',
							}}
						>
							{t.target_person}
						</Typography>
						<Grid container spacing={2}>
							{safeArrayRender(editData.target_audience).map((item, index) => (
								<Grid item xs={12} md={6} key={`target-${index}`}>
									<Box className={styles.targetAudienceEditContainer}>
										<button
											type='button'
											className={styles.targetAudienceDeleteButton}
											onClick={e => {
												e.preventDefault()
												const currentArray = safeArrayRender(
													editData.target_audience
												)
												const newArray = currentArray.filter(
													(_, i) => i !== index
												)
												handleUpdateEditData('target_audience', newArray)
											}}
										>
											<img
												src={DeleteIcon}
												alt='delete'
												className={styles.deleteIcon}
											/>
										</button>
										<CustomTextField
											value={safeStringValue(item)}
											onChange={e =>
												handleArrayChange(
													'target_audience',
													index,
													e.target.value
												)
											}
											// multiline
											minRows={2}
											placeholder={
												t.target_audience_placeholder
											}
											fieldKey={`target_audience_${index}`}
											inputRef={createInputRef(`target_audience_${index}`)}
										/>
									</Box>
								</Grid>
							))}
						</Grid>
						<Button
							variant='outlined'
							color='primary'
							className={styles.addTargetAudienceButton}
							onClick={e => {
								e.preventDefault()
								const currentArray = safeArrayRender(editData.target_audience)
								handleUpdateEditData('target_audience', [...currentArray, ''])
							}}
						>
							{t.new_target_audience_add}
						</Button>
					</Box>
				) : (
					// View mode
					<Box>
						{/* Single label for the entire Target Audience section */}
						<Typography
							variant='subtitle2'
							className={styles.sectionSubLabel}
							sx={{
								fontWeight: '600',
								marginBottom: '16px',
								color: 'text.primary',
							}}
						>
							{t.target_person}
						</Typography>
						<Grid container spacing={2}>
							{safeArrayRender(company.target_audience).map((item, index) => (
								<Grid item xs={12} md={6} key={`target-view-${index}`}>
									<DisplayText>{safeStringValue(item)}</DisplayText>
								</Grid>
							))}
						</Grid>
					</Box>
				)}
			</ContentBox>

			{/* Additional Information */}
			<ContentBox>
				<SectionHeader
					icon={InfoIcon}
					title={t.additional_info}
				/>
				<Grid>
					{[
						{
							key: 'work_location',
							label: t.work_location,
							placeholder: t.work_location_placeholder,
						},
						{
							key: 'work_hours',
							label: t.work_hours,
							placeholder: t.work_hours_placeholder,
						},
						{
							key: 'salary',
							label: t.salary,
							placeholder: t.salary_placeholder,
						},
						{
							key: 'benefits',
							label: t.benefits,
							placeholder: t.benefits_placeholder,
						},
						{
							key: 'selection_process',
							label: t.selection_process,
							placeholder: t.selection_process_placeholder,
						},
					].map(({ key, label, placeholder }) => (
						<Grid item xs={12} md={6} key={key}>
							<Typography
								variant='subtitle1'
								className={styles.fieldLabel}
								sx={{
									fontWeight: '600',
									marginBottom: '8px',
									marginTop: '16px',
								}}
							>
								{label}
							</Typography>
							{editMode ? (
								<CustomTextField
									value={safeStringValue(editData[key])}
									onChange={e => handleUpdateEditData(key, e.target.value)}
									multiline
									// minRows={2}
									placeholder={placeholder}
									fieldKey={key}
									inputRef={createInputRef(key)}
								/>
							) : (
								<DisplayText>{safeStringValue(company[key])}</DisplayText>
							)}
						</Grid>
					))}
				</Grid>
			</ContentBox>

			{/* Auto-save indicator */}
			{editMode && role === 'Recruiter' && (
				<Snackbar
					open={saveStatus.isSaving || !!saveStatus.lastSaved}
					autoHideDuration={saveStatus.isSaving ? null : 2000}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					onClose={() => setSaveStatus(prev => ({ ...prev, lastSaved: null }))}
				>
					<Alert
						severity="info"
						icon={saveStatus.isSaving ? <SaveIcon /> : <SaveIcon />}
						sx={{ alignItems: 'center' }}
					>
						{saveStatus.isSaving ? (t.savingChanges || 'Saving...') : (t.changesSaved || 'Changes saved')}
						{saveStatus.isSaving && (
							<LinearProgress
								color="inherit"
								sx={{ ml: 2, width: 100 }}
							/>
						)}
					</Alert>
				</Snackbar>
			)}

			{/* Recovery dialog */}
			<Dialog open={showRecoveryDialog} onClose={() => setShowRecoveryDialog(false)}>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<RestoreIcon color="info" />
					{t.recoverUnsavedChanges || 'Recover Unsaved Changes?'}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{t.unsavedChangesFound || 'We found unsaved changes from your previous editing session. Would you like to restore them?'}
					</Typography>
					{persistedData.timestamp && (
						<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
							{t.lastModified || 'Last modified'}: {new Date(persistedData.timestamp).toLocaleString()}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDiscardRecovery} color="error">
						{t.discard || 'Discard'}
					</Button>
					<Button onClick={handleRecoverData} variant="contained" startIcon={<RestoreIcon />}>
						{t.restore || 'Restore'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Unsaved changes warning */}
			<Dialog open={showUnsavedWarning} onClose={() => {
				setShowUnsavedWarning(false)
				if (pendingLanguageChange) {
					cancelLanguageChange()
				}
				if (pendingNavigation) {
					setPendingNavigation(null)
				}
			}}>
				<DialogTitle>
					{pendingLanguageChange 
						? (t.unsavedChangesLanguageTitle || 'Save changes before switching language?')
						: pendingNavigation
						? (t.unsavedChangesNavigationTitle || 'Save changes before leaving?')
						: (t.unsavedChangesTitle || 'Unsaved Changes')
					}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{pendingLanguageChange
							? (t.unsavedChangesLanguageMessage || 'You have unsaved changes. Would you like to save them before changing the language?')
							: pendingNavigation
							? (t.unsavedChangesNavigationMessage || 'You have unsaved changes. Would you like to save them before leaving this page?')
							: (t.unsavedChangesMessage || 'You have unsaved changes. Are you sure you want to discard them?')
						}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => {
						setShowUnsavedWarning(false)
						if (pendingLanguageChange) {
							cancelLanguageChange()
						}
						if (pendingNavigation) {
							setPendingNavigation(null)
						}
					}}>
						{t.continueEditing || 'Continue Editing'}
					</Button>
					{pendingLanguageChange ? (
						<>
							<Button 
								onClick={() => {
									// Discard changes and switch language
									if (company) {
										const restoredData = {
											...company,
											newBusinessOverview: '',
											newRequiredSkill: '',
											newWelcomeSkill: '',
											newVideoUrl: '',
										}
										setEditData(restoredData)
										// Update original data reference when restoring from company data
										if (role === 'Recruiter') {
											updateOriginalData(restoredData)
										}
									}
									setEditMode(false)
									clearStorage()
									setShowUnsavedWarning(false)
									confirmLanguageChange()
								}} 
								color="error"
							>
								{t.discardAndSwitch || 'Discard & Switch'}
							</Button>
							<Button 
								onClick={handleConfirmCancel} 
								variant="contained"
								color="primary"
							>
								{t.saveAndSwitch || 'Save & Switch'}
							</Button>
						</>
					) : pendingNavigation ? (
						<>
							<Button 
								onClick={handleConfirmCancel}
								color="error"
							>
								{t.discardAndLeave || 'Discard & Leave'}
							</Button>
							<Button 
								onClick={handleSaveAndNavigate}
								variant="contained"
								color="primary"
							>
								{t.saveAndLeave || 'Save & Leave'}
							</Button>
						</>
					) : (
						<Button onClick={handleConfirmCancel} color="error" variant="contained">
							{t.discardChanges || 'Discard Changes'}
						</Button>
					)}
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
