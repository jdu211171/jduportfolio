import AddIcon from '@mui/icons-material/Add'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'
import CloseIcon from '@mui/icons-material/Close'
import CodeIcon from '@mui/icons-material/Code'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined'
import FavoriteBorderTwoToneIcon from '@mui/icons-material/FavoriteBorderTwoTone'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import RestoreIcon from '@mui/icons-material/Restore'
import SaveIcon from '@mui/icons-material/Save'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import {
	Alert,
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	LinearProgress,
	TextField as MuiTextField,
	Snackbar,
	Typography,
} from '@mui/material'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom' // ReactDOM.createPortal o'rniga
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
	activeUniverAtom,
	deletedUrlsAtom,
	deliverableImagesAtom,
	editDataAtom,
	editModeAtom,
	hobbiesInputAtom,
	newImagesAtom,
	showHobbiesInputAtom,
	showSpecialSkillsInputAtom,
	specialSkillsInputAtom,
	subTabIndexAtom,
	updateQAAtom,
} from '../../../atoms/profileEditAtoms'
import Deliverables from '../../../components/Deliverables/Deliverables'
import ProfileConfirmDialog from '../../../components/Dialogs/ProfileConfirmDialog'
import LanguageSkillSelector from '../../../components/LanguageSkillSelector/LanguageSkillSelector'
import SkillSelector from '../../../components/SkillSelector/SkillSelector'
import OtherSkillsSelector from '../../../components/OtherSkillsSelector/OtherSkillsSelector'
import TextField from '../../../components/TextField/TextField'
import { useAlert } from '../../../contexts/AlertContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import translations from '../../../locales/translations'
import QA from '../../../pages/Profile/QA/QA'
import axios from '../../../utils/axiosUtils'
import styles from './Top.module.css'

