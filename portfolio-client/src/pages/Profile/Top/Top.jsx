import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'
import CodeIcon from '@mui/icons-material/Code'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined'
import FavoriteBorderTwoToneIcon from '@mui/icons-material/FavoriteBorderTwoTone'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import TranslateIcon from '@mui/icons-material/Translate'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { Box, Button, TextField as MuiTextField, Chip } from '@mui/material'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom' // ReactDOM.createPortal o'rniga
import { useLocation, useParams } from 'react-router-dom'
import CreditsProgressBar from '../../../components/CreditsProgressBar/CreditsProgressBar'
import Deliverables from '../../../components/Deliverables/Deliverables'
import ProfileConfirmDialog from '../../../components/Dialogs/ProfileConfirmDialog'
import SkillSelector from '../../../components/SkillSelector/SkillSelector'
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
	const { language } = useLanguage()
	const showAlert = useAlert()

	const t = key => translations[language][key] || key

	// Helper function to safely parse JLPT data
	const getJLPTData = jlptString => {
		try {
			if (!jlptString) return { highest: 'なし' }
			const parsed = JSON.parse(jlptString)
			return parsed || { highest: 'なし' }
		} catch (error) {
			console.error('Error parsing JLPT data:', error)
			return { highest: 'なし' }
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

			return { highest: '未提出', list: [] }
		} catch (error) {
			console.error('Error parsing certificate data:', error)
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
	const [editData, setEditData] = useState({})
	const [editMode, setEditMode] = useState(false)
	const [currentDraft, setCurrentDraft] = useState({})
	const [updateQA, SetUpdateQA] = useState(true)
	const [newImages, setNewImages] = useState([])
	const [deletedUrls, setDeletedUrls] = useState([])
	const [deliverableImages, setDeliverableImages] = useState({})
	const [subTabIndex, setSubTabIndex] = useState(0)
	const [hasDraft, setHasDraft] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [confirmMode, setConfirmMode] = useState(false)
	const [activeUniver, setActiveUniver] = useState('JDU')
	const [resetDeliverablePreviews, setResetDeliverablePreviews] =
		useState(false)

	// ✅ New state for hobbies and special skills tags
	const [hobbiesInput, setHobbiesInput] = useState('')
	const [specialSkillsInput, setSpecialSkillsInput] = useState('')
	const [showHobbiesInput, setShowHobbiesInput] = useState(false)
	const [showSpecialSkillsInput, setShowSpecialSkillsInput] = useState(false)

	// ✅ Portal container state
	const [portalContainer, setPortalContainer] = useState(null)

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

	useEffect(() => {
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
			} catch (error) {
				console.error('Error loading data:', error)
				showAlert('Error loading data', 'error')
			} finally {
				setIsLoading(false)
			}
		}

		loadData()
	}, [id, role])

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

			const mappedData = {
				...statedata,
				draft: statedata.draft.profile_data || {},
			}

			setStudent(mappedData)
			setEditData(mappedData)
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
				SetUpdateQA(!updateQA)
			} else {
				showAlert('No data found', 'error')
			}
		} catch (error) {
			console.error('Error fetching draft data:', error)
			showAlert('Error fetching draft data', 'error')
		}
	}

	const getStudentIdFromLoginUser = () => {
		try {
			const loginUserData = JSON.parse(sessionStorage.getItem('loginUser'))
			return loginUserData?.studentId
		} catch (e) {
			console.error('Error parsing login user data:', e)
			return null
		}
	}

	const fetchStudentData = async () => {
		try {
			const response = await axios.get(`/api/students/${id}`)
			const studentData = response.data

			console.log('Student data received:', studentData) // Debug log

			// Admin uchun draft ma'lumotlarini to'g'ri o'rnatish
			if (studentData.draft && studentData.draft.profile_data) {
				setCurrentDraft(studentData.draft)
				setHasDraft(true)

				const mappedData = {
					...studentData,
					draft: studentData.draft.profile_data || {},
				}

				console.log('Mapped data for admin:', mappedData) // Debug log

				setStudent(mappedData)
				setEditData(mappedData)
			} else {
				// Agar draft yo'q bo'lsa, oddiy mapping
				const mappedData = mapData(studentData)
				setStudent(mappedData)
				setEditData(mappedData)
				setHasDraft(false)
			}

			SetUpdateQA(!updateQA)
		} catch (error) {
			console.error('Error fetching student data:', error)
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
			console.error('Error fetching draft:', error)
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
		]
		return {
			...data,
			draft: draftKeys.reduce((acc, key) => {
				// For certificate fields, parse JSON and extract highest value
				if (key === 'jlpt' || key === 'jdu_japanese_certification') {
					acc[key] = getJLPTData(data[key]).highest
				} else if (key === 'japanese_speech_contest' || key === 'it_contest') {
					acc[key] = getCertificateData(data[key]).highest
				} else {
					acc[key] = data[key] || ''
				}
				return acc
			}, {}),
		}
	}
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
			console.error('Error submitting draft:', error)
			showAlert(t('errorSubmittingDraft'), 'error')
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
		setEditData(prevEditData => ({
			...prevEditData,
			draft: {
				...prevEditData.draft,
				[key]: value,
			},
		}))
	}

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

	const handleDraftUpsert = async () => {
		try {
			console.log('Starting draft upsert...')
			console.log('Deliverable images:', deliverableImages)
			console.log('Edit data deliverables:', editData.draft.deliverables)

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
					console.log(`Uploading deliverable image for index ${index}`)
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

						console.log(
							'Deliverable image upload response:',
							deliverableFileResponse.data
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
							console.log(
								`Updated deliverable ${index} with image URL:`,
								deliverableFileResponse.data.Location
							)
						}
					} catch (imageUploadError) {
						console.error(
							`Error uploading deliverable image ${index}:`,
							imageUploadError
						)
					}
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
				status: 'draft',
				submit_count: currentDraft.submit_count || 0,
			}

			console.log('Saving draft with data:', draftData)

			let res
			if (currentDraft.id) {
				// Update existing draft
				res = await axios.put(`/api/draft/${currentDraft.id}`, {
					profile_data: draftData.profile_data,
					status: draftData.status,
				})
			} else {
				// Create new draft
				res = await axios.post(`/api/draft`, draftData)
			}

			console.log('Draft save response:', res.data)

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
			showAlert(t('changesSavedSuccessfully'), 'success')
		} catch (error) {
			console.error('Error saving draft:', error)
			showAlert(t('errorSavingChanges'), 'error')
		}
	}

	const toggleConfirmMode = () => {
		setConfirmMode(prev => !prev)
	}

	const handleCancel = () => {
		setEditData(student)
		setEditMode(false)
	}

	if (isLoading) {
		return <div>{t('loading')}</div>
	}
	console.log(student)

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
							setEditMode(prev => !prev)
						}}
						variant='contained'
						color='primary'
						size='small'
					>
						{t('editProfile')}
					</Button>

					{hasDraft &&
					currentDraft &&
					(currentDraft.status === 'draft' ||
						currentDraft.status === 'resubmission_required') ? (
						<Button
							onClick={toggleConfirmMode}
							variant='contained'
							color='success'
							size='small'
							sx={{ ml: 1 }}
						>
							{t('submitAgree')}
						</Button>
					) : null}
				</>
			)}
		</Box>
	)
	const creditMap = {
		JDU: student.japanese_employment_credits,
		'University of World Languages': student.world_language_university_credits,
		[String(student.partner_university)]: student.partner_university_credits,
	}
	return (
		<Box mb={2}>
			{/* ✅ Portal container mavjudligini tekshirish */}
			{portalContainer && role === 'Student' ? (
				createPortal(portalContent, portalContainer)
			) : (
				<></>
			)}

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
				{['selfIntroduction', 'skill', 'deliverables', 'credits', 'qa'].map(
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
					/>
					{/* New Design for Hobbies and Special Skills */}
					<div style={{ display: 'flex', gap: 25, marginTop: 25 }}>
						{/* Hobbies Section */}
						<div
							style={{
								flex: 1,
								backgroundColor: '#ffffff',
								padding: 20,
								borderRadius: 10,
								border: '1px solid #e1e1e1',
							}}
						>
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
								backgroundColor: '#ffffff',
								padding: 20,
								borderRadius: 10,
								border: '1px solid #e1e1e1',
							}}
						>
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
						/>
						<div className={styles.skillBox}>
							<div
								style={{
									fontSize: 20,
									fontWeight: 600,
									display: 'flex',
									alignItems: 'center',
									gap: 8,
								}}
							>
								<WorkspacePremiumOutlinedIcon sx={{ color: '#5627DB' }} />
								{t('qualification')}
							</div>
							<div style={{ marginBlock: 30 }}>
								<div style={{ height: 36 }}>
									JLPT:
									{editMode ? (
										<input
											type='text'
											value={
												editData.draft.jlpt ||
												getJLPTData(student.jlpt).highest ||
												''
											}
											onChange={e =>
												handleUpdateEditData('jlpt', e.target.value)
											}
											style={{
												marginLeft: 8,
												padding: '8px 15px',
												fontSize: 14,
												border: '1px solid #e0e0e0',
												borderRadius: 6,
												width: 120,
											}}
										/>
									) : (
										<span
											style={{
												margin: '0px 10px',
												padding: '2px 20px',
												fontWeight: 500,
												fontSize: 14,
												border: '1px solid #e0e0e0',
												borderRadius: 6,
											}}
										>
											{editData.draft.jlpt || getJLPTData(student.jlpt).highest}
										</span>
									)}
								</div>
								<div style={{ height: 36 }}>
									{t('jdu_certification')}:{' '}
									{editMode ? (
										<input
											type='text'
											value={
												editData.draft.jdu_japanese_certification ||
												getJLPTData(student.jdu_japanese_certification)
													.highest ||
												''
											}
											onChange={e =>
												handleUpdateEditData(
													'jdu_japanese_certification',
													e.target.value
												)
											}
											style={{
												marginLeft: 8,
												padding: '8px 15px',
												fontSize: 14,
												border: '1px solid #e0e0e0',
												borderRadius: 6,
												width: 120,
											}}
										/>
									) : (
										<span
											style={{
												margin: '0px 10px',
												padding: '2px 20px',
												fontWeight: 500,
												fontSize: 14,
												border: '1px solid #e0e0e0',
												borderRadius: 6,
											}}
										>
											{editData.draft.jdu_japanese_certification ||
												getJLPTData(student.jdu_japanese_certification).highest}
										</span>
									)}
								</div>
							</div>
						</div>

						<SkillSelector
							title={t('otherSkills')}
							headers={{
								上級: '3年間以上',
								中級: '1年間〜1年間半',
								初級: '基礎',
							}}
							data={student.draft}
							editMode={editMode}
							editData={editData}
							updateEditData={handleUpdateEditData}
							showAutocomplete={false}
							showHeaders={false}
							keyName='skills'
							parentKey='draft'
							icon={<ExtensionOutlinedIcon sx={{ color: '#5627DB' }} />}
						/>
						<div className={styles.skillBox}>
							<div
								style={{
									fontSize: 20,
									fontWeight: 600,
									display: 'flex',
									alignItems: 'center',
									gap: 8,
								}}
							>
								<ExtensionOutlinedIcon sx={{ color: '#5627DB' }} />
								{t('otherSkills')}
							</div>
							<div style={{ marginBlock: 30 }}>
								<div style={{ height: 36 }}>
									{t('japaneseSpeechContest')}:
									{editMode ? (
										<input
											type='text'
											value={
												editData.draft.japanese_speech_contest ||
												getCertificateData(student.japanese_speech_contest)
													.highest ||
												''
											}
											onChange={e =>
												handleUpdateEditData(
													'japanese_speech_contest',
													e.target.value
												)
											}
											style={{
												marginLeft: 8,
												padding: '8px 15px',
												fontSize: 14,
												border: '1px solid #e0e0e0',
												borderRadius: 6,
												width: 120,
											}}
										/>
									) : (
										<span
											style={{
												margin: '0px 10px',
												padding: '2px 20px',
												fontWeight: 500,
												fontSize: 14,
												border: '1px solid #e0e0e0',
												borderRadius: 6,
											}}
										>
											{editData.draft.japanese_speech_contest ||
												getCertificateData(student.japanese_speech_contest)
													.highest}
										</span>
									)}
								</div>
								<div>
									{t('itContest')}:
									{editMode ? (
										<input
											type='text'
											value={
												editData.draft.it_contest ||
												getCertificateData(student.it_contest).highest ||
												''
											}
											onChange={e =>
												handleUpdateEditData('it_contest', e.target.value)
											}
											style={{
												marginLeft: 8,
												padding: '8px 15px',
												fontSize: 14,
												border: '1px solid #e0e0e0',
												borderRadius: 6,
												width: 120,
											}}
										/>
									) : (
										<span
											style={{
												margin: '0px 10px',
												padding: '2px 20px',
												fontWeight: 500,
												fontSize: 14,
												border: '1px solid #e0e0e0',
												borderRadius: 6,
											}}
										>
											{editData.draft.it_contest ||
												getCertificateData(student.it_contest).highest}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>

					<Box sx={{ my: 2, backgroundColor: '#FFFFFF', padding: 3 }}>
						<div
							style={{
								fontSize: 20,
								fontWeight: 600,
								display: 'flex',
								alignItems: 'center',
								gap: 8,
							}}
						>
							<TranslateIcon sx={{ color: '#5627DB' }} /> {t('languageSkills')}
						</div>
						<div>
							<div
								style={{
									marginTop: 10,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
								}}
							>
								<div>{t('japanese')}</div>
								<div>
									{{
										N5: '20%',
										N4: '40%',
										N3: '60%',
										N2: '80%',
										N1: '100%',
									}[student.draft.jlpt || getJLPTData(student.jlpt).highest] ||
										'0%'}
								</div>
							</div>
							<div
								style={{
									width: '100%',
									height: 10,
									backgroundColor: '#e6dffa',
									borderRadius: 10,
									marginTop: 5,
								}}
							>
								<div
									style={{
										backgroundColor: '#5627db',
										borderRadius: 10,
										height: 10,
										width:
											{
												N5: '20%',
												N4: '40%',
												N3: '60%',
												N2: '80%',
												N1: '100%',
											}[
												student.draft.jlpt || getJLPTData(student.jlpt).highest
											] || '0%',
									}}
								></div>
							</div>
						</div>
					</Box>
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
					/>
				</Box>
			)}
			{/* QA */}
			{subTabIndex === 3 && (
				<Box my={2} backgroundColor={'#FFFFFF'} padding={3}>
					<div style={{ display: 'flex', gap: 10 }}>
						{[
							'JDU',
							String(student.partner_university),
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
							/124
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
			{subTabIndex === 4 && (
				<Box my={2}>
					<QA
						updateQA={updateQA}
						data={editData.draft.qa}
						currentDraft={currentDraft}
						handleQAUpdate={handleQAUpdate}
						isFromTopPage={true}
						topEditMode={editMode}
						handleDraftUpsert={handleDraftUpsert}
						isHonban={currentDraft && currentDraft.status === 'approved'}
						setTopEditMode={setTopEditMode}
						updateCurrentDraft={updateCurrentDraft} // Pass the callback function
					/>
				</Box>
			)}
			<ProfileConfirmDialog
				open={confirmMode}
				onClose={toggleConfirmMode}
				onConfirm={handleSubmitDraft}
			/>
		</Box>
	)
}

export default Top
