/*
TODO: Student Resubmission and Staff Workflow Fixes
- [x] Fixed submit button logic: Students can now resubmit after rejection (承認依頼・同意 button appears)
- [x] Fixed start_checking button: Only appears for initial submission, disappears after clicking
- [x] Fixed TextField keyName conflicts: major and job_type fields now use proper unique keyNames
- [x] Added callback mechanism: QA component now updates parent currentDraft state
- [x] Simplified submit button condition: Focus on draft/resubmission_required status
- [x] Fixed handleConfirmProfile: Now updates parent currentDraft state to 'submitted' when student submits
- [x] Added passedDraft synchronization: passedDraft state now stays in sync with currentDraft changes
- [x] Added debug logging to track state changes and button visibility conditions
- [x] FIXED: Submit button visibility issue in Top.jsx - added resubmission_required status condition
- [x] FIXED: Comment input clearing - comment field now clears after staff approval/rejection
- [x] Test and verify submit button appears correctly after rejection
- [x] Verify IT skills section design is properly restored
- [x] FIXED: Profile visibility toggle 404 errors - improved ID determination logic to prioritize student_id over primary key
*/

import { useState, useEffect, useContext } from 'react'
import ReactDOM from 'react-dom'
import { useLocation, useParams } from 'react-router-dom'
import styles from './QA.module.css'
import QATextField from '../../../components/QATextField/QATextField'
import QAAccordion from '../../../components/QAAccordion/QAAccordion'
import TextField from '../../../components/TextField/TextField'
import ProfileConfirmDialog from '../../../components/Dialogs/ProfileConfirmDialog'

import {
	// School,
	// AutoStories,
	// Face,
	// WorkHistory,
	TrendingUp,
} from '@mui/icons-material'
import axios from '../../../utils/axiosUtils'
import {
	Box,
	// Tabs,
	// Tab,
	Button,
	Snackbar,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	// IconButton,
} from '@mui/material'