const Top = () => {
	let id
	const role = sessionStorage.getItem('role')
	const { studentId } = useParams()
	const location = useLocation()
	const { userId } = location.state || {}
	const statedata = location.state?.student
	const { language, changeLanguage } = useLanguage()

	// Early state declaration for saveStatus
	const [saveStatus, setSaveStatus] = useState({
		isSaving: false,
		lastSaved: null,
		hasUnsavedChanges: false,
	})
	// Language change handling
	const handleLanguageChange = newLanguage => {
		if (editMode && hasUnsavedChanges) {
			setPendingLanguageChange(newLanguage)
			setShowUnsavedDialog(true)
		} else {
			changeLanguage(newLanguage)
		}
	}

	// Simple functions to replace complex ones
	const handleCancel = () => {
		setEditMode(false)
		reset(student)
		setHasUnsavedChanges(false)
	}

	// Simple replacements for removed functions
	const clearStorage = () => {
		// Simple localStorage clear - no complex persistence
		localStorage.removeItem(`profile_edit_${id}_${role}`)
	}

	const updateOriginalData = data => {
		// Simple implementation - just reset form with new data
		reset(data)
	}

	const hasChangesFromOriginal = data => {
		// Simple check - just use isDirty from React Hook Form
		return hasUnsavedChanges
	}

	// Simple replacement for persistedData
	const persistedData = {
		exists: false,
		data: null,
		timestamp: null,
	}

	// Simple replacement for missing states
	const showUnsavedWarning = false
	const setShowUnsavedWarning = () => {} // No-op function
	const pendingNavigation = null
	const setPendingNavigation = () => {} // No-op function
	const setPersistedData = () => {} // No-op function

	// Simple replacements for missing handlers
	const handleConfirmCancel = () => {
		handleCancel()
	}

	const handleSaveAndNavigate = () => {
		handleSave()
	}

	// More missing states/functions
	const [portalContainer, setPortalContainer] = useState(null)
	const showRecoveryDialog = false
	const setShowRecoveryDialog = () => {}
	const handleRecoverData = () => {}
	const handleDiscardRecovery = () => {}

	// Missing function
	const immediateSaveIfChanged = data => {
		if (hasUnsavedChanges) {
			handleSave()
			return true
		}
		return false
	}
	const showAlert = useAlert()
	const navigate = useNavigate()

	const t = key => translations[language][key] || key

    // Helper function to safely parse JLPT and JDU certification (JSON or plain) with null handling
    const getJLPTData = jlptString => {
        try {
            // Treat empty, 'null', or 'undefined' as not submitted
            if (
                jlptString === null ||
                jlptString === undefined ||
                (typeof jlptString === 'string' &&
                    (jlptString.trim() === '' ||
                        jlptString.trim().toLowerCase() === 'null' ||
                        jlptString.trim().toLowerCase() === 'undefined'))
            ) {
                return { highest: '未提出', list: [] }
            }

            if (typeof jlptString === 'string') {
                // Try to parse JSON first
                try {
                    const parsed = JSON.parse(jlptString)
                    if (parsed === null) return { highest: '未提出', list: [] }
                    if (parsed && typeof parsed === 'object' && parsed.highest) {
                        return parsed
                    }
                    // Not expected JSON structure; treat original as plain value (e.g., 'N2')
                    return { highest: jlptString }
                } catch {
                    // Not JSON; treat as plain value
                    return { highest: jlptString }
                }
            }

            if (typeof jlptString === 'object') {
                return jlptString && jlptString.highest
                    ? jlptString
                    : { highest: '未提出', list: [] }
            }

            return { highest: '未提出', list: [] }
        } catch {
            return { highest: '未提出', list: [] }
        }
    }

	// Helper function to safely parse certificate data (for japanese_speech_contest and it_contest)
	const getCertificateData = certificateString => {
		try {
			if (
				!certificateString ||
				certificateString === 'null' ||
				certificateString === 'undefined'
			)
				return { highest: '未提出', list: [] }

			// If it's already a plain string (not JSON), return it as the highest value
			if (typeof certificateString === 'string') {
				// Try to parse as JSON first
				try {
					const parsed = JSON.parse(certificateString)
					// If it's a valid JSON object with highest property, return it
					if (parsed && typeof parsed === 'object' && parsed.highest) {
						return parsed
					}
					// If it's a valid JSON but not the expected structure, treat as plain string
					return { highest: certificateString, list: [] }
				} catch (jsonError) {
					// If JSON parsing fails, it's a plain string, return it as highest value
					return { highest: certificateString, list: [] }
				}
			}

			// If it's already an object, return it
			if (typeof certificateString === 'object' && certificateString !== null) {
				return certificateString.highest
					? certificateString
					: { highest: '未提出', list: [] }
			}

			return { highest: '未提出', list: [] }
		} catch (error) {
			// If anything goes wrong, return the original string as highest if it exists
			if (certificateString && typeof certificateString === 'string') {
				return { highest: certificateString, list: [] }
			}
			return { highest: '未提出', list: [] }
		}
	}

	if (userId !== 0 && userId) {
		id = userId
	} else {
		id = studentId
	}
	const [student, setStudent] = useState(null)
	const [editData, setEditData] = useAtom(editDataAtom)
	const [editMode, setEditMode] = useAtom(editModeAtom)
	const [currentDraft, setCurrentDraft] = useState({})
	const [updateQA, SetUpdateQA] = useAtom(updateQAAtom)
	const [newImages, setNewImages] = useAtom(newImagesAtom)
	const [deletedUrls, setDeletedUrls] = useAtom(deletedUrlsAtom)
	const [deliverableImages, setDeliverableImages] = useAtom(
		deliverableImagesAtom
	)
	const [subTabIndex, setSubTabIndex] = useAtom(subTabIndexAtom)
	const [hasDraft, setHasDraft] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [confirmMode, setConfirmMode] = useState(false)
	const [activeUniver, setActiveUniver] = useAtom(activeUniverAtom)
	const [resetDeliverablePreviews, setResetDeliverablePreviews] =
		useState(false)
	const [filteredLanguageSkills, setFilteredLanguageSkills] = useState([])
	// ✅ New state for hobbies and special skills tags
	const [hobbiesInput, setHobbiesInput] = useAtom(hobbiesInputAtom)
	const [specialSkillsInput, setSpecialSkillsInput] = useAtom(
		specialSkillsInputAtom
	)
	const [showHobbiesInput, setShowHobbiesInput] = useAtom(showHobbiesInputAtom)
	const [showSpecialSkillsInput, setShowSpecialSkillsInput] = useAtom(
		showSpecialSkillsInputAtom
	)

	// Simple form state for unsaved changes tracking
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
	const [pendingLanguageChange, setPendingLanguageChange] = useState(null)

	// React Hook Form setup
	const {
		formState: { isDirty },
		reset,
		getValues,
	} = useForm({
		defaultValues: student || {},
		mode: 'onChange',
	})

	// Watch for form changes
	useEffect(() => {
		setHasUnsavedChanges(isDirty)
	}, [isDirty])

	// ✅ Portal container check effect
	useEffect(() => {
		const checkPortalContainer = () => {
			const container = document.getElementById('saveButton')
			if (container) {
				setPortalContainer(container)
			} else {
				// Agar container topilmasa, setTimeout bilan qayta urinish
				setTimeout(checkPortalContainer, 100)
			}
		}

		checkPortalContainer()
	}, [])

	// Handle language change event to save data before reload
	useEffect(() => {
		const handleBeforeLanguageChange = e => {
			// No need to save here as handleConfirmCancel already saves
		}

		window.addEventListener('beforeLanguageChange', handleBeforeLanguageChange)
		return () => {
			window.removeEventListener(
				'beforeLanguageChange',
				handleBeforeLanguageChange
			)
		}
	}, [editMode, role])

	// Warn before leaving page with unsaved changes
	useEffect(() => {
		const handleBeforeUnload = e => {
			if (editMode && role === 'Student') {
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
		if (!editMode || role !== 'Student') return

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
			if (editMode && role === 'Student') {
				// Always show warning in edit mode for Students
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

	useEffect(() => {
		fetchLanguageSkills()
		const loadData = async () => {
			setIsLoading(true)
			try {
				if (statedata) {
					handleStateData()
				} else {
					if (role === 'Student') {
						await fetchDraftData()
					} else {
						await fetchStudentData()
					}
				}

				// Check for persisted data after loading
				if (role === 'Student' && !editMode) {
					// Check if we just switched languages or navigated back
					const isLanguageSwitching = localStorage.getItem(
						'isLanguageSwitching'
					)
					const isNavigatingAfterSave = localStorage.getItem(
						'isNavigatingAfterSave'
					)

					if (isLanguageSwitching === 'true') {
						localStorage.removeItem('isLanguageSwitching')
						// Force load the saved data
						const persistedEditData = loadFromStorage()
						if (persistedEditData && persistedEditData.draft) {
							// Automatically restore without dialog
							setEditData(persistedEditData)
							setEditMode(true)
							showAlert(
								t('dataRestoredAfterLanguageSwitch') ||
									'Your data has been restored after language switch',
								'success'
							)
							// Clear the saved data since we've restored it
							setTimeout(() => {
								immediateSave(persistedEditData)
							}, 500)
						}
					} else if (isNavigatingAfterSave === 'true') {
						localStorage.removeItem('isNavigatingAfterSave')
						// Check if there's saved data to restore
						const persistedEditData = loadFromStorage()
						if (persistedEditData && persistedEditData.draft) {
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
			} catch (error) {
				showAlert('Error loading data', 'error')
			} finally {
				setIsLoading(false)
			}
		}

		loadData()
	}, [id, role, statedata])

	const handleStateData = () => {
		if (statedata.draft) {
			setDraft(statedata.draft)
			if (
				statedata.draft.status === 'checking' ||
				statedata.draft.status === 'approved'
			) {
				// Status is checking or approved
			} else {
				// Status is not checking or approved
			}

			// Parse certificate fields properly
			const parsedStateData = mapData(statedata)

			const mappedData = {
				...parsedStateData,
				draft: statedata.draft.profile_data || {},
			}

			setStudent(mappedData)
			setEditData(mappedData)
			// Update the original data reference for change detection
			updateOriginalData(mappedData)

			// Clear any stale localStorage data that might exist
			clearStorage()
			setHasDraft(true)
			SetUpdateQA(!updateQA)
		}
	}

	const fetchDraftData = async () => {
		try {
			const studentIdToUse =
				role === 'Student' ? getStudentIdFromLoginUser() : id

			if (!studentIdToUse) {
				showAlert('Unable to determine student ID', 'error')
				return
			}

			const response = await axios.get(`/api/draft/student/${studentIdToUse}`)

			if (response.data) {
				const studentData = { ...response.data }
				const draftData = studentData.draft
				delete studentData.draft

				if (draftData) {
					setCurrentDraft(draftData)
					setHasDraft(true)

					if (
						draftData.status === 'checking' ||
						draftData.status === 'approved'
					) {
						// Status is checking or approved
					}
				}

				const mappedData = {
					...studentData,
					draft: draftData ? draftData.profile_data : {},
				}

				setStudent(mappedData)
				setEditData(mappedData)
				// Update the original data reference for change detection
				updateOriginalData(mappedData)

				// Clear any stale localStorage data that might exist
				clearStorage()
				SetUpdateQA(!updateQA)
			} else {
				showAlert('No data found', 'error')
			}
		} catch (error) {
			showAlert('Error fetching draft data', 'error')
		}
	}

	const getStudentIdFromLoginUser = () => {
		try {
			const loginUserData = JSON.parse(sessionStorage.getItem('loginUser'))
			return loginUserData?.studentId
		} catch (e) {
			return null
		}
	}

	const fetchStudentData = async () => {
		try {
			const response = await axios.get(`/api/students/${id}`)
			const studentData = response.data

			// Always parse JSON fields first using mapData
			const parsedStudentData = mapData(studentData)

			// Admin uchun draft ma'lumotlarini to'g'ri o'rnatish
			if (studentData.draft && studentData.draft.profile_data) {
				setCurrentDraft(studentData.draft)
				setHasDraft(true)

				// Merge parsed base data with draft data
				const mappedData = {
					...parsedStudentData,
					draft: studentData.draft.profile_data || {},
				}

				setStudent(mappedData)
				setEditData(mappedData)
				// Update the original data reference for change detection
				updateOriginalData(mappedData)

				// Clear any stale localStorage data that might exist
				clearStorage()
			} else {
				// Agar draft yo'q bo'lsa, parsed mapping
				setStudent(parsedStudentData)
				setEditData(parsedStudentData)
				// Update the original data reference for change detection
				updateOriginalData(parsedStudentData)

				// Clear any stale localStorage data that might exist
				clearStorage()
				setHasDraft(false)
			}

			SetUpdateQA(!updateQA)
		} catch (error) {
			showAlert('Error fetching student data', 'error')
		}
	}

	const fetchDraft = async (studentData = null) => {
		try {
			const studentIdToUse =
				studentData?.student_id || student?.student_id || id
			const response = await axios.get(`/api/draft/student/${studentIdToUse}`)

			if (response.data && response.data.draft) {
				setHasDraft(true)
				const draft = response.data.draft

				if (draft.status === 'checking' || draft.status === 'approved') {
					// Status is checking or approved
				} else {
					// Status is not checking or approved
				}

				setCurrentDraft(draft)

				setEditData(prevEditData => {
					const updatedEditData = {
						...prevEditData,
						draft: {
							...prevEditData.draft,
							...(draft.profile_data || {}),
						},
					}
					return updatedEditData
				})

				SetUpdateQA(!updateQA)
			} else {
				setHasDraft(false)
			}
		} catch (error) {
			setHasDraft(false)
		}
	}

	const mapData = data => {
		const draftKeys = [
			'deliverables',
			'gallery',
			'self_introduction',
			'hobbies',
			'other_information',
			'it_skills',
			'skills',
			'address',
			'jlpt',
			'jdu_japanese_certification',
			'japanese_speech_contest',
			'it_contest',
			'qa',
		]
		return {
			...data,
			draft: draftKeys.reduce((acc, key) => {
				try {
					// For certificate fields, parse JSON and extract highest value
					if (key === 'jlpt' || key === 'jdu_japanese_certification') {
						acc[key] = getJLPTData(data[key]).highest
					} else if (
						key === 'japanese_speech_contest' ||
						key === 'it_contest'
					) {
						acc[key] = getCertificateData(data[key]).highest
					} else {
						acc[key] = data[key] || ''
					}
				} catch (error) {
					acc[key] = data[key] || ''
				}
				return acc
			}, {}),
		}
	}
    const [warningModal, setWarningModal] = useState({ open: false, message: '' })

    const handleSubmitDraft = async () => {
		try {
			if (currentDraft && currentDraft.id) {
				const response = await axios.put(
					`/api/draft/${currentDraft.id}/submit`,
					{}
				)
				if (response.status === 200) {
					showAlert(t('draftSubmittedSuccessfully'), 'success')
					setCurrentDraft({
						...currentDraft,
						status: 'submitted',
						submit_count: (currentDraft.submit_count || 0) + 1,
					})
					if (role === 'Student') {
						fetchDraftData()
					} else {
						fetchDraft()
					}
				}
			} else {
				showAlert(t('noDraftToSubmit'), 'error')
			}
        } catch (error) {
            const status = error?.response?.status
            const serverMsg = error?.response?.data?.error
            // For validation errors (e.g., missing required answers), prefer localized message
            if (status === 400) {
                setWarningModal({
                    open: true,
                    message: t('pleaseAnswerRequired') || serverMsg || 'Required questions are missing.',
                })
            } else if (serverMsg) {
                setWarningModal({ open: true, message: serverMsg })
            } else {
                setWarningModal({
                    open: true,
                    message: t('errorSubmittingDraft') || 'Error submitting draft',
                })
            }
		} finally {
			setConfirmMode(false)
		}
	}

	const setTopEditMode = val => {
		setEditMode(val)
	}

	const setDraft = draft => {
		setCurrentDraft(draft)
		setEditData(prevEditData => {
			const updatedEditData = {
				...prevEditData,
				draft: draft.profile_data,
			}
			setStudent(updatedEditData)
			return updatedEditData
		})
		SetUpdateQA(!updateQA)
	}

	const updateDraftStatus = async draftId => {
		const res = await axios.put(`/api/draft/status/${draftId}`, {
			status: 'checking',
			reviewed_by: userId,
		})
		if (res.status === 200) {
			showAlert(t('setToChecking'), 'success')
			// Update the currentDraft state to reflect the new status
			setCurrentDraft(prevDraft => ({
				...prevDraft,
				status: 'checking',
				reviewed_by: userId,
			}))
		}
	}

	// Callback function to update currentDraft from child components
	const updateCurrentDraft = newStatus => {
		setCurrentDraft(prevDraft => ({
			...prevDraft,
			status: newStatus,
		}))
	}

	const handleUpdateEditData = (key, value) => {
		setEditData(prevEditData => {
			const updatedData = {
				...prevEditData,
				draft: {
					...prevEditData.draft,
					[key]: value,
				},
			}
			return updatedData
		})
	}

	// Auto-save effect with change detection
	useEffect(() => {
		if (editMode && role === 'Student' && editData?.draft && student) {
			const hasChanges = hasChangesFromOriginal(editData)

			if (hasChanges) {
				saveToStorageIfChanged(editData)
				setSaveStatus(prev => ({ ...prev, hasUnsavedChanges: true }))
			} else {
				setSaveStatus(prev => ({ ...prev, hasUnsavedChanges: false }))
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editData, editMode, role, student])

	// Clear navigation flags on unmount
	useEffect(() => {
		return () => {
			// Clean up flags when component unmounts
			localStorage.removeItem('isNavigatingAfterSave')
		}
	}, [])

	// ✅ Helper functions for description management
	const handleHobbiesDescriptionUpdate = value => {
		handleUpdateEditData('hobbies_description', value)
	}

	const handleSpecialSkillsDescriptionUpdate = value => {
		handleUpdateEditData('special_skills_description', value)
	}

	// ✅ Helper functions for tag management
	const parseTagsFromString = str => {
		if (!str) return []
		// Split by common delimiters and filter empty values
		return str
			.split(/[,、。・]/g)
			.map(tag => tag.trim())
			.filter(tag => tag.length > 0)
	}

	const handleAddHobby = () => {
		if (!hobbiesInput.trim()) return

		const currentHobbies = parseTagsFromString(editData.draft.hobbies || '')
		const newHobbies = [...currentHobbies, hobbiesInput.trim()]
		handleUpdateEditData('hobbies', newHobbies.join('、'))
		setHobbiesInput('')
		setShowHobbiesInput(false) // Hide input after saving
	}

	const handleRemoveHobby = indexToRemove => {
		const currentHobbies = parseTagsFromString(editData.draft.hobbies || '')
		const updatedHobbies = currentHobbies.filter(
			(_, index) => index !== indexToRemove
		)
		handleUpdateEditData('hobbies', updatedHobbies.join('、'))
	}

	const handleAddSpecialSkill = () => {
		if (!specialSkillsInput.trim()) return

		const currentSkills = parseTagsFromString(
			editData.draft.other_information || ''
		)
		const newSkills = [...currentSkills, specialSkillsInput.trim()]
		handleUpdateEditData('other_information', newSkills.join('、'))
		setSpecialSkillsInput('')
		setShowSpecialSkillsInput(false) // Hide input after saving
	}

	const handleRemoveSpecialSkill = indexToRemove => {
		const currentSkills = parseTagsFromString(
			editData.draft.other_information || ''
		)
		const updatedSkills = currentSkills.filter(
			(_, index) => index !== indexToRemove
		)
		handleUpdateEditData('other_information', updatedSkills.join('、'))
	}

	// New functions to show input fields
	const showAddHobbyInput = () => {
		setShowHobbiesInput(true)
		setHobbiesInput('')
	}

	const showAddSpecialSkillInput = () => {
		setShowSpecialSkillsInput(true)
		setSpecialSkillsInput('')
	}

	const cancelAddHobby = () => {
		setShowHobbiesInput(false)
		setHobbiesInput('')
	}

	const cancelAddSpecialSkill = () => {
		setShowSpecialSkillsInput(false)
		setSpecialSkillsInput('')
	}

	const handleQAUpdate = value => {
		setEditData(prevEditData => {
			const updatedEditData = {
				...prevEditData,
				draft: {
					...prevEditData.draft,
					qa: value,
				},
			}
			setStudent(updatedEditData)
			return updatedEditData
		})
	}

	const handleImageUpload = (activeDeliverable, file) => {
		setDeliverableImages(prevImages => ({
			...prevImages,
			[activeDeliverable]: file,
		}))
	}

	// Simple save function
	const handleSave = async () => {
		try {
			const formData = getValues()
			await handleDraftUpsert(formData)
			reset(formData)
			setHasUnsavedChanges(false)
			showAlert(t('changes_saved'), 'success')
		} catch (error) {
			showAlert('Error saving changes', 'error')
		}
	}

	const handleDraftUpsert = async (formData = editData) => {
		try {
			// First, upload gallery images if any
			if (newImages.length > 0) {
				const formData = new FormData()
				newImages.forEach(file => {
					formData.append('files', file) // Use 'files' for multiple uploads
				})
				formData.append('imageType', 'Gallery')
				formData.append('id', id)
				deletedUrls.forEach((url, index) => {
					formData.append(`oldFilePath[${index}]`, url)
				})

				const fileResponse = await axios.post(
					'/api/files/upload-multiple',
					formData,
					{
						headers: { 'Content-Type': 'multipart/form-data' },
					}
				)

				let oldFiles = editData.draft.gallery || []
				if (Array.isArray(fileResponse.data)) {
					fileResponse.data.forEach(file => {
						oldFiles.push(file.file_url) // Updated to use file_url from new API response
					})
				}
				await handleUpdateEditData('gallery', oldFiles)
			}

			// Upload deliverable images
			const updatedDeliverables = [...(editData.draft.deliverables || [])]

			for (const [index, file] of Object.entries(deliverableImages)) {
				if (file) {
					const deliverableFormData = new FormData()
					deliverableFormData.append('role', role)
					deliverableFormData.append('file', file)
					deliverableFormData.append('imageType', 'Deliverable')
					deliverableFormData.append('id', id)

					// Get existing image URL to replace
					const existingImageUrl = updatedDeliverables[index]?.imageLink || ''
					if (existingImageUrl && !existingImageUrl.startsWith('blob:')) {
						deliverableFormData.append('oldFilePath', existingImageUrl)
					}

					try {
						const deliverableFileResponse = await axios.post(
							'/api/files/upload',
							deliverableFormData,
							{ headers: { 'Content-Type': 'multipart/form-data' } }
						)

						if (deliverableFileResponse.data.Location) {
							// Make sure we have a deliverable at this index
							if (!updatedDeliverables[index]) {
								updatedDeliverables[index] = {
									title: '',
									description: '',
									link: '',
									role: [],
									codeLink: '',
									imageLink: '',
								}
							}
							updatedDeliverables[index].imageLink =
								deliverableFileResponse.data.Location
						}
					} catch (imageUploadError) {}
				}
			}

			// Update the deliverables in editData
			await handleUpdateEditData('deliverables', updatedDeliverables)

			const studentIdToUse = student.student_id || id

			const draftData = {
				student_id: studentIdToUse,
				profile_data: {
					...editData.draft,
					deliverables: updatedDeliverables,
				},
			}

			// Always use PUT for upsert approach (backend uses PUT method)
			const res = await axios.put(`/api/draft`, draftData)

			setCurrentDraft(res.data.draft || res.data)
			setHasDraft(true)

			// Update student data with new deliverables
			const updatedStudent = {
				...editData,
				draft: {
					...editData.draft,
					deliverables: updatedDeliverables,
				},
			}
			setStudent(updatedStudent)
			setEditData(updatedStudent)

			// Clear temporary data
			setNewImages([])
			setDeletedUrls([])
			setDeliverableImages({})
			setResetDeliverablePreviews(prev => !prev) // Trigger reset
			setEditMode(false)
			// Clear persisted data after successful save and update original data reference
			if (role === 'Student') {
				clearStorage()
				setSaveStatus({
					isSaving: false,
					lastSaved: null,
					hasUnsavedChanges: false,
				})
				// Update the original data reference to the newly saved data
				updateOriginalData(updatedStudent)
			}
			showAlert(t('changesSavedSuccessfully'), 'success')
		} catch (error) {
			showAlert(t('errorSavingChanges'), 'error')
		}
	}

	const toggleConfirmMode = () => {
		setConfirmMode(prev => !prev)
	}
	// Fetch language skills from API
	const fetchLanguageSkills = async () => {
		try {
			const response = await axios.get(`/api/skills/`)
			console.log(response.data)

			setFilteredLanguageSkills(response.data)
		} catch (error) {
			console.error('Error fetching language skills:', error)
		}
	}

	if (isLoading) {
		return <div>{t('loading')}</div>
	}

	if (!student) {
		return <div>{t('noDataFound')}</div>
	}

	const portalContent = (
		<Box className={styles.buttonsContainer}>
			{editMode ? (
				<>
					<Button
						onClick={handleDraftUpsert}
						variant='contained'
						color='primary'
						size='small'
					>
						{t('updateDraft')}
					</Button>
					<Button
						onClick={handleCancel}
						variant='outlined'
						color='error'
						size='small'
					>
						{t('cancel')}
					</Button>
				</>
			) : (
				<>
					<Button
						onClick={() => {
							// Clear any stale localStorage before entering edit mode
							clearStorage()
							setEditMode(true)
							// Clear any old save status when entering edit mode
							if (role === 'Student' || role === 'Recruiter') {
								setSaveStatus({
									isSaving: false,
									lastSaved: null,
									hasUnsavedChanges: false,
								})
							}
						}}
						variant='contained'
						color='primary'
						size='small'
					>
						{t('editProfile')}
					</Button>

					{hasDraft && currentDraft && (
						<Button
							onClick={toggleConfirmMode}
							variant='contained'
							color='success'
							size='small'
							sx={{ ml: 1 }}
						>
							{t('submitAgree')}
						</Button>
					)}
				</>
			)}
		</Box>
	)

	// ✅ Safe partner university name with null check
	const partnerUniversityName =
		student.partner_university || 'Partner University'

	const creditMap = {
		JDU: student.japanese_employment_credits,
		'University of World Languages': student.world_language_university_credits,
		[partnerUniversityName]: student.partner_university_credits,
	}
	return (
		<Box mb={2}>
			{/* ✅ Portal container mavjudligini tekshirish */}
			{portalContainer && role === 'Student'
				? createPortal(portalContent, portalContainer)
				: role === 'Student'
					? portalContent
					: null}

			<div
				style={{
					borderTop: '1px solid #e1e1e1',
					backgroundColor: '#ffffff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'start',
					padding: '20px 16px',
					gap: 32,
					borderEndEndRadius: 10,
					borderEndStartRadius: 10,
				}}
			>
				{['selfIntroduction', 'skill', 'deliverables', 'qa'].map(
					(item, ind) => (
						<div
							key={ind}
							style={{
								fontWeight: 500,
								fontSize: 16,
								color: subTabIndex === ind ? '#5627db' : '#4b4b4b',
								borderBottom:
									subTabIndex === ind ? '2px solid #5627db' : '#4b4b4b',
								cursor: 'pointer',
							}}
							onClick={() => {
								setSubTabIndex(ind)
							}}
						>
							{t(item)}
						</div>
					)
				)}
			</div>

			{/* Staff Comment Display Section for Students */}
			{role === 'Student' &&
				currentDraft &&
				currentDraft.comments &&
				(currentDraft.status === 'resubmission_required' ||
					currentDraft.status === 'disapproved') && (
					<Box
						sx={{
							my: 2,
							mx: 2,
							p: 2,
							backgroundColor: '#fff3e0',
							border: '1px solid #ff9800',
							borderRadius: '8px',
							borderLeft: '4px solid #ff9800',
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
							<span style={{ fontWeight: 'bold', color: '#e65100' }}>
								スタッフからのフィードバック
							</span>
						</Box>
						<Box
							sx={{
								backgroundColor: '#ffffff',
								p: 2,
								borderRadius: '4px',
								border: '1px solid #ffcc80',
							}}
						>
							<pre
								style={{
									whiteSpace: 'pre-wrap',
									wordWrap: 'break-word',
									fontFamily: 'inherit',
									margin: 0,
									color: '#424242',
								}}
							>
								{currentDraft.comments}
							</pre>
						</Box>
						<Box sx={{ mt: 1, fontSize: '0.9em', color: '#666' }}>
							プロフィールを修正して再度提出してください。
						</Box>
					</Box>
				)}

			{/* Past staff comment history for students */}
			{role === 'Student' && (
				<HistoryComments />
			)}

			{role === 'Staff' &&
			!isLoading &&
			currentDraft &&
			currentDraft.id &&
			currentDraft.status === 'submitted' ? (
				<Box
					sx={{
						my: 2,
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					<Button
						onClick={() => updateDraftStatus(currentDraft.id)}
						variant='contained'
						color='warning'
						size='small'
						sx={{ width: '80%', height: '36px', fontSize: '18px' }}
					>
						{t('start_checking')}
					</Button>
				</Box>
			) : null}
			{/* self introduction */}
			{subTabIndex === 0 && (
				<Box my={2}>
					<TextField
						title={t('selfIntroduction')}
						data={student.draft.self_introduction}
						editData={editData}
						editMode={editMode}
						updateEditData={handleUpdateEditData}
						keyName='self_introduction'
						parentKey='draft'
						icon={BadgeOutlinedIcon}
						imageUrl={student.photo}
						isChanged={
							role === 'Staff' &&
							currentDraft?.changed_fields?.includes('self_introduction')
						}
					/>
					{/* New Design for Hobbies and Special Skills */}
					<div style={{ display: 'flex', gap: 25, marginTop: 25 }}>
						{/* Hobbies Section */}
						<div
							style={{
								flex: 1,
								backgroundColor:
									role === 'Staff' &&
									(currentDraft?.changed_fields?.includes('hobbies') ||
										currentDraft?.changed_fields?.includes(
											'hobbies_description'
										))
										? '#fff3cd'
										: '#ffffff',
								padding: 20,
								borderRadius: 10,
								border:
									role === 'Staff' &&
									(currentDraft?.changed_fields?.includes('hobbies') ||
										currentDraft?.changed_fields?.includes(
											'hobbies_description'
										))
										? '2px solid #ffc107'
										: '1px solid #e1e1e1',
								position: 'relative',
							}}
						>
							{role === 'Staff' &&
								(currentDraft?.changed_fields?.includes('hobbies') ||
									currentDraft?.changed_fields?.includes(
										'hobbies_description'
									)) && (
									<div
										style={{
											position: 'absolute',
											top: -10,
											right: 10,
											backgroundColor: '#ffc107',
											color: '#fff',
											padding: '2px 8px',
											borderRadius: '4px',
											fontSize: '12px',
											fontWeight: 'bold',
										}}
									>
										変更あり
									</div>
								)}
							<div
								style={{
									fontSize: 20,
									fontWeight: 600,
									display: 'flex',
									alignItems: 'center',
									gap: 8,
									marginBottom: 15,
									color: '#5627DB',
								}}
							>
								<FavoriteBorderTwoToneIcon sx={{ color: '#5627DB' }} />
								{t('hobbies')}
							</div>

							{editMode ? (
								<>
									{/* Description Input */}
									<div style={{ marginBottom: 20 }}>
										<div
											style={{ marginBottom: 8, color: '#666', fontSize: 14 }}
										>
											{t('hobbiesDetailDescription')}
										</div>
										<MuiTextField
											fullWidth
											multiline
											rows={3}
											placeholder={t('hobbiesDescriptionPlaceholder')}
											value={editData.draft.hobbies_description || ''}
											onChange={e =>
												handleHobbiesDescriptionUpdate(e.target.value)
											}
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: 2,
												},
											}}
										/>
									</div>

									{/* Tag Creation Section */}
									<div style={{ marginBottom: 20 }}>
										<div
											style={{ marginBottom: 10, color: '#666', fontSize: 14 }}
										>
											{t('hobbiesTags')}
										</div>
										{!showHobbiesInput ? (
											<Button
												onClick={showAddHobbyInput}
												startIcon={<AddIcon />}
												sx={{
													color: '#5627DB',
													borderColor: '#5627DB',
													'&:hover': {
														backgroundColor: '#5627DB',
														color: 'white',
													},
												}}
												variant='outlined'
												size='small'
											>
												{t('addTag')}
											</Button>
										) : (
											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													gap: 10,
												}}
											>
												<MuiTextField
													fullWidth
													size='small'
													placeholder={t('hobbiesTagPlaceholder')}
													value={hobbiesInput}
													onChange={e => setHobbiesInput(e.target.value)}
													onKeyPress={e => {
														if (e.key === 'Enter') {
															handleAddHobby()
														}
													}}
													sx={{
														'& .MuiOutlinedInput-root': {
															borderRadius: 2,
														},
													}}
												/>
												<div style={{ display: 'flex', gap: 10 }}>
													<Button
														onClick={handleAddHobby}
														variant='contained'
														size='small'
														sx={{
															backgroundColor: '#5627DB',
															'&:hover': {
																backgroundColor: '#4520A6',
															},
														}}
														disabled={!hobbiesInput.trim()}
													>
														{t('save')}
													</Button>
													<Button
														onClick={cancelAddHobby}
														variant='outlined'
														size='small'
														sx={{
															color: '#666',
															borderColor: '#666',
														}}
													>
														{t('cancel')}
													</Button>
												</div>
											</div>
										)}

										<div
											style={{
												marginTop: 15,
												display: 'flex',
												gap: 8,
												flexWrap: 'wrap',
											}}
										>
											{parseTagsFromString(editData.draft.hobbies || '').map(
												(hobby, index) => (
													<Chip
														key={index}
														label={hobby}
														onDelete={() => handleRemoveHobby(index)}
														deleteIcon={<CloseIcon />}
														size='small'
														sx={{
															backgroundColor: '#5627DB',
															color: 'white',
															'& .MuiChip-deleteIcon': {
																color: 'white',
															},
														}}
													/>
												)
											)}
										</div>
									</div>
								</>
							) : (
								<>
									<div
										style={{ marginBottom: 15, color: '#666', lineHeight: 1.6 }}
									>
										{editData.draft.hobbies_description ||
											student.draft.hobbies ||
											'SF映画を見ることです。最近観た映画はインターステラーです。他には卓球を友人とよくやります。'}
									</div>
									<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
										{parseTagsFromString(
											student.draft.hobbies || 'SF映画、卓球'
										).map((hobby, index) => (
											<Chip
												key={index}
												label={hobby}
												size='small'
												sx={{
													backgroundColor: '#5627DB',
													color: 'white',
												}}
											/>
										))}
									</div>
								</>
							)}
						</div>

						{/* Special Skills Section */}
						<div
							style={{
								flex: 1,
								backgroundColor:
									role === 'Staff' &&
									(currentDraft?.changed_fields?.includes('special_skills') ||
										currentDraft?.changed_fields?.includes(
											'special_skills_description'
										))
										? '#fff3cd'
										: '#ffffff',
								padding: 20,
								borderRadius: 10,
								border:
									role === 'Staff' &&
									(currentDraft?.changed_fields?.includes('special_skills') ||
										currentDraft?.changed_fields?.includes(
											'special_skills_description'
										))
										? '2px solid #ffc107'
										: '1px solid #e1e1e1',
								position: 'relative',
							}}
						>
							{role === 'Staff' &&
								(currentDraft?.changed_fields?.includes('special_skills') ||
									currentDraft?.changed_fields?.includes(
										'special_skills_description'
									)) && (
									<div
										style={{
											position: 'absolute',
											top: -10,
											right: 10,
											backgroundColor: '#ffc107',
											color: '#fff',
											padding: '2px 8px',
											borderRadius: '4px',
											fontSize: '12px',
											fontWeight: 'bold',
										}}
									>
										変更あり
									</div>
								)}
							<div
								style={{
									fontSize: 20,
									fontWeight: 600,
									display: 'flex',
									alignItems: 'center',
									gap: 8,
									marginBottom: 15,
									color: '#5627DB',
								}}
							>
								<ElectricBoltIcon sx={{ color: '#5627DB' }} />
								{t('specialSkills')}
							</div>

							{editMode ? (
								<>
									{/* Description Input */}
									<div style={{ marginBottom: 20 }}>
										<div
											style={{ marginBottom: 8, color: '#666', fontSize: 14 }}
										>
											{t('specialSkillsDetailDescription')}
										</div>
										<MuiTextField
											fullWidth
											multiline
											rows={3}
											placeholder={t('specialSkillsDescriptionPlaceholder')}
											value={editData.draft.special_skills_description || ''}
											onChange={e =>
												handleSpecialSkillsDescriptionUpdate(e.target.value)
											}
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: 2,
												},
											}}
										/>
									</div>

									{/* Tag Creation Section */}
									<div style={{ marginBottom: 20 }}>
										<div
											style={{ marginBottom: 10, color: '#666', fontSize: 14 }}
										>
											{t('specialSkillsTags')}
										</div>
										{!showSpecialSkillsInput ? (
											<Button
												onClick={showAddSpecialSkillInput}
												startIcon={<AddIcon />}
												sx={{
													color: '#5627DB',
													borderColor: '#5627DB',
													'&:hover': {
														backgroundColor: '#5627DB',
														color: 'white',
													},
												}}
												variant='outlined'
												size='small'
											>
												{t('addTag')}
											</Button>
										) : (
											<div
												style={{
													display: 'flex',
													flexDirection: 'column',
													gap: 10,
												}}
											>
												<MuiTextField
													fullWidth
													size='small'
													placeholder={t('specialSkillsTagPlaceholder')}
													value={specialSkillsInput}
													onChange={e => setSpecialSkillsInput(e.target.value)}
													onKeyPress={e => {
														if (e.key === 'Enter') {
															handleAddSpecialSkill()
														}
													}}
													sx={{
														'& .MuiOutlinedInput-root': {
															borderRadius: 2,
														},
													}}
												/>
												<div style={{ display: 'flex', gap: 10 }}>
													<Button
														onClick={handleAddSpecialSkill}
														variant='contained'
														size='small'
														sx={{
															backgroundColor: '#5627DB',
															'&:hover': {
																backgroundColor: '#4520A6',
															},
														}}
														disabled={!specialSkillsInput.trim()}
													>
														{t('save')}
													</Button>
													<Button
														onClick={cancelAddSpecialSkill}
														variant='outlined'
														size='small'
														sx={{
															color: '#666',
															borderColor: '#666',
														}}
													>
														{t('cancel')}
													</Button>
												</div>
											</div>
										)}

										<div
											style={{
												marginTop: 15,
												display: 'flex',
												gap: 8,
												flexWrap: 'wrap',
											}}
										>
											{parseTagsFromString(
												editData.draft.other_information || ''
											).map((skill, index) => (
												<Chip
													key={index}
													label={skill}
													onDelete={() => handleRemoveSpecialSkill(index)}
													deleteIcon={<CloseIcon />}
													size='small'
													sx={{
														backgroundColor: '#5627DB',
														color: 'white',
														'& .MuiChip-deleteIcon': {
															color: 'white',
														},
													}}
												/>
											))}
										</div>
									</div>
								</>
							) : (
								<>
									<div
										style={{ marginBottom: 15, color: '#666', lineHeight: 1.6 }}
									>
										{editData.draft.special_skills_description ||
											student.draft.other_information ||
											'ユーザー視点に立ってWebデザインを考え、機能性と美しさのバランスを取ったデザインに落とし込むのが得意です。'}
									</div>
									<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
										{parseTagsFromString(
											student.draft.other_information ||
												'Webデザイン、UX/UI設計'
										).map((skill, index) => (
											<Chip
												key={index}
												label={skill}
												size='small'
												sx={{
													backgroundColor: '#5627DB',
													color: 'white',
												}}
											/>
										))}
									</div>
								</>
							)}
						</div>
					</div>
					<div style={{ display: 'flex', gap: 25 }}>
						<TextField
							title={t('origin')}
							data={student.draft.address || student.address}
							editData={editData}
							editMode={editMode}
							updateEditData={handleUpdateEditData}
							keyName='address'
							parentKey='draft'
							icon={LocationOnOutlinedIcon}
						/>
						<TextField
							title={t('major')}
							data={student.draft.major || 'ITマネジメント'}
							editData={editData}
							editMode={editMode}
							updateEditData={handleUpdateEditData}
							keyName='major'
							parentKey='draft'
							icon={SchoolOutlinedIcon}
						/>
						<TextField
							title={t('jobType')}
							data={student.draft.job_type || 'UX/UIデザイナー'}
							editData={editData}
							editMode={editMode}
							updateEditData={handleUpdateEditData}
							keyName='job_type'
							parentKey='draft'
							icon={BusinessCenterOutlinedIcon}
						/>
					</div>
				</Box>
			)}
			{/* skills */}
			{subTabIndex === 1 && (
				<Box my={2}>
					<div className={styles.gridBox}>
						<SkillSelector
							title={t('itSkills')}
							headers={{
								上級: t('threeYearsOrMore'),
								中級: t('threeYearsOrMore'),
								初級: t('oneToOneAndHalfYears'),
							}}
							data={student.draft}
							editData={editData}
							editMode={editMode}
							updateEditData={handleUpdateEditData}
							showAutocomplete={true}
							keyName='it_skills'
							parentKey='draft'
							icon={<CodeIcon sx={{ color: '#5627DB' }} />}
							isChanged={
								role === 'Staff' &&
								currentDraft?.changed_fields?.includes('it_skills')
							}
						/>
						<div
							style={{
								padding: '20px',
								backgroundColor: '#ffffff',
								borderRadius: '12px',
								boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
								maxHeight: 346,
							}}
						>
							<div
								style={{
									fontSize: 20,
									fontWeight: 600,
									display: 'flex',
									alignItems: 'center',
									gap: 8,
									marginBottom: 20,
								}}
							>
								<WorkspacePremiumOutlinedIcon sx={{ color: '#5627DB' }} />
								{t('Qualifications')}
							</div>

							<div
								style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
							>
								{/* JLPT */}
								<div
									style={{ display: 'flex', alignItems: 'center', height: 36 }}
								>
									<span style={{ minWidth: 160, fontWeight: 500 }}>JLPT:</span>
									<span
										style={{
											padding: '6px 20px',
											fontWeight: 500,
											fontSize: 14,
											border: '1px solid #e0e0e0',
											borderRadius: 6,
											background: editMode ? '#f5f5f5' : '#fff',
											color: editMode ? '#666' : '#000',
											cursor: editMode ? 'not-allowed' : 'default',
										}}
										title={
											editMode ? 'この情報はKintoneから管理されています' : ''
										}
									>
										{(() => {
											const jlptData = editData.draft.jlpt
												? getJLPTData(editData.draft.jlpt).highest
												: getJLPTData(student.jlpt).highest
											return jlptData || t('none')
										})()}
									</span>
								</div>

								{/* JDU Certification */}
								<div
									style={{ display: 'flex', alignItems: 'center', height: 36 }}
								>
									<span style={{ minWidth: 160, fontWeight: 500 }}>
										{t('jdu_certification')}:
									</span>
									<span
										style={{
											padding: '6px 20px',
											fontWeight: 500,
											fontSize: 14,
											border: '1px solid #e0e0e0',
											borderRadius: 6,
											background: editMode ? '#f5f5f5' : '#fff',
											color: editMode ? '#666' : '#000',
											cursor: editMode ? 'not-allowed' : 'default',
										}}
										title={
											editMode ? 'この情報はKintoneから管理されています' : ''
										}
									>
										{(() => {
											const jduData = editData.draft.jdu_japanese_certification
												? getJLPTData(editData.draft.jdu_japanese_certification)
														.highest
												: getJLPTData(student.jdu_japanese_certification)
														.highest
											return jduData || t('none')
										})()}
									</span>
								</div>

								{/* Japanese Speech Contest */}
								<div
									style={{ display: 'flex', alignItems: 'center', height: 36 }}
								>
									<span style={{ minWidth: 160, fontWeight: 500 }}>
										{t('japaneseSpeechContest')}:
									</span>
									<span
										style={{
											padding: '6px 20px',
											fontWeight: 500,
											fontSize: 14,
											border: '1px solid #e0e0e0',
											borderRadius: 6,
											background: editMode ? '#f5f5f5' : '#fff',
											color: editMode ? '#666' : '#000',
											cursor: editMode ? 'not-allowed' : 'default',
										}}
										title={
											editMode ? 'この情報はKintoneから管理されています' : ''
										}
									>
										{(() => {
											const speechData = editData.draft.japanese_speech_contest
												? getCertificateData(
														editData.draft.japanese_speech_contest
													).highest
												: getCertificateData(student.japanese_speech_contest)
														.highest
											return speechData || t('none')
										})()}
									</span>
									<span style={{ marginLeft: 8 }}>{t('rank')}</span>
								</div>

								{/* IT Contest */}
								<div
									style={{ display: 'flex', alignItems: 'center', height: 36 }}
								>
									<span style={{ minWidth: 160, fontWeight: 500 }}>
										{t('itContest')}:
									</span>
									<span
										style={{
											padding: '6px 20px',
											fontWeight: 500,
											fontSize: 14,
											border: '1px solid #e0e0e0',
											borderRadius: 6,
											background: editMode ? '#f5f5f5' : '#fff',
											color: editMode ? '#666' : '#000',
											cursor: editMode ? 'not-allowed' : 'default',
										}}
										title={
											editMode ? 'この情報はKintoneから管理されています' : ''
										}
									>
										{(() => {
											const itData = editData.draft.it_contest
												? getCertificateData(editData.draft.it_contest).highest
												: getCertificateData(student.it_contest).highest
											return itData || t('none')
										})()}
									</span>
									<span style={{ marginLeft: 8 }}>{t('rank')}</span>
								</div>
							</div>
						</div>

						<LanguageSkillSelector
							title={t('languageSkills')}
							headers={{
								上級: '3年間以上',
								中級: '1年間〜1年間半',
								初級: '基礎',
							}}
							data={student.draft}
							editMode={editMode}
							editData={editData}
							updateEditData={handleUpdateEditData}
							showAutocomplete={true}
							showHeaders={false}
							keyName='language_skills'
							parentKey='draft'
							icon={<ExtensionOutlinedIcon sx={{ color: '#5627DB' }} />}
							isChanged={
								role === 'Staff' &&
								currentDraft?.changed_fields?.includes('language_skills')
							}
						/>

						<OtherSkillsSelector
							title={t('otherSkills')}
							data={student.draft}
							editData={editData}
							editMode={editMode}
							updateEditData={handleUpdateEditData}
							keyName='other_skills'
							parentKey='draft'
							icon={<ExtensionOutlinedIcon sx={{ color: '#5627DB' }} />}
							isChanged={
								role === 'Staff' &&
								currentDraft?.changed_fields?.includes('other_skills')
							}
						/>
					</div>
				</Box>
			)}
			{/* deliverables */}
			{subTabIndex === 2 && (
				<Box my={2}>
					<Deliverables
						data={student.draft.deliverables}
						editMode={editMode}
						editData={editData.draft.deliverables}
						updateEditData={handleUpdateEditData}
						onImageUpload={handleImageUpload}
						keyName='deliverables'
						resetPreviews={resetDeliverablePreviews}
						isChanged={
							role === 'Staff' &&
							currentDraft?.changed_fields?.includes('deliverables')
						}
					/>
				</Box>
			)}
			{/* Credits section - temporarily disabled
			{subTabIndex === 3 && (
				<Box my={2} backgroundColor={'#FFFFFF'} padding={3}>
					<div style={{ display: 'flex', gap: 10 }}>
						{[
							'JDU',
							partnerUniversityName,
							'University of World Languages',
						].map((item, ind) => (
							<Button
								key={ind}
								variant={item === activeUniver ? 'contained' : 'outlined'}
								onClick={() => {
									setActiveUniver(item)
								}}
							>
								{item}
							</Button>
						))}
					</div>

					<Box
						sx={{
							color: '#1E1E1ECC',
							marginBlock: '20px',
						}}
						my={2}
					>
						<div>{t('studentCredits')}</div>
						<div>
							<span style={{ fontSize: 32, fontWeight: 600, color: 'black' }}>
								{creditMap[activeUniver] ?? 0}
							</span>
							/
							{activeUniver === 'JDU' ||
							activeUniver === 'University of World Languages'
								? 76
								: 124}
						</div>
					</Box>
					<CreditsProgressBar
						studentId={student?.student_id || id}
						student={{
							totalCredits: creditMap[activeUniver] ?? 0,
							semester: student?.semester,
							university: activeUniver,
						}}
						credit_details={student?.credit_details || []}
					/>
				</Box>
			)}
			*/}
			{/* QA */}
			{subTabIndex === 3 && (
				<Box my={2}>
					{/* Debug */}
					{/* {console.log('=== TOP.JSX QA DEBUG ===')}
					{console.log('editData:', editData)}
					{console.log('editData.draft:', editData.draft)}
					{console.log('editData.draft.qa:', editData.draft?.qa)}
					{console.log('typeof qa:', typeof editData.draft?.qa)} */}
					<QA
						updateQA={updateQA}
						data={editData.draft?.qa || {}}
						currentDraft={currentDraft}
						handleQAUpdate={handleQAUpdate}
						isFromTopPage={true}
						topEditMode={editMode}
						handleDraftUpsert={handleDraftUpsert}
						isHonban={currentDraft && currentDraft.status === 'approved'}
						setTopEditMode={setTopEditMode}
						updateCurrentDraft={updateCurrentDraft}
						studentId={student?.student_id || id}
					/>
				</Box>
			)}
			<ProfileConfirmDialog
				open={confirmMode}
				onClose={toggleConfirmMode}
				onConfirm={handleSubmitDraft}
			/>

			{/* Auto-save indicator */}
			{editMode && role === 'Student' && (
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
							? t('savingChanges') || 'Saving...'
							: t('changesSaved') || 'Changes saved'}
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
					{t('recoverUnsavedChanges') || 'Recover Unsaved Changes?'}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{t('unsavedChangesFound') ||
							'We found unsaved changes from your previous editing session. Would you like to restore them?'}
					</Typography>
					{persistedData.timestamp && (
						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ mt: 1, display: 'block' }}
						>
							{t('lastModified') || 'Last modified'}:{' '}
							{new Date(persistedData.timestamp).toLocaleString()}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDiscardRecovery} color='error'>
						{t('discard') || 'Discard'}
					</Button>
					<Button
						onClick={handleRecoverData}
						variant='contained'
						startIcon={<RestoreIcon />}
					>
						{t('restore') || 'Restore'}
					</Button>
				</DialogActions>
			</Dialog>

    {/* Unsaved changes warning */}
    <Dialog
        open={showUnsavedWarning}
				onClose={() => {
					setShowUnsavedWarning(false)
					if (pendingLanguageChange) {
						cancelLanguageChange()
					}
					if (pendingNavigation) {
						setPendingNavigation(null)
					}
				}}
			>
				<DialogTitle>
					{pendingLanguageChange
						? t('unsavedChangesLanguageTitle') ||
							'Save changes before switching language?'
						: pendingNavigation
							? t('unsavedChangesNavigationTitle') ||
								'Save changes before leaving?'
							: t('unsavedChangesTitle') || 'Unsaved Changes'}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{pendingLanguageChange
							? t('unsavedChangesLanguageMessage') ||
								'You have unsaved changes. Would you like to save them before changing the language?'
							: pendingNavigation
								? t('unsavedChangesNavigationMessage') ||
									'You have unsaved changes. Would you like to save them before leaving this page?'
								: t('unsavedChangesMessage') ||
									'You have unsaved changes. Are you sure you want to discard them?'}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setShowUnsavedWarning(false)
							if (pendingLanguageChange) {
								cancelLanguageChange()
							}
							if (pendingNavigation) {
								setPendingNavigation(null)
							}
						}}
					>
						{t('continueEditing') || 'Continue Editing'}
					</Button>
					{pendingLanguageChange ? (
						<>
							<Button
								onClick={() => {
									// Discard changes and switch language
									setEditData(student)
									setEditMode(false)
									clearStorage()
									setShowUnsavedWarning(false)
									confirmLanguageChange()
								}}
								color='error'
							>
								{t('discardAndSwitch') || 'Discard & Switch'}
							</Button>
							<Button
								onClick={handleConfirmCancel}
								variant='contained'
								color='primary'
							>
								{t('saveAndSwitch') || 'Save & Switch'}
							</Button>
						</>
					) : pendingNavigation ? (
						<>
							<Button onClick={handleConfirmCancel} color='error'>
								{t('discardAndLeave') || 'Discard & Leave'}
							</Button>
							<Button
								onClick={handleSaveAndNavigate}
								variant='contained'
								color='primary'
							>
								{t('saveAndLeave') || 'Save & Leave'}
							</Button>
						</>
					) : (
						<Button
							onClick={handleConfirmCancel}
							color='error'
							variant='contained'
						>
							{t('discardChanges') || 'Discard Changes'}
						</Button>
					)}
				</DialogActions>
    </Dialog>

    {/* Submit warning modal (e.g., missing required QA answers) */}
    <Dialog
        open={warningModal.open}
        onClose={() => setWarningModal({ open: false, message: '' })}
        aria-labelledby='submit-warning-title'
        aria-describedby='submit-warning-desc'
    >
        <DialogTitle id='submit-warning-title'>
            {t('warning') || 'Warning'}
        </DialogTitle>
        <DialogContent>
            <DialogContentText id='submit-warning-desc'>
                {warningModal.message}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button
                onClick={() => setWarningModal({ open: false, message: '' })}
                color='primary'
                autoFocus
            >
                {t('ok')}
            </Button>
        </DialogActions>
    </Dialog>
		</Box>
	)
}

// --- Helper component: Student's past staff comment history (from notifications) ---
function HistoryComments() {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await axios.get('/api/notification/history')
        const list = res?.data?.notifications || []
        const filtered = list
          .filter(n => typeof n.message === 'string' && n.message.includes('|||COMMENT_SEPARATOR|||'))
          .slice(0, 2)
        if (mounted) setItems(filtered)
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoaded(true)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (!loaded || items.length === 0) return null

  return (
    <Box sx={{ my: 2, mx: 2, p: 2, backgroundColor: '#f7f7f7', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
      <Typography sx={{ fontWeight: 600, mb: 1 }}>過去のスタッフコメント</Typography>
      {items.map((n, idx) => {
        const parts = n.message.split('|||COMMENT_SEPARATOR|||')
        const commentRaw = parts[1] || ''
        const comment = (() => {
          const lines = String(commentRaw).split('\n')
          return lines.length > 1 ? lines.slice(1).join('\n').trim() : commentRaw.trim()
        })()
        return (
          <Box key={n.id || idx} sx={{ p: 1.5, mb: 1, backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #eee' }}>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{comment}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {new Date(n.createdAt).toLocaleString()}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

export default Top
