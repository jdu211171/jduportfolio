// eslint-disable-next-line no-unused-vars
import React, {
	useEffect,
	useState,
	useContext,
	useRef,
	useCallback,
} from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useLocation } from 'react-router-dom'
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
} from '@mui/material'
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
	const { language: langContext } = useLanguage()
	const showAlert = useAlert()
	const currentLanguage = language || langContext || 'en'
	const t = translations[currentLanguage] || translations.en

	const id = userId !== 0 ? userId : recruiterId

	const [company, setCompany] = useState(null)
	const [loading, setLoading] = useState(false)
	const [editMode, setEditMode] = useState(false)

	// Properly initialized editData state
	const [editData, setEditData] = useState({
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
		first_name: '',
		last_name: '',
		company_name: '',
		photo: '',
	})

	// Refs for maintaining focus
	const inputRefs = useRef({})
	const scrollPositionRef = useRef(0)

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
				}

				setCompany(processedData)
				setEditData({
					...processedData,
					newBusinessOverview: '',
					newRequiredSkill: '',
					newWelcomeSkill: '',
				})
			} catch (error) {
				console.error('Error fetching company data:', error)
				setCompany(null)
			}
		}

		fetchCompany()
	}, [id])

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
			}

			// Remove new item fields and invalid fields
			delete cleanedData.newBusinessOverview
			delete cleanedData.newRequiredSkill
			delete cleanedData.newWelcomeSkill
			delete cleanedData.newTargetAudience

			// Prepare data for backend validation
			const dataToSave = {}

			// Only include non-empty fields to avoid validation errors
			Object.keys(cleanedData).forEach(key => {
				const value = cleanedData[key]
				if (value !== null && value !== undefined && value !== '') {
					// Handle phone_number validation (must be numeric string)
					if (key === 'phone_number') {
						const phoneStr = String(value).replace(/\D/g, '') // Remove non-digits
						if (phoneStr) {
							dataToSave[key] = phoneStr
						}
					}
					// Handle date_of_birth validation (must be ISO8601 format)
					else if (key === 'date_of_birth') {
						if (value instanceof Date || typeof value === 'string') {
							try {
								const date = new Date(value)
								if (!isNaN(date.getTime())) {
									dataToSave[key] = date.toISOString().split('T')[0] // YYYY-MM-DD format
								}
							} catch (e) {
								console.warn('Invalid date_of_birth:', value)
							}
						}
					}
					// Handle email validation
					else if (key === 'email') {
						const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
						if (emailRegex.test(value)) {
							dataToSave[key] = value
						}
					}
					// Include other fields as strings
					else {
						dataToSave[key] = String(value)
					}
				}
			})

			// Debug: Log the data being sent
			console.log('Data being sent to server:', dataToSave)
			console.log('Recruiter ID:', id)

			await axios.put(`/api/recruiters/${id}`, dataToSave)
			setCompany({ ...editData })
			setEditMode(false)

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
		if (company) {
			setEditData({
				...company,
				newBusinessOverview: '',
				newRequiredSkill: '',
				newWelcomeSkill: '',
			})
		}
		setEditMode(false)
	}

	// Optimized state update to prevent unnecessary re-renders
	const handleUpdateEditData = useCallback((key, value) => {
		setEditData(prevData => {
			if (prevData[key] === value) {
				return prevData
			}
			return {
				...prevData,
				[key]: value,
			}
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

	// Business overview rendering with stable keys
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
								<Typography>{safeStringValue(item)}</Typography>
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
								t.business_content_placeholder || 'Enter business content'
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
				<Typography>{t.loading || 'Loading...'}</Typography>
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
								{safeStringValue(company.first_name)}{' '}
								{safeStringValue(company.last_name)}
							</Typography>
						</Box>
						<Box className={styles.chipContainer}>
							<Chip
								label={safeStringValue(company.company_name)}
								variant='outlined'
								color='primary'
								className={styles.primaryChip}
							/>
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
											{t.cancel || 'Cancel'}
										</Button>
										<Button
											onClick={handleSave}
											variant='contained'
											color='primary'
											size='small'
											disabled={loading}
										>
											{loading ? t.saving || 'Saving...' : t.save || 'Save'}
										</Button>
									</>
								) : (
									<Button
										onClick={() => setEditMode(true)}
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
										{t.edit || 'Edit'}
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
								{t.location || 'Location'}
							</Typography>
							<Box className={styles.value}>
								{editMode ? (
									<CustomTextField
										value={safeStringValue(editData.company_Address)}
										onChange={e =>
											handleUpdateEditData('company_Address', e.target.value)
										}
										placeholder={t.location_placeholder || 'Enter location'}
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
								{t.established || 'Established'}
							</Typography>
							<Box className={styles.value}>
								{editMode ? (
									<CustomTextField
										value={safeStringValue(editData.established_Date)}
										onChange={e =>
											handleUpdateEditData('established_Date', e.target.value)
										}
										placeholder={
											t.established_placeholder || 'Enter established date'
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
								{t.employee_count || 'Employee Count'}
							</Typography>
							<Box className={styles.value}>
								{editMode ? (
									<CustomTextField
										value={safeStringValue(editData.employee_Count)}
										onChange={e =>
											handleUpdateEditData('employee_Count', e.target.value)
										}
										placeholder={
											t.employee_count_placeholder || 'Enter employee count'
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

			{/* Company Overview */}
			<ContentBox>
				<SectionHeader
					icon={DescriptionIcon}
					title={t.company_overview || 'Company Overview'}
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
							t.company_description_placeholder || 'Enter company description'
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
					title={t.business_overview || 'Business Overview'}
				/>
				<Box>{renderBusinessOverview()}</Box>
			</ContentBox>

			{/* Recruitment Requirements */}
			<ContentBox>
				<SectionHeader
					icon={WorkIcon}
					title={t.recruitment_requirements || 'Recruitment Requirements'}
				/>
				{editMode ? (
					<Grid container spacing={3}>
						{/* Required Skills Column */}
						<Grid item xs={12} md={6}>
							<Typography variant='subtitle1' className={styles.fieldLabel}>
								{t.required_skills || 'Required Skills'}
							</Typography>
							<Box className={styles.recruitmentEditColumn}>
								{/* Saved items */}
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
												<Typography>{safeStringValue(item)}</Typography>
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
										placeholder='例: HTML/CSS/JavaScriptの実務経験（3年以上）'
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
										{t.save || 'Save'}
									</button>
								</Box>
							</Box>
						</Grid>

						{/* Welcome Skills Column */}
						<Grid item xs={12} md={6}>
							<Typography variant='subtitle1' className={styles.fieldLabel}>
								{t.welcome_skills || 'Welcome Skills'}
							</Typography>
							<Box className={styles.recruitmentEditColumn}>
								{/* Saved items */}
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
											<Typography>{safeStringValue(item)}</Typography>
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
										placeholder='例: TypeScriptの実務経験'
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
										{t.save || 'Save'}
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
									{t.required_skills || 'Required Skills'}
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
									{t.welcome_skills || 'Welcome Skills'}
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
					title={t.target_audience || 'Target Audience'}
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
							{t.target_person || 'Target Person'}
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
												t.target_audience_placeholder || 'Enter target audience'
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
							新しい対象者を追加
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
							{t.target_person || 'Target Person'}
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
					title={t.additional_info || 'Additional Information'}
				/>
				<Grid>
					{[
						{
							key: 'work_location',
							label: t.work_location || 'Work Location',
							placeholder: t.work_location_placeholder || 'Enter work location',
						},
						{
							key: 'work_hours',
							label: t.work_hours || 'Work Hours',
							placeholder: t.work_hours_placeholder || 'Enter work hours',
						},
						{
							key: 'salary',
							label: t.salary || 'Salary',
							placeholder: t.salary_placeholder || 'Enter salary',
						},
						{
							key: 'benefits',
							label: t.benefits || 'Benefits',
							placeholder: t.benefits_placeholder || 'Enter benefits',
						},
						{
							key: 'selection_process',
							label: t.selection_process || 'Selection Process',
							placeholder:
								t.selection_process_placeholder || 'Enter selection process',
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
		</Box>
	)
}

// Main component PropTypes
CompanyProfile.propTypes = {
	userId: PropTypes.number,
}

export default CompanyProfile
