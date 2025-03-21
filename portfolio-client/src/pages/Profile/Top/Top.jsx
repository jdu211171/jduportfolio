import React, { useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import ReactDOM from 'react-dom'
import axios from '../../../utils/axiosUtils'
import { Box, Tabs, Tab, Button, Chip } from '@mui/material'
import Gallery from '../../../components/Gallery'
import TextField from '../../../components/TextField/TextField'
import SkillSelector from '../../../components/SkillSelector/SkillSelector'
import Deliverables from '../../../components/Deliverables/Deliverables'
import QA from '../../../pages/Profile/QA/QA'
import { useAlert } from '../../../contexts/AlertContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import translations from '../../../locales/translations'
import styles from './Top.module.css'
import ProfileConfirmDialog from '../../../components/Dialogs/ProfileConfirmDialog'

const Top = () => {
	let id
	const role = sessionStorage.getItem('role')
	const { studentId } = useParams()
	const location = useLocation()
	const { userId } = location.state || {}
	const statedata = location.state?.student
	const { language } = useLanguage()
	const showAlert = useAlert()

	// Translation helper
	const t = key => translations[language][key] || key

	// Determine which ID to use
	if (userId !== 0 && userId) {
		id = userId
	} else {
		id = studentId
	}

	// ---------------------
	// Component state
	// ---------------------
	const [student, setStudent] = useState(null)
	const [editData, setEditData] = useState({})
	const [editMode, setEditMode] = useState(false)
	const [isChecking, setIsChecking] = useState(false)
	const [currentDraft, setCurrentDraft] = useState({})
	const [updateQA, SetUpdateQA] = useState(true)
	const [newImages, setNewImages] = useState([])
	const [deletedUrls, setDeletedUrls] = useState([])
	const [deliverableImages, setDeliverableImages] = useState({})
	const [subTabIndex, setSubTabIndex] = useState(0)
	const [hasDraft, setHasDraft] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [confirmMode, setConfirmMode] = useState(false)

	// ---------------------
	// Fetch data
	// ---------------------
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true)
			try {
				if (statedata) {
					// If data was passed via navigation state
					handleStateData()
				} else {
					// For Student role, always show draft data
					if (role === 'Student') {
						await fetchDraftData()
					} else {
						// For other roles, show the data based on the student ID
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, role])

	// Handle data from navigation state
	const handleStateData = () => {
		if (statedata.draft) {
			setDraft(statedata.draft)
			if (
				statedata.draft.status === 'checking' ||
				statedata.draft.status === 'approved'
			) {
				setIsChecking(true)
			} else {
				setIsChecking(false)
			}

			// Map student data from state
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

	// Fetch draft data directly (for Student role)
	const fetchDraftData = async () => {
		try {
			// Get student ID from context or navigation
			const studentIdToUse =
				role === 'Student' ? getStudentIdFromLoginUser() : id

			if (!studentIdToUse) {
				showAlert('Unable to determine student ID', 'error')
				return
			}

			// Fetch student with draft data
			const response = await axios.get(`/api/draft/student/${studentIdToUse}`)

			if (response.data) {
				// Extract student and draft data
				const studentData = { ...response.data }
				const draftData = studentData.draft
				delete studentData.draft

				// Set current draft
				if (draftData) {
					setCurrentDraft(draftData)
					setHasDraft(true)

					if (
						draftData.status === 'checking' ||
						draftData.status === 'approved'
					) {
						setIsChecking(true)
					}
				}

				// Structure data for component state
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

	// Get student ID from login user data
	const getStudentIdFromLoginUser = () => {
		try {
			const loginUserData = JSON.parse(sessionStorage.getItem('loginUser'))
			return loginUserData?.studentId
		} catch (e) {
			console.error('Error parsing login user data:', e)
			return null
		}
	}

	// Fetch student data (for non-Student roles)
	const fetchStudentData = async () => {
		try {
			const response = await axios.get(`/api/students/${id}`)
			const mappedData = mapData(response.data)
			setStudent(mappedData)
			setEditData(mappedData)
			SetUpdateQA(!updateQA)

			// Also fetch draft data
			await fetchDraft()
		} catch (error) {
			console.error('Error fetching student data:', error)
			showAlert('Error fetching student data', 'error')
		}
	}

	// Fetch draft separately (for non-Student roles)
	const fetchDraft = async () => {
		try {
			const studentIdToUse = id
			const response = await axios.get(`/api/draft/student/${studentIdToUse}`)

			if (response.data && response.data.draft) {
				setHasDraft(true)
				const draft = response.data.draft

				if (draft.status === 'checking' || draft.status === 'approved') {
					setIsChecking(true)
				} else {
					setIsChecking(false)
				}

				setCurrentDraft(draft)
			} else {
				setHasDraft(false)
			}
		} catch (error) {
			console.error('Error fetching draft:', error)
			setHasDraft(false)
		}
	}

	// Function to structure incoming data into "draft"
	const mapData = data => {
		const draftKeys = [
			'deliverables',
			'gallery',
			'self_introduction',
			'hobbies',
			'other_information',
			'it_skills',
			'skills',
		]
		return {
			...data,
			draft: draftKeys.reduce((acc, key) => {
				acc[key] = data[key] || ''
				return acc
			}, {}),
		}
	}

	// Submit draft
	const handleSubmitDraft = async () => {
		try {
			if (currentDraft && currentDraft.id) {
				const response = await axios.put(
					`/api/draft/${currentDraft.id}/submit`,
					{}
				)
				if (response.status === 200) {
					showAlert(t('draftSubmittedSuccessfully'), 'success')
					// Update current draft with new status
					setCurrentDraft({
						...currentDraft,
						status: 'submitted',
						submit_count: (currentDraft.submit_count || 0) + 1,
					})
					// Refresh data
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
			setIsChecking(true)
		}
	}

	// ---------------------
	// Edit data update
	// ---------------------
	const handleUpdateEditData = (key, value) => {
		setEditData(prevEditData => ({
			...prevEditData,
			draft: {
				...prevEditData.draft,
				[key]: value,
			},
		}))
	}

	// ---------------------
	// Edit data update
	// ---------------------
	const handleQAUpdate = value => {
		setEditData(prevEditData => {
			const updatedEditData = {
				...prevEditData,
				draft: {
					...prevEditData.draft, // Preserve existing draft data
					qa: value, // Save inside `qa` within `draft`
				},
			}
			setStudent(updatedEditData)
			return updatedEditData
		})
	}

	// ---------------------
	// Gallery updates
	// ---------------------
	const handleGalleryUpdate = (
		files,
		isNewFiles = false,
		isDelete = false,
		parentKey = null
	) => {
		if (isNewFiles && !isDelete) {
			// Add new images
			const newFiles = Array.from(files)
			setNewImages(prevImages => [...prevImages, ...newFiles])
		} else if (isDelete) {
			// Deleting an image
			if (isNewFiles) {
				// If we're deleting from the newImages array
				setNewImages(prevImages => prevImages.filter((_, i) => i !== files))
			} else {
				// If we're deleting from existing images
				const oldFiles = parentKey
					? [...editData[parentKey].gallery]
					: [...editData.draft.gallery]
				deletedUrls.push(oldFiles[files])
				oldFiles.splice(files, 1)
				if (parentKey) {
					handleUpdateEditData('gallery', oldFiles)
				} else {
					handleUpdateEditData('gallery', oldFiles)
				}
			}
		}
	}

	// Handle each deliverable image
	const handleImageUpload = (activeDeliverable, file) => {
		setDeliverableImages(prevImages => ({
			...prevImages,
			[activeDeliverable]: file,
		}))
	}

	// ---------------------
	// Toggle states
	// ---------------------
	const toggleEditMode = () => setEditMode(prev => !prev)

	// ---------------------
	// Save / Draft Handlers
	// ---------------------
	const handleSave = async () => {
		try {
			const formData = new FormData()
			newImages.forEach((file, index) => {
				formData.append(`files[${index}]`, file)
			})
			formData.append('role', role)
			formData.append('imageType', 'Gallery')
			formData.append('id', id)
			deletedUrls.forEach((url, index) => {
				formData.append(`oldFilePath[${index}]`, url)
			})

			// Upload new/deleted images
			const fileResponse = await axios.post('/api/files/upload', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			let oldFiles = editData.draft.gallery

			// If multiple files
			if (Array.isArray(fileResponse.data)) {
				fileResponse.data.forEach(file => {
					oldFiles.push(file.Location)
				})
			}
			// If only one file
			else if (fileResponse.data.Location) {
				oldFiles.push(fileResponse.data.Location)
			}

			await handleUpdateEditData('gallery', oldFiles)

			// Handle deliverable images
			for (const [index, file] of Object.entries(deliverableImages)) {
				if (file) {
					const deliverableFormData = new FormData()
					deliverableFormData.append('role', role)
					deliverableFormData.append('file', file)
					deliverableFormData.append('imageType', 'Deliverable')
					deliverableFormData.append('id', id)
					deliverableFormData.append(
						'oldFilePath',
						editData.draft.deliverables[index]?.imageLink || ''
					)
					const deliverableFileResponse = await axios.post(
						'/api/files/upload',
						deliverableFormData,
						{ headers: { 'Content-Type': 'multipart/form-data' } }
					)
					const deliverableImageLink = deliverableFileResponse.data.Location
					// Update the deliverable's imageLink
					editData.draft.deliverables[index].imageLink = deliverableImageLink
				}
			}

			// Finally, update student data
			await axios.put(`/api/students/${id}`, editData)

			// Reset states
			setStudent(editData)
			setNewImages([])
			setDeletedUrls([])
			setEditMode(false)
			showAlert(t('changesSavedSuccessfully'), 'success')
		} catch (error) {
			console.error('Error saving student data:', error)
			showAlert(t('errorSavingChanges'), 'error')
		}
	}

	const handleDraftUpsert = async () => {
		try {
			const formData = new FormData()
			newImages.forEach((file, index) => {
				formData.append(`files[${index}]`, file)
			})
			formData.append('role', role)
			formData.append('imageType', 'Gallery')
			formData.append('id', id)
			deletedUrls.forEach((url, index) => {
				formData.append(`oldFilePath[${index}]`, url)
			})

			// Upload new/deleted images
			const fileResponse = await axios.post('/api/files/upload', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			let oldFiles = editData.draft.gallery || []
			if (Array.isArray(fileResponse.data)) {
				fileResponse.data.forEach(file => {
					oldFiles.push(file.Location)
				})
			} else if (fileResponse.data.Location) {
				oldFiles.push(fileResponse.data.Location)
			}
			await handleUpdateEditData('gallery', oldFiles)

			// Handle deliverable images
			for (const [index, file] of Object.entries(deliverableImages)) {
				if (file) {
					const deliverableFormData = new FormData()
					deliverableFormData.append('role', role)
					deliverableFormData.append('file', file)
					deliverableFormData.append('imageType', 'Deliverable')
					deliverableFormData.append('id', id)
					deliverableFormData.append(
						'oldFilePath',
						editData.draft.deliverables[index]?.imageLink || ''
					)
					const deliverableFileResponse = await axios.post(
						'/api/files/upload',
						deliverableFormData,
						{ headers: { 'Content-Type': 'multipart/form-data' } }
					)
					const deliverableImageLink = deliverableFileResponse.data.Location
					editData.draft.deliverables[index].imageLink = deliverableImageLink
				}
			}

			// Determine correct student_id to use
			const studentIdToUse = student.student_id || id

			const draftData = {
				student_id: studentIdToUse,
				profile_data: editData.draft,
				status: 'draft',
				submit_count: currentDraft.submit_count || 0,
			}

			// Create or update draft - the backend will handle whether to create new or update existing
			const res = await axios.post(`/api/draft`, draftData)
			setCurrentDraft(res.data.draft)
			setHasDraft(true)

			// Reset
			setStudent(editData)
			setNewImages([])
			setDeletedUrls([])
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
	const handleConfirmProfile = async () => {
		try {
			// Example final confirmation logic:
			const res = await axios.put(`/api/draft/${currentDraft.id}/submit`)
			if (res.status == 200) {
				showAlert(t['profileConfirmed'], 'success')
			}
		} catch (error) {
			showAlert(t['errorConfirmingProfile'], 'error')
		} finally {
			// Always close the dialog
			setConfirmMode(false)
		}
	}

	// Cancel editing
	const handleCancel = () => {
		setEditData(student)
		setEditMode(false)
	}

	// ---------------------
	// Tab handling
	// ---------------------
	const handleSubTabChange = (event, newIndex) => {
		setSubTabIndex(newIndex)
	}

	if (isLoading) {
		return <div>{t('loading')}</div>
	}

	if (!student) {
		return <div>{t('noDataFound')}</div>
	}

	// ---------------------
	// Button Portal Content
	// ---------------------
	const portalContent = (
		<Box className={styles.buttonsContainer}>
			{role === 'Student' && (
				<>
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
								onClick={toggleEditMode}
								variant='contained'
								color='primary'
								size='small'
							>
								{t('editProfile')}
							</Button>

							{/* Show Submit button when draft exists and status is "draft" */}
							{hasDraft && currentDraft && currentDraft.status === 'draft' && (
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
				</>
			)}
		</Box>
	)

	return (
		<Box my={2}>
			<>
				{subTabIndex !== 2 &&
					ReactDOM.createPortal(
						portalContent,
						document.getElementById('saveButton')
					)}
			</>
			<Box className={styles.TabsContainer}>
				<Tabs
					className={styles.Tabs}
					value={subTabIndex}
					onChange={handleSubTabChange}
				>
					<Tab label={t('selfIntroduction')} />
					<Tab label={t('deliverables')} />
					<Tab label={t('qa')} />
				</Tabs>

				{role === 'Student' && hasDraft && currentDraft && (
					<Box sx={{ display: 'flex', gap: 1 }}>
						<Chip
							label={
								currentDraft.status === 'submitted'
									? t('submitted')
									: currentDraft.status === 'approved'
										? t('approved')
										: currentDraft.status === 'disapproved'
											? t('disapproved')
											: currentDraft.status === 'resubmission_required'
												? t('resubmission_required')
												: t('draft')
							}
							size='small'
							color={
								currentDraft.status === 'submitted'
									? 'primary'
									: currentDraft.status === 'approved'
										? 'success'
										: currentDraft.status === 'disapproved'
											? 'error'
											: currentDraft.status === 'resubmission_required'
												? 'warning'
												: 'default'
							}
							variant='outlined'
						/>
					</Box>
				)}
			</Box>

			{role === 'Staff' && !isChecking && currentDraft && currentDraft.id && (
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
			)}

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
					/>
					<Gallery
						galleryUrls={editData}
						newImages={newImages}
						deletedUrls={deletedUrls}
						editMode={editMode}
						updateEditData={handleGalleryUpdate}
						keyName='gallery'
						parentKey='draft'
					/>
					<TextField
						title={t('hobbies')}
						data={student.draft.hobbies}
						editData={editData}
						editMode={editMode}
						updateEditData={handleUpdateEditData}
						keyName='hobbies'
						parentKey='draft'
					/>
					<TextField
						title={t('specialSkills')}
						data={student.draft.other_information}
						editData={editData}
						editMode={editMode}
						updateEditData={handleUpdateEditData}
						keyName='other_information'
						parentKey='draft'
					/>
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
						showHeaders={true}
						keyName='it_skills'
						parentKey='draft'
					/>
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
					/>
				</Box>
			)}

			{subTabIndex === 1 && (
				<Box my={2}>
					<Deliverables
						data={student.draft.deliverables}
						editMode={editMode}
						editData={editData.draft.deliverables}
						updateEditData={handleUpdateEditData}
						onImageUpload={handleImageUpload}
						keyName='deliverables'
					/>
				</Box>
			)}

			{subTabIndex === 2 && (
				<Box my={2}>
					<QA
						updateQA={updateQA}
						data={editData.draft.qa}
						currentDraft={currentDraft}
						handleQAUpdate={handleQAUpdate}
						isFromTopPage={true}
						topEditMode={editMode}
						handleDraftUpsert={handleDraftUpsert}
						isHonban={true}
						setTopEditMode={setTopEditMode}
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