import translations from '../../../locales/translations'
import { UserContext } from '../../../contexts/UserContext'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import PermIdentityIcon from '@mui/icons-material/PermIdentity'
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined'

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
const QA = ({
	data = {},
	handleQAUpdate,
	isFromTopPage = false,
	topEditMode = false,
	updateQA = false,
	currentDraft,
	isHonban = false,
	handleDraftUpsert = () => {},
	setTopEditMode = () => {},
	updateCurrentDraft = () => {},
}) => {
	const role = sessionStorage.getItem('role')
	const labels = ['学生成績', '専門知識', '個性', '実務経験', 'キャリア目標']
	let id
	const { studentId } = useParams()
	const location = useLocation()
	const { userId } = location.state || {}

	const { language, activeUser } = useContext(UserContext)
	const t = translations[language] || translations.en

	// Helper function to get student_id from login user data
	const getStudentIdFromLoginUser = () => {
		try {
			const loginUserData = JSON.parse(sessionStorage.getItem('loginUser'))
			// Try different possible field names for student ID
			// Backend always returns studentId (camelCase), so check it first
			return (
				loginUserData?.studentId ||
				loginUserData?.student_id ||
				loginUserData?.id
			)
		} catch (e) {
			return null
		}
	}

	// Determine which student_id to use
	if (role === 'Student') {
		// For students, try multiple sources
		id = getStudentIdFromLoginUser() || activeUser?.studentId || activeUser?.id
	} else if (studentId) {
		// For staff/admin, prefer studentId from URL params (this should be student_id)
		id = studentId
	} else {
		// Fallback: try to get student data from location.state if available
		const student = location.state?.student
		if (student && student.student_id) {
			id = student.student_id
		} else if (userId !== 0 && userId) {
			// Last resort: use userId prop (might be primary key, could cause issues)
			id = userId
		} else {
			// Don't log error for Admin on QA management page
			if (!(role === 'Admin' && window.location.pathname === '/student-qa')) {
			}
			id = null
		}
	}

	const [studentQA, setStudentQA] = useState(
		isFromTopPage && data ? data : null
	)
	const [editData, setEditData] = useState(isFromTopPage && data ? data : null)
	const [editMode, setEditMode] = useState(topEditMode)
	const [isFirstTime, setIsFirstTime] = useState(false)
	const [isDataLoaded, setIsDataLoaded] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [deleteConfirmation, setDeleteConfirmation] = useState({ 
		open: false, 
		itemToDelete: null 
	})

	const [confirmMode, setConfirmMode] = useState(false)
	const [comment, setComment] = useState({ comments: '' })
	const [reviewMode, setReviewMode] = useState(
		!currentDraft || Object.keys(currentDraft).length === 0
	)
	const [passedDraft, setPassedDraft] = useState(currentDraft)

	// Debug logging to track state changes

	// Check submit button visibility condition
	const shouldShowSubmitButton =
		role === 'Student' &&
		currentDraft &&
		(currentDraft.status === 'draft' ||
			currentDraft.status === 'resubmission_required')

	// Keep passedDraft synchronized with currentDraft changes
	useEffect(() => {
		setPassedDraft(currentDraft)
	}, [currentDraft])

	const fetchStudent = async () => {
		
		// Prevent fetching if already loaded (only for non-student roles)
		if (isDataLoaded && role !== 'Student') return

		try {
			// Always fetch questions to get the latest admin-added questions
			const questionsResponse = await axios.get('/api/settings/studentQA')
			const questions = JSON.parse(questionsResponse.data.value)

			let answers = null
			
			// For Top page, use provided data as answers
			if (isFromTopPage && data && Object.keys(data).length > 0) {
				answers = data
			} else if (id) {
				// Otherwise fetch answers from API
				try {
					answers = (await axios.get(`/api/qa/student/${id}`)).data
				} catch (err) {
				}
			}

			let response
			if (id && answers) {
				// Student view with answers
				const combinedData = {}
				// Check if this is first time or has idList
				let firsttime = !answers.idList || Object.keys(answers.idList || {}).length === 0
				if (firsttime) {
					setIsFirstTime(true)
				}
				
				// Add idList if missing (for Top page data)
				if (!answers.idList) {
					answers.idList = {}
				}
				
				for (const category in questions) {
					if (category == 'idList') {
						combinedData[category] = answers[category] || {}
					} else {
						combinedData[category] = {}
						for (const key in questions[category]) {
							combinedData[category][key] = {
								question: questions[category][key].question || '',
								answer: !answers[category] || !answers[category][key]
									? ''
									: answers[category][key].answer || '',
							}
						}
					}
				}
				response = combinedData
			} else if (id) {
				// Student view without answers (first time)
				response = { ...questions, idList: {} }
				setIsFirstTime(true)
			} else {
				// Admin view - just questions, no answers needed
				response = questions
			}

			setStudentQA(response)
			setEditData(response)
			setIsDataLoaded(true)
		} catch (error) {
			// Initialize with empty structure on error
			setStudentQA({ idList: {} })
			setEditData({ idList: {} })
			setIsDataLoaded(true)
		}
	}

	useEffect(() => {
		if (role && (id || role === 'Admin')) {
			// Always fetch for students to get latest admin questions
			if (role === 'Student') {
				fetchStudent()
			} else {
				// For other roles, only fetch if not loaded
				if (!isDataLoaded) {
					fetchStudent()
				}
			}
		}
	}, [role, id, isFromTopPage])

	// Reset data loaded flag when updateQA changes
	useEffect(() => {
		if (updateQA) {
			setIsDataLoaded(false)
		}
	}, [updateQA])

	useEffect(() => {
		if (isFromTopPage && data && Object.keys(data).length > 0) {
			setEditData(data)
		}
	}, [updateQA])

	useEffect(() => {
		setEditMode(topEditMode)
	}, [topEditMode])

	const handleUpdate = (category, keyName, value, qa) => {
		setEditData(prevEditData => {
			const updatedEditData = { ...prevEditData }
			if (updatedEditData[category]) {
				updatedEditData[category] = {
					...updatedEditData[category],
					[keyName]: {
						...updatedEditData[category][keyName],
						[qa]: value,
					},
				}
			}
			
			// If called from Top page, update parent with the latest data
			if (isFromTopPage && handleQAUpdate) {
				// Use the updated data, not the stale editData
				handleQAUpdate(updatedEditData)
			}
			
			return updatedEditData
		})
	}

	const updateComment = (key, value) => {
		setComment(() => ({
			[key]: value,
		}))
	}

	const toggleEditMode = () => {
		setEditMode(prev => !prev)
		setTopEditMode(!editMode)
	}
	const toggleConfirmMode = () => {
		setConfirmMode(prev => !prev)
	}

	const handleConfirmProfile = async () => {
		try {
			const res = await axios.put(`/api/draft/${currentDraft.id}/submit`)
			if (res.status == 200) {
				// Update parent's currentDraft state to 'submitted'
				updateCurrentDraft('submitted')
				showAlert(t['profileConfirmed'], 'success')
			}
		} catch (error) {
			// Backend'dan kelgan yangi xatolik xabarini handle qilamiz
			if (
				error.response?.data?.error?.includes(
					'allaqachon tekshiruvga yuborilgan'
				)
			) {
				showAlert(
					t['draftAlreadySubmitted'] ||
						"Avvalgi so'rovingiz hali ko'rib chiqilmagan. Yangisini yuborish uchun natijani kuting.",
					'warning'
				)
			} else {
				showAlert(t['errorConfirmingProfile'], 'error')
			}
		} finally {
			setConfirmMode(false)
		}
	}

	const approveProfile = async value => {
		try {

			const res = await axios.put(`/api/draft/status/${currentDraft.id}`, {
				status: value,
				comments: comment.comments,
			})


			// Update local draft status to reflect the change
			setPassedDraft(prevDraft => ({
				...prevDraft,
				status: value,
			}))
			// Update parent's currentDraft state
			updateCurrentDraft(value)
			// Clear comment input after successful submission
			setComment({ comments: '' })
			showAlert(t['profileConfirmed'], 'success')
		} catch (error) {
			showAlert(t['errorConfirmingProfile'], 'error')
		} finally {
			setConfirmMode(false)
		}
	}

	const setProfileVisible = async visibility => {
		try {
			const res = await axios.put(`/api/students/${id}`, {
				visibility: visibility,
			})
			showAlert(t['profileConfirmed'], 'success')
		} catch (error) {
			showAlert(t['errorConfirmingProfile'], 'error')
		} finally {
			setConfirmMode(false)
		}
	}

	const handleSave = async () => {
		if (isSaving) return // Prevent multiple simultaneous saves
		
		setIsSaving(true)
		try {

			if (role == 'Admin') {
				let questions = removeKey(editData, 'answer')

				const updatedValue = JSON.stringify(questions)

				await axios.put(`/api/settings/studentQA`, {
					value: updatedValue,
				})
				showAlert('Changes saved successfully!', 'success')
				setEditMode(false)
				setTopEditMode(false)
			} else {
				let answers = removeKey(editData, 'question')

				let res
				if (isFirstTime) {
					const requestData = { studentId: id, data: answers }

					res = await axios.post('/api/qa/', requestData)
				} else {
					const updateData = { data: answers }

					res = await axios.put(`/api/qa/${id}`, updateData)
				}

				// Update local state with server response
				setStudentQA(res.data)
				
				// Set isFirstTime to false after successful save
				if (isFirstTime && res.data.idList) {
					setIsFirstTime(false)
				}
				
				// Sync editData with the latest server data
				const updatedEditData = { ...editData }
				
				// Update editData with the response data
				Object.keys(res.data).forEach(category => {
					if (category !== 'idList') {
						updatedEditData[category] = res.data[category]
					}
				})
				if (res.data.idList) {
					updatedEditData.idList = res.data.idList
				}
				
				setEditData(updatedEditData)

				// If called from Top page, update parent component
				if (isFromTopPage && handleQAUpdate) {
					handleQAUpdate(res.data)
				}

				setEditMode(false)
				setTopEditMode(false)
			}

			showAlert('Changes saved successfully!', 'success')
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				"Q&A javoblarini saqlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
			showAlert(errorMessage, 'error')
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		try {
			// Reset to last known good state
			setEditData(studentQA)
			setEditMode(false)
			setTopEditMode(false)
			
			// If called from Top page, sync with parent
			if (isFromTopPage && handleQAUpdate) {
				handleQAUpdate(studentQA)
			}
			
			showAlert('Changes cancelled', 'info')
		} catch (error) {
			// Fallback: re-fetch from server
			fetchStudent()
			setEditMode(false)
			setTopEditMode(false)
		}
	}

	const handleAdd = async () => {
		let keys = Object.keys(getCategoryData(subTabIndex))
		if (keys.length === 0) {
			// Start from q1 if there are no existing questions
			await setEditData(prevEditData => {
				const updatedEditData = { ...prevEditData }
				const category = labels[subTabIndex]
				if (!updatedEditData[category]) {
					updatedEditData[category] = {}
				}
				updatedEditData[category]['q1'] = { question: '', answer: '' }
				return updatedEditData
			})
		} else {
			let lastKey = keys[keys.length - 1]
			let nextKeyNumber = parseInt(lastKey.slice(1)) + 1
			let nextKey = 'q' + nextKeyNumber

			await setEditData(prevEditData => {
				const updatedEditData = { ...prevEditData }
				const category = labels[subTabIndex]
				if (updatedEditData[category]) {
					updatedEditData[category] = {
						...updatedEditData[category],
						[nextKey]: {
							question: '',
							answer: '',
						},
					}
				}
				return updatedEditData
			})
		}
	}

	const showDeleteConfirmation = (indexToDelete) => {
		setDeleteConfirmation({
			open: true,
			itemToDelete: indexToDelete
		})
	}

	const handleDeleteConfirm = async () => {
		const indexToDelete = deleteConfirmation.itemToDelete
		setDeleteConfirmation({ open: false, itemToDelete: null })
		
		await handleDelete(indexToDelete)
	}

	const handleDeleteCancel = () => {
		setDeleteConfirmation({ open: false, itemToDelete: null })
	}

	const handleDelete = async indexToDelete => {
		try {
			
			// Optimistic update: immediately update local state
			setEditData(prevEditData => {
				const updatedEditData = { ...prevEditData }
				const category = labels[subTabIndex]

				if (
					updatedEditData[category] &&
					updatedEditData[category][indexToDelete]
				) {
					delete updatedEditData[category][indexToDelete]
				}

				return updatedEditData
			})

			// If called from Top page, update parent immediately
			if (isFromTopPage && handleQAUpdate) {
				const updatedData = { ...editData }
				const category = labels[subTabIndex]
				if (updatedData[category] && updatedData[category][indexToDelete]) {
					delete updatedData[category][indexToDelete]
				}
				handleQAUpdate(updatedData)
			}

			showAlert('Item deleted successfully!', 'success')
		} catch (error) {
			showAlert('Error deleting item. Please try again.', 'error')
			
			// Rollback optimistic update on error
			fetchStudent()
		}
	}

	const removeKey = (obj, excludeKey) => {
		const newObj = {}

		for (const key in obj) {
			if (key === 'idList') {
				newObj[key] = obj[key]
			} else if (typeof obj[key] === 'object' && obj[key] !== null) {
				newObj[key] = {}
				for (const subKey in obj[key]) {
					if (
						typeof obj[key][subKey] === 'object' &&
						obj[key][subKey] !== null
					) {
						const { [excludeKey]: _, ...rest } = obj[key][subKey]
						newObj[key][subKey] = rest
					}
				}
			} else {
				newObj[key] = obj[key]
			}
		}

		return newObj
	}

	// const combineQuestionsAndAnswers = (questions, answers) => {
	// 	const combinedData = {}
	// 	// Check if answers exist and have idList
	// 	let firsttime = !answers || !answers.idList || Object.keys(answers.idList).length === 0
	// 	if (firsttime) {
	// 		setIsFirstTime(true)
	// 	}
	// 	for (const category in questions) {
	// 		if (category == 'idList') {
	// 			combinedData[category] = (answers && answers[category]) || {}
	// 		} else {
	// 			combinedData[category] = {}
	// 			for (const key in questions[category]) {
	// 				combinedData[category][key] = {
	// 					question: questions[category][key].question || '',
	// 					answer: firsttime
	// 						? ''
	// 						: !answers || !answers[category] || !answers[category][key]
	// 							? ''
	// 							: answers[category][key].answer || '',
	// 				}
	// 			}
	// 		}
	// 	}

	// 	return combinedData
	// }

	const [subTabIndex, setSubTabIndex] = useState(0)
	const [alert, setAlert] = useState({
		open: false,
		message: '',
		severity: '',
	})

	// const handleSubTabChange = (event, newIndex) => {
	// 	setSubTabIndex(newIndex)
	// }

	const showAlert = (message, severity) => {
		setAlert({ open: true, message, severity })
	}

	const handleCloseAlert = () => {
		setAlert({ open: false, message: '', severity: '' })
	}

	const getCategoryData = index => {
		const category = labels[index]
		return (editData && editData[category]) || {}
	}

	// Debug logging to understand the state

	// For Admin viewing QA management, we don't need an ID
	if (role === 'Admin' && !studentId && !userId) {
		// Admin can view/edit questions without a student ID
		if (!studentQA) {
			return <div>Loading questions...</div>
		}
	} else if (!studentQA) {
		// Still loading data
		return <div>Loading...</div>
	} else if (!id && role === 'Student') {
		// Student needs an ID but doesn't have one
		return <div>Error: Student ID not found. Please log in again.</div>
	}

	// Debug logging

	// Don't render buttons if component is used from Top page
	const portalContent = !isFromTopPage ? (
		<Box className={styles.buttonsContainer}>
			{(role == 'Student' || role == 'Admin') && (
				<>
					{editMode ? (
						<>
							{role == 'Admin' && (
								<Button
									onClick={handleAdd}
									variant='outlined'
									color='primary'
									size='small'
								>
									{t['add']}
								</Button>
							)}
							{!isHonban && (
								<Button
									onClick={() => handleDraftUpsert(true)}
									variant='contained'
									color='primary'
									size='small'
								>
									{t['updateDraft']}
								</Button>
							)}
							{role == 'Student' && id && (
								<Button
									onClick={() => handleDraftUpsert(false)}
									variant='contained'
									color='primary'
									size='small'
								>
									{t['saveDraft']}
								</Button>
							)}
							{role == 'Admin' && (
								<Button
									onClick={handleSave}
									variant='contained'
									color='primary'
									size='small'
									disabled={isSaving}
								>
									{isSaving ? 'Saving...' : t['save']}
								</Button>
							)}
							<Button
								onClick={handleCancel}
								variant='outlined'
								color='error'
								size='small'
							>
								{t['cancel']}
							</Button>
						</>
					) : (
						<>
							{role == 'Student' &&
								currentDraft &&
								(currentDraft.status === 'draft' ||
									currentDraft.status === 'resubmission_required') && (
									<Button
										onClick={toggleConfirmMode}
										variant='contained'
										color='secondary'
										size='small'
									>
										{t['submitAgree']}
									</Button>
								)}
							<Button
								onClick={toggleEditMode}
								variant='contained'
								color='primary'
								size='small'
							>
								{role == 'Student' ? t['editProfile'] : ''}
								{role == 'Admin' ? t['q_edit'] : ''}
							</Button>
						</>
					)}
				</>
			)}
		</Box>
	) : null

	return (
		<Box mb={2}>
			{/* Only render save button container for Admin on QA management page */}
			{!id && role === 'Admin' && (
				<Box className={styles.topControlButtons} mb={2} px={2}>
					<Box id='saveButton'>{portalContent}</Box>
				</Box>
			)}

			{/* For other cases, use portal if saveButton exists and not from Top page */}
			{id &&
				!isFromTopPage &&
				portalContent &&
				document.getElementById('saveButton') &&
				ReactDOM.createPortal(
					portalContent,
					document.getElementById('saveButton')
				)}

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 36,
				}}
			>
				{qaQuestions.map((item, ind) => (
					<div
						key={ind}
						className={styles.qaBox}
						style={{
							backgroundColor: subTabIndex === ind ? '#d8e1f0' : 'transparent',
						}}
						onClick={() => {
							setSubTabIndex(ind)
						}}
					>
						<div
							className={styles.iconBox}
							style={{
								backgroundColor: item.iconColor,
							}}
						>
							<item.icon style={{ color: '#FFFFFF', fontSize: 25 }} />
						</div>
						<div
							style={{
								fontSize: 14,
								color: subTabIndex === ind ? item.iconColor : 'inherit',
							}}
						>
							{item.label}
						</div>
					</div>
				))}
			</div>

			{/* <Tabs
				className={styles.Tabs}
				value={subTabIndex}
				onChange={handleSubTabChange}
			>
				<Tab icon={<School />} iconPosition='top' label='学生成績' />
				<Tab icon={<AutoStories />} iconPosition='top' label='専門知識' />
				<Tab icon={<Face />} iconPosition='top' label='個性' />
				<Tab icon={<WorkHistory />} iconPosition='top' label='実務経験' />
				<Tab icon={<TrendingUp />} iconPosition='top' label='キャリア目標' />
			</Tabs> */}

			<Box my={2}>
				{editMode &&
					Object.entries(getCategoryData(subTabIndex)).map(
						([key, { question }]) => (
							<QATextField
								key={key}
								data={studentQA}
								editData={editData}
								category={labels[subTabIndex]}
								question={question}
								keyName={key}
								aEdit={role == 'Admin'}
								qEdit={role == 'Student'}
								updateEditData={handleUpdate}
								DeleteQA={showDeleteConfirmation}
							/>
						)
					)}
			</Box>

			<Box
				my={2}
				sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
			>
				{!editMode &&
					Object.entries(getCategoryData(subTabIndex)).map(
						([key, { question, answer }]) =>
							!(question.split(']')[0] == '[任意]' && !answer) && (
								<QAAccordion
									key={key}
									question={question}
									answer={answer ? answer : '回答なし'}
									notExpand={id ? false : true}
								/>
							)
					)}
			</Box>

			<Snackbar
				open={alert.open}
				autoHideDuration={6000}
				onClose={handleCloseAlert}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert
					onClose={handleCloseAlert}
					severity={alert.severity}
					sx={{ width: '100%' }}
				>
					{alert.message}
				</Alert>
			</Snackbar>
			{/* ---- CONFIRM DIALOG ---- */}
			<ProfileConfirmDialog
				open={confirmMode}
				onClose={toggleConfirmMode}
				onConfirm={handleConfirmProfile}
			/>
			
			{/* ---- DELETE CONFIRMATION DIALOG ---- */}
			<Dialog
				open={deleteConfirmation.open}
				onClose={handleDeleteCancel}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>
					{t['confirmDelete'] || 'Confirm Delete'}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{t['confirmDeleteMessage'] || 'Are you sure you want to delete this Q&A item? This action cannot be undone.'}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} color="primary">
						{t['cancel'] || 'Cancel'}
					</Button>
					<Button onClick={handleDeleteConfirm} color="error" variant="contained">
						{t['delete'] || 'Delete'}
					</Button>
				</DialogActions>
			</Dialog>
			{(role == 'Staff' || role == 'Admin') && !reviewMode && id && (
				<Box
					sx={{
						borderRadius: '10px',
						padding: 2,
					}}
				>
					{passedDraft && passedDraft.status != 'approved' ? (
						<>
							<TextField
								title='コメント'
								data={comment}
								editData={comment}
								editMode={true}
								updateEditData={updateComment}
								keyName='comments'
							/>

							<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									gap: 10,
								}}
							>
								<Button
									onClick={() => approveProfile('approved')}
									variant='contained'
									color='primary'
									size='small'
								>
									承認する
								</Button>
								<Button
									onClick={() => approveProfile('resubmission_required')}
									variant='contained'
									color='primary'
									size='small'
								>
									承認しない
								</Button>
							</Box>
						</>
					) : (
						<>
							{/* Staff can reject after approval */}
							{role === 'Staff' && (
								<>
									<TextField
										title='差し戻しコメント'
										data={comment}
										editData={comment}
										editMode={true}
										updateEditData={updateComment}
										keyName='comments'
									/>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'center',
											gap: 10,
											mb: 2,
										}}
									>
										<Button
											onClick={() => approveProfile('resubmission_required')}
											variant='contained'
											color='warning'
											size='small'
										>
											差し戻し
										</Button>
									</Box>
								</>
							)}

							{/* Admin visibility controls */}
							{role === 'Admin' && (
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'center',
										gap: 10,
									}}
								>
									<Button
										onClick={() => setProfileVisible(false)}
										variant='contained'
										color='primary'
										size='small'
									>
										非公開
									</Button>
									<Button
										onClick={() => setProfileVisible(true)}
										variant='contained'
										color='primary'
										size='small'
									>
										公開
									</Button>
								</Box>
							)}
						</>
					)}
				</Box>
			)}
		</Box>
	)
}

export default QA
