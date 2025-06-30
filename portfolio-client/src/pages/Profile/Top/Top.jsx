import { useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { createPortal } from 'react-dom' // ReactDOM.createPortal o'rniga
import axios from '../../../utils/axiosUtils'
import { Box, Button } from '@mui/material'
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
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import FavoriteBorderTwoToneIcon from '@mui/icons-material/FavoriteBorderTwoTone'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'
import { TrendingUp } from '@mui/icons-material'
import PermIdentityIcon from '@mui/icons-material/PermIdentity'
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import CodeIcon from '@mui/icons-material/Code'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined'
import TranslateIcon from '@mui/icons-material/Translate'

const qaQuestions = [
	{
		icon: SchoolOutlinedIcon,
		label: '学生成績',
		iconColor: '#3275f2',
	},
	{
		icon: AutoStoriesOutlinedIcon,
		label: '専門知識',
		iconColor: '#a551f5',
	},
	{
		icon: PermIdentityIcon,
		label: '個性',
		iconColor: '#0dae7a',
	},
	{
		icon: WorkOutlineOutlinedIcon,
		label: '実務経験',
		iconColor: '#5b59ec',
	},
	{
		icon: TrendingUp,
		label: 'キャリア目標',
		iconColor: '#e63c8c',
	},
]

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

	if (userId !== 0 && userId) {
		id = userId
	} else {
		id = studentId
	}
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
				setIsChecking(true)
			} else {
				setIsChecking(false)
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
						setIsChecking(true)
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
			const mappedData = mapData(studentData)
			setStudent(mappedData)
			setEditData(mappedData)
			SetUpdateQA(!updateQA)

			await fetchDraft(studentData)
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
					setIsChecking(true)
				} else {
					setIsChecking(false)
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
		]
		return {
			...data,
			draft: draftKeys.reduce((acc, key) => {
				acc[key] = data[key] || ''
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
			setIsChecking(true)
		}
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

	const handleGalleryUpdate = (
		files,
		isNewFiles = false,
		isDelete = false,
		parentKey = null
	) => {
		if (isNewFiles && !isDelete) {
			const newFiles = Array.from(files)
			setNewImages(prevImages => [...prevImages, ...newFiles])
		} else if (isDelete) {
			if (isNewFiles) {
				setNewImages(prevImages => prevImages.filter((_, i) => i !== files))
			} else {
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

	const handleImageUpload = (activeDeliverable, file) => {
		setDeliverableImages(prevImages => ({
			...prevImages,
			[activeDeliverable]: file,
		}))
	}

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

			const fileResponse = await axios.post('/api/files/upload', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			let oldFiles = editData.draft.gallery

			if (Array.isArray(fileResponse.data)) {
				fileResponse.data.forEach(file => {
					oldFiles.push(file.Location)
				})
			} else if (fileResponse.data.Location) {
				oldFiles.push(fileResponse.data.Location)
			}

			await handleUpdateEditData('gallery', oldFiles)

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

			await axios.put(`/api/students/${id}`, editData)

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

			const studentIdToUse = student.student_id || id

			const draftData = {
				student_id: studentIdToUse,
				profile_data: editData.draft,
				status: 'draft',
				submit_count: currentDraft.submit_count || 0,
			}

			const res = await axios.post(`/api/draft`, draftData)
			setCurrentDraft(res.data.draft)
			setHasDraft(true)

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
			const res = await axios.put(`/api/draft/${currentDraft.id}/submit`)
			if (res.status == 200) {
				showAlert(t['profileConfirmed'], 'success')
			}
		} catch (error) {
			showAlert(t['errorConfirmingProfile'], 'error')
		} finally {
			setConfirmMode(false)
		}
	}

	const handleCancel = () => {
		setEditData(student)
		setEditMode(false)
	}

	const handleSubTabChange = (event, newIndex) => {
		setSubTabIndex(newIndex)
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

					{hasDraft && currentDraft && currentDraft.status === 'draft' ? (
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

	return (
		<Box my={2}>
			{/* ✅ Portal container mavjudligini tekshirish */}
			{subTabIndex !== 2 && portalContainer && role === 'Student'
				? createPortal(portalContent, portalContainer)
				: null}

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'start',
					padding: '10px 16px',
					gap: 32,
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

			{role === 'Staff' && !isLoading && currentDraft && currentDraft.id ? (
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
					<div style={{ display: 'flex', gap: 25 }}>
						<TextField
							title={t('hobbies')}
							data={student.draft.hobbies}
							editData={editData}
							editMode={editMode}
							updateEditData={handleUpdateEditData}
							keyName='hobbies'
							parentKey='draft'
							icon={FavoriteBorderTwoToneIcon}
							details={['SF映画', '卓球']}
						/>
						<TextField
							title={t('specialSkills')}
							data={student.draft.other_information || ''}
							editData={editData}
							editMode={editMode}
							updateEditData={handleUpdateEditData}
							keyName='other_information'
							parentKey='draft'
							icon={ElectricBoltIcon}
							details={['Webデザイン', 'UX/UI設計']}
						/>
					</div>
					<div style={{ display: 'flex', gap: 25 }}>
						<TextField
							title={t('origin')}
							data={'ウズベキスタン'}
							editData={editData}
							editMode={editMode}
							updateEditData={handleUpdateEditData}
							keyName='hobbies'
							parentKey='draft'
							icon={LocationOnOutlinedIcon}
						/>
						<TextField
							title={t('major')}
							data={'ITマネジメント'}
							editData={editData}
							editMode={editMode}
							updateEditData={handleUpdateEditData}
							keyName='hobbies'
							parentKey='draft'
							icon={SchoolOutlinedIcon}
						/>
						<TextField
							title={t('jobType')}
							data={'UX/UIデザイナー'}
							editData={editData}
							editMode={editMode}
							updateEditData={handleUpdateEditData}
							keyName='hobbies'
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
						<div style={{ marginBlock: 30 }}>
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
										なし
									</span>
								</div>
								<div style={{ height: 36 }}>
									{t('jdu_certification')}:{' '}
									{editMode ? (
										<input
											type='text'
											defaultValue={getJLPTData(student.jlpt).highest || ''}
											onChange={e =>
												handleUpdateEditData('jlpt', e.target.value)
											}
											style={{
												marginLeft: 8,
												padding: '2px 8px',
												fontSize: 14,
												border: '1px solid #e0e0e0',
												borderRadius: 6,
												width: 120,
											}}
										/>
									) : (
										getJLPTData(student.jlpt).highest
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
						<div style={{ marginBlock: 30 }}>
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
										なし
									</span>
								</div>
								<div>
									{t('itContest')}:
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
										なし
									</span>
								</div>
							</div>
						</div>
					</div>

					<div>
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
									}[getJLPTData(student.jlpt).highest] || '0%'}
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
											}[getJLPTData(student.jlpt).highest] || '0%',
									}}
								></div>
							</div>
						</div>
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
					/>
				</Box>
			)}
			{/* QA */}
			{subTabIndex === 3 && (
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
