import { useState, useEffect, useContext, useCallback } from 'react'
import axios from '../../utils/axiosUtils'
import {
	Container,
	TextField,
	Button,
	Avatar,
	Grid,
	Box,
	IconButton,
	InputAdornment,
	Card,
	CardContent,
	Typography,
	FormControl,
	Select,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material'
import {
	PhotoCamera,
	Visibility,
	VisibilityOff,
	Business,
	Translate as TranslateIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { UserContext } from '../../contexts/UserContext'
import SettingStyle from './Setting.module.css'
import { useAlert } from '../../contexts/AlertContext'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'

// Custom icons import
import SaveIcon from '../../assets/icons/save-3-fill.svg'
import LockIcon from '../../assets/icons/lock-2-fill.svg'
import IdCardIcon from '../../assets/icons/id-card-line.svg'

const Setting = () => {
	const { activeUser, updateUser } = useContext(UserContext)
	const { language, changeLanguage } = useLanguage()
	const showAlert = useAlert()

	// Move t function outside or memoize it
	const t = useCallback(key => translations[language][key] || key, [language])

	const [role, setRole] = useState(null)
	const [user, setUser] = useState({})
	const [avatarImage, setAvatarImage] = useState(null)
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [selectedFile, setSelectedFile] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	
	// Language change confirmation state
	const [showLanguageConfirm, setShowLanguageConfirm] = useState(false)
	const [pendingLanguage, setPendingLanguage] = useState(null)
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

	// Default values with empty strings to prevent undefined
	const defaultValues = {
		currentPassword: '',
		password: '',
		confirmPassword: '',
		last_name: '',
		first_name: '',
		first_name_furigana: '',
		last_name_furigana: '',
		phone: '',
		email: '',
		contactEmail: '',
		contactPhone: '',
		workingHours: '',
		location: '',
	}

	const {
		control,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors, isDirty },
		reset,
		watch,
	} = useForm({
		defaultValues,
		mode: 'onChange',
	})
	
	// Watch for form changes
	useEffect(() => {
		setHasUnsavedChanges(isDirty)
	}, [isDirty])

	// Fetch user function with useCallback to prevent recreation
	const fetchUser = useCallback(async () => {
		const userRole = sessionStorage.getItem('role')
		setRole(userRole)
		setIsLoading(true)

		try {
			// Get correct ID based on role
			// Get correct ID based on role
			const loginUser = JSON.parse(sessionStorage.getItem('loginUser'))
			let id

			if (userRole === 'Student') {
				// For students, use student_id instead of primary key
				id = loginUser.studentId
			} else {
				// For other roles, use primary key id
				id = loginUser.id
			}

			if (!id) {
				throw new Error(`No valid ID found for role: ${userRole}`)
			}

			let response
			switch (userRole) {
				case 'Admin':
					response = await axios.get(`/api/admin/${id}`)
					break
				case 'Student':
					response = await axios.get(`/api/students/${id}`)
					break
				case 'Staff':
					response = await axios.get(`/api/staff/${id}`)
					break
				case 'Recruiter':
					response = await axios.get(`/api/recruiters/${id}`)
					break
				default:
					throw new Error(t('unknown_role_error'))
			}

			const userData = response.data
			setUser(userData)
			setAvatarImage(userData.photo)

			// Reset form with actual data, ensuring no undefined values
			const formData = {
				currentPassword: '',
				password: '',
				confirmPassword: '',
				first_name: userData.first_name || '',
				last_name: userData.last_name || '',
				first_name_furigana: userData.first_name_furigana || '',
				last_name_furigana: userData.last_name_furigana || '',
				phone: userData.phone || '',
				email: userData.email || '',
				contactEmail: userData.contactEmail || 'test@jdu.uz',
				contactPhone: userData.contactPhone || '+998 90 234 56 78',
				workingHours: userData.workingHours || '09:00 - 18:00',
				location:
					userData.location || 'Tashkent, Shayhontohur district, Sebzor, 21',
			}

			reset(formData)
		} catch (error) {
			showAlert('Failed to fetch user data', 'error')
		} finally {
			setIsLoading(false)
		}
	}, [reset, showAlert, t])

	// Use effect with proper dependencies
	useEffect(() => {
		fetchUser()
	}, [fetchUser]) // Include fetchUser in dependencies

	const handleAvatarChange = event => {
		const file = event.target.files[0]
		if (file) {
			setSelectedFile(file)
			const reader = new FileReader()
			reader.onload = e => {
				setAvatarImage(e.target.result)
			}
			reader.readAsDataURL(file)
		}
	}

	const togglePasswordVisibility = field => {
		switch (field) {
			case 'current':
				setShowCurrentPassword(prev => !prev)
				break
			case 'new':
				setShowNewPassword(prev => !prev)
				break
			case 'confirm':
				setShowConfirmPassword(prev => !prev)
				break
			default:
				break
		}
	}

	const validatePasswords = data => {
		if (data.password !== data.confirmPassword) {
			setError('confirmPassword', {
				type: 'manual',
				message: t('password_mismatch'),
			})
			return false
		}
		clearErrors('confirmPassword')
		if (data.password && !data.currentPassword) {
			setError('currentPassword', {
				type: 'manual',
				message: t('current_password_required'),
			})
			return false
		}
		clearErrors('currentPassword')
		return true
	}

	const onSubmit = async data => {
		if (!validatePasswords(data)) {
			return
		}
		try {
			let id
			if (role === 'Student') {
				id = activeUser.studentId // Use student_id for Student API calls
			} else {
				id = activeUser.id // Use primary key for other roles
			}
			const updateData = {
				last_name: data.last_name,
				first_name: data.first_name,
				first_name_furigana: data.first_name_furigana,
				last_name_furigana: data.last_name_furigana,
				phone: data.phone,
				email: data.email,
				contactEmail: data.contactEmail,
				contactPhone: data.contactPhone,
				workingHours: data.workingHours,
				location: data.location,
			}
			if (data.password) {
				updateData.password = data.password
				updateData.currentPassword = data.currentPassword
			}

			if (selectedFile) {
				const formData = new FormData()
				const userId = JSON.parse(sessionStorage.getItem('loginUser')).id
				formData.append('file', selectedFile) // 'files' o'rniga 'file' ishlatamiz
				formData.append('imageType', 'avatar')
				formData.append('role', role) // role qo'shamiz
				formData.append('id', userId) // id qo'shamiz
				const fileResponse = await axios.post('/api/files/upload', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				})

				updateData.photo = fileResponse.data.Location // response structure ham o'zgartirildi
			}

			let updatedData

			switch (role) {
				case 'Admin':
					updatedData = await axios.put(`/api/admin/${id}`, updateData)
					break
				case 'Student':
					updatedData = await axios.put(`/api/students/${id}`, updateData)
					break
				case 'Staff':
					updatedData = await axios.put(`/api/staff/${id}`, updateData)
					break
				case 'Recruiter':
					updatedData = await axios.put(`/api/recruiters/${id}`, updateData)
					break
				default:
					throw new Error(t('unknown_role_error'))
			}
			await setUser(updatedData.data)
			let tempUser = activeUser
			tempUser.name =
				updatedData.data.first_name + ' ' + updatedData.data.last_name
			tempUser.photo = updatedData.data.photo
			sessionStorage.setItem('loginUser', JSON.stringify(tempUser))
			updateUser()
			setIsEditing(false)
			setHasUnsavedChanges(false)
			showAlert(t('profile_update_success'), 'success')
		} catch (error) {

			// File upload error handling
			if (
				error.config &&
				error.config.url &&
				error.config.url.includes('/api/files/upload')
			) {
				showAlert(
					'ファイルのアップロードに失敗しました。ファイルサイズやフォーマットを確認してください。',
					'error'
				)
			} else if (
				error.response &&
				error.response.data &&
				error.response.data.error
			) {
				setError('currentPassword', {
					type: 'manual',
					message: error.response.data.error,
				})
			} else {
				showAlert(t('profile_update_failed_retry'), 'error')
			}
		}
	}

	const handleSync = async () => {
		try {
			await axios.post('api/kintone/sync')
			showAlert('同期に成功しました。', 'success')
		} catch (error) {
			showAlert('同期に失敗しました。再試行してください。', 'error')
		}
	}

	const handleEditClick = () => {
		setIsEditing(true)
	}

	const handleCancel = () => {
		setIsEditing(false)
		// Reset to original values without password fields
		const formData = {
			currentPassword: '',
			password: '',
			confirmPassword: '',
			last_name: user.last_name || '',
			first_name: user.first_name || '',
			first_name_furigana: user.first_name_furigana || '',
			last_name_furigana: user.last_name_furigana || '',
			phone: user.phone || '',
			email: user.email || '',
			contactEmail: user.contactEmail || 'test@jdu.uz',
			contactPhone: user.contactPhone || '+998 90 234 56 78',
			workingHours: user.workingHours || '09:00 - 18:00',
			location: user.location || 'Tashkent, Shayhontohur district, Sebzor, 21',
		}
		reset(formData)
	}

	const getCompanyName = () => {
		if (role === 'Recruiter') {
			return user.company_name || '株式会社デジタル・ナレッジ'
		}
		return ''
	}

	// Show loading state while fetching user data
	if (isLoading) {
		return (
			<Container className={SettingStyle.container}>
				<Box
					display='flex'
					justifyContent='center'
					alignItems='center'
					minHeight='400px'
				>
					<Typography>Loading...</Typography>
				</Box>
			</Container>
		)
	}

	return (
		<Container className={SettingStyle.container}>
			{/* Profile Header Card */}
			<Card
				className={SettingStyle.profileCard}
				sx={{
					boxShadow: `
						0 1px 3px rgba(0, 0, 0, 0.04),
						0 1px 2px rgba(0, 0, 0, 0.03)
					`,
					transition: 'box-shadow 0.3s ease',
					'&:hover': {
						boxShadow: `
							0 2px 4px rgba(0, 0, 0, 0.06),
							0 4px 8px rgba(0, 0, 0, 0.04)
						`,
					},
				}}
			>
				<CardContent className={SettingStyle.profileCardContent}>
					<Box className={SettingStyle.profileHeader}>
						<Box className={SettingStyle.avatarSection}>
							<Avatar
								alt={t('user_avatar')}
								src={avatarImage}
								className={SettingStyle.avatar}
							>
								{role === 'Recruiter' && t('company_logo')}
							</Avatar>
							<label htmlFor='avatar-upload'>
								{isEditing && (
									<IconButton
										color='primary'
										aria-label={t('upload_picture')}
										component='span'
										size='small'
										className={SettingStyle.cameraButton}
									>
										<PhotoCamera />
									</IconButton>
								)}
							</label>
							<input
								accept='image/*'
								id='avatar-upload'
								type='file'
								style={{ display: 'none' }}
								onChange={handleAvatarChange}
							/>
						</Box>

						<Box className={SettingStyle.userInfo}>
							{role === 'Recruiter' && (
								<Typography variant='h2' className={SettingStyle.userName}>
									{getCompanyName()}
								</Typography>
							)}
							<Typography variant='body2' className={SettingStyle.companyName}>
								{user.first_name && user.last_name
									? `${user.first_name}${user.last_name}`
									: t('user')}
							</Typography>
						</Box>
						{/* Admin Sync Button */}
						{role === 'Admin' && (
							<Box className={SettingStyle.syncSection}>
								<Button
									variant='contained'
									color='primary'
									onClick={handleSync}
									className={SettingStyle.syncButton}
								>
									{t('sync')}
								</Button>
							</Box>
						)}
						{/* Edit Button */}
						<Box className={SettingStyle.editButtonContainer}>
							{!isEditing ? (
								<Button
									variant='outlined'
									className={SettingStyle.editButton}
									onClick={handleEditClick}
									startIcon={
										<img
											src={SaveIcon}
											alt='Edit'
											style={{ width: 20, height: 20 }}
										/>
									}
								>
									{t('edit') || '編集'}
								</Button>
							) : (
								<Box className={SettingStyle.editingButtons}>
									<Button
										variant='outlined'
										className={SettingStyle.cancelButton}
										onClick={handleCancel}
									>
										{t('cancel') || 'キャンセル'}
									</Button>
									<Button
										variant='contained'
										className={SettingStyle.saveButton}
										onClick={handleSubmit(onSubmit)}
										startIcon={
											<img
												src={SaveIcon}
												alt='Save'
												style={{
													width: 20,
													height: 20,
													filter: 'brightness(0) invert(1)',
												}}
											/>
										}
									>
										{t('save') || '保存'}
									</Button>
								</Box>
							)}
						</Box>
					</Box>
				</CardContent>
			</Card>

			<form onSubmit={handleSubmit(onSubmit)}>
				{/* Personal Information Card */}
				<Card
					className={SettingStyle.sectionCard}
					sx={{
						boxShadow: `
							0 1px 3px rgba(0, 0, 0, 0.04),
							0 1px 2px rgba(0, 0, 0, 0.03)
						`,
						transition: 'box-shadow 0.3s ease',
						'&:hover': {
							boxShadow: `
								0 2px 4px rgba(0, 0, 0, 0.06),
								0 4px 8px rgba(0, 0, 0, 0.04)
							`,
						},
					}}
				>
					<CardContent>
						<Box className={SettingStyle.sectionHeader}>
							<img
								src={IdCardIcon}
								alt='Personal Info'
								className={SettingStyle.sectionIcon}
							/>
							<Typography variant='h6' className={SettingStyle.sectionTitle}>
								{t('personal_info') || '個人情報'}
							</Typography>
						</Box>
						<Grid container spacing={3} className={SettingStyle.formGrid}>
							<Grid item xs={12} sm={6}>
								<Typography variant='body2' className={SettingStyle.fieldLabel}>
									{t('first_name') || '名'}
								</Typography>
								<Controller
									name='first_name'
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											value={field.value || ''} // Ensure never undefined
											variant='outlined'
											fullWidth
											disabled={!isEditing}
											className={SettingStyle.textField}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography variant='body2' className={SettingStyle.fieldLabel}>
									{t('first_name_furigana') || '名 (ふりがな)'}
								</Typography>
								<Controller
									name='first_name_furigana'
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											value={field.value || ''} // Ensure never undefined
											variant='outlined'
											fullWidth
											disabled={!isEditing}
											className={SettingStyle.textField}
											placeholder={t('furigana_help')}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography variant='body2' className={SettingStyle.fieldLabel}>
									{t('last_name') || '姓'}
								</Typography>
								<Controller
									name='last_name'
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											value={field.value || ''} // Ensure never undefined
											variant='outlined'
											fullWidth
											disabled={!isEditing}
											className={SettingStyle.textField}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography variant='body2' className={SettingStyle.fieldLabel}>
									{t('last_name_furigana') || '姓 (ふりがな)'}
								</Typography>
								<Controller
									name='last_name_furigana'
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											value={field.value || ''} // Ensure never undefined
											variant='outlined'
											fullWidth
											disabled={!isEditing}
											className={SettingStyle.textField}
											placeholder={t('furigana_help')}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography variant='body2' className={SettingStyle.fieldLabel}>
									{t('phone') || '電話番号'}
								</Typography>
								<Controller
									name='phone'
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											value={field.value || ''} // Ensure never undefined
											variant='outlined'
											fullWidth
											disabled={!isEditing}
											className={SettingStyle.textField}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography variant='body2' className={SettingStyle.fieldLabel}>
									{t('email') || 'メール'}
								</Typography>
								<Controller
									name='email'
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											value={field.value || ''} // Ensure never undefined
											autoComplete='false'
											variant='outlined'
											fullWidth
											disabled={true}
											className={SettingStyle.textField}
										/>
									)}
								/>
							</Grid>
						</Grid>
					</CardContent>
				</Card>

				{/* Password Change Card */}
				<Card
					className={SettingStyle.sectionCard}
					sx={{
						boxShadow: `
							0 1px 3px rgba(0, 0, 0, 0.04),
							0 1px 2px rgba(0, 0, 0, 0.03)
						`,
						transition: 'box-shadow 0.3s ease',
						'&:hover': {
							boxShadow: `
								0 2px 4px rgba(0, 0, 0, 0.06),
								0 4px 8px rgba(0, 0, 0, 0.04)
							`,
						},
					}}
				>
					<CardContent>
						<Box className={SettingStyle.sectionHeader}>
							<img
								src={LockIcon}
								alt='Password'
								className={SettingStyle.sectionIcon}
							/>
							<Typography variant='h6' className={SettingStyle.sectionTitle}>
								{t('change_password') || 'パスワードの変更'}
							</Typography>
						</Box>
						<Grid container spacing={3} className={SettingStyle.formGrid}>
							<Grid item xs={12}>
								<Typography variant='body2' className={SettingStyle.fieldLabel}>
									{t('current_password') || 'パスワード'}
								</Typography>
								<Controller
									name='currentPassword'
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											value={field.value || ''} // Ensure never undefined
											variant='outlined'
											type={showCurrentPassword ? 'text' : 'password'}
											fullWidth
											disabled={!isEditing}
											autoComplete='new-password'
											error={!!errors.currentPassword}
											helperText={errors.currentPassword?.message}
											className={SettingStyle.textField}
											InputProps={{
												endAdornment: (
													<InputAdornment position='end'>
														<IconButton
															aria-label={t('toggle_password_visibility')}
															onClick={() =>
																togglePasswordVisibility('current')
															}
															edge='end'
														>
															{showCurrentPassword ? (
																<VisibilityOff />
															) : (
																<Visibility />
															)}
														</IconButton>
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography variant='body2' className={SettingStyle.fieldLabel}>
									{t('new_password') || '新しいパスワード'}
								</Typography>
								<Controller
									name='password'
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											value={field.value || ''} // Ensure never undefined
											variant='outlined'
											type={showNewPassword ? 'text' : 'password'}
											fullWidth
											disabled={!isEditing}
											autoComplete='new-password'
											error={!!errors.password}
											helperText={errors.password?.message}
											className={SettingStyle.textField}
											InputProps={{
												endAdornment: (
													<InputAdornment position='end'>
														<IconButton
															aria-label={t('toggle_password_visibility')}
															onClick={() => togglePasswordVisibility('new')}
															edge='end'
														>
															{showNewPassword ? (
																<VisibilityOff />
															) : (
																<Visibility />
															)}
														</IconButton>
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography variant='body2' className={SettingStyle.fieldLabel}>
									{t('confirm_password') || 'パスワードを認証する'}
								</Typography>
								<Controller
									name='confirmPassword'
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											value={field.value || ''} // Ensure never undefined
											variant='outlined'
											type={showConfirmPassword ? 'text' : 'password'}
											fullWidth
											disabled={!isEditing}
											autoComplete='new-password'
											error={!!errors.confirmPassword}
											helperText={errors.confirmPassword?.message}
											className={SettingStyle.textField}
											InputProps={{
												endAdornment: (
													<InputAdornment position='end'>
														<IconButton
															aria-label={t('toggle_password_visibility')}
															onClick={() =>
																togglePasswordVisibility('confirm')
															}
															edge='end'
														>
															{showConfirmPassword ? (
																<VisibilityOff />
															) : (
																<Visibility />
															)}
														</IconButton>
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
							</Grid>
						</Grid>
					</CardContent>
				</Card>

				{/* Language Settings Card */}
				<Card
					className={SettingStyle.sectionCard}
					sx={{
						boxShadow: `
							0 1px 3px rgba(0, 0, 0, 0.04),
							0 1px 2px rgba(0, 0, 0, 0.03)
						`,
						transition: 'box-shadow 0.3s ease',
						'&:hover': {
							boxShadow: `
								0 2px 4px rgba(0, 0, 0, 0.06),
								0 4px 8px rgba(0, 0, 0, 0.04)
							`,
						},
					}}
				>
					<CardContent>
						<Box className={SettingStyle.sectionHeader}>
							<TranslateIcon className={SettingStyle.sectionIcon} />
							<Typography variant='h6' className={SettingStyle.sectionTitle}>
								{t('language_settings') || '言語設定'}
							</Typography>
						</Box>
						<Grid container spacing={3} className={SettingStyle.formGrid}>
							<Grid item xs={12}>
								<Typography variant='body2' className={SettingStyle.fieldLabel}>
									{t('display_language') || '表示言語'}
								</Typography>
								<FormControl variant='outlined' fullWidth>
									<Select
										value={language}
										onChange={(e) => {
											if (isEditing && hasUnsavedChanges) {
												setPendingLanguage(e.target.value)
												setShowLanguageConfirm(true)
											} else {
												changeLanguage(e.target.value)
											}
										}}
										className={SettingStyle.textField}
									>
										<MenuItem value='ja'>
											<Box display='flex' alignItems='center' gap={1}>
												<span>🇯🇵</span>
												<span>日本語</span>
											</Box>
										</MenuItem>
										<MenuItem value='en'>
											<Box display='flex' alignItems='center' gap={1}>
												<span>🇺🇸</span>
												<span>English</span>
											</Box>
										</MenuItem>
										<MenuItem value='uz'>
											<Box display='flex' alignItems='center' gap={1}>
												<span>🇺🇿</span>
												<span>O'zbek</span>
											</Box>
										</MenuItem>
										<MenuItem value='ru'>
											<Box display='flex' alignItems='center' gap={1}>
												<span>🇷🇺</span>
												<span>Русский</span>
											</Box>
										</MenuItem>
									</Select>
								</FormControl>
								<Typography variant='caption' color='textSecondary' sx={{ mt: 1, display: 'block' }}>
									{t('language_change_notice') || 'アプリケーションの表示言語を変更します'}
								</Typography>
							</Grid>
						</Grid>
					</CardContent>
				</Card>

				{/* Admin Contact Information Card */}
				{role === 'Admin' && (
					<Card
						className={SettingStyle.sectionCard}
						sx={{
							boxShadow: `
								0 1px 3px rgba(0, 0, 0, 0.04),
								0 1px 2px rgba(0, 0, 0, 0.03)
							`,
							transition: 'box-shadow 0.3s ease',
							'&:hover': {
								boxShadow: `
									0 2px 4px rgba(0, 0, 0, 0.06),
									0 4px 8px rgba(0, 0, 0, 0.04)
								`,
							},
						}}
					>
						<CardContent>
							<Box className={SettingStyle.sectionHeader}>
								<Business className={SettingStyle.sectionIcon} />
								<Typography variant='h6' className={SettingStyle.sectionTitle}>
									{t('contact_info')}
								</Typography>
							</Box>
							<Grid container spacing={3} className={SettingStyle.formGrid}>
								<Grid item xs={12} sm={6}>
									<Typography
										variant='body2'
										className={SettingStyle.fieldLabel}
									>
										{t('contact_email')}
									</Typography>
									<Controller
										name='contactEmail'
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												value={field.value || ''} // Ensure never undefined
												variant='outlined'
												fullWidth
												disabled={!isEditing}
												className={SettingStyle.textField}
											/>
										)}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography
										variant='body2'
										className={SettingStyle.fieldLabel}
									>
										{t('contact_phone')}
									</Typography>
									<Controller
										name='contactPhone'
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												value={field.value || ''} // Ensure never undefined
												variant='outlined'
												fullWidth
												disabled={!isEditing}
												className={SettingStyle.textField}
											/>
										)}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography
										variant='body2'
										className={SettingStyle.fieldLabel}
									>
										{t('working_hours')}
									</Typography>
									<Controller
										name='workingHours'
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												value={field.value || ''} // Ensure never undefined
												variant='outlined'
												fullWidth
												disabled={!isEditing}
												className={SettingStyle.textField}
											/>
										)}
									/>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography
										variant='body2'
										className={SettingStyle.fieldLabel}
									>
										{t('location')}
									</Typography>
									<Controller
										name='location'
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												value={field.value || ''} // Ensure never undefined
												variant='outlined'
												fullWidth
												disabled={!isEditing}
												className={SettingStyle.textField}
											/>
										)}
									/>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				)}
			</form>
			
			{/* Language Change Confirmation Dialog */}
			<Dialog
				open={showLanguageConfirm}
				onClose={() => setShowLanguageConfirm(false)}
			>
				<DialogTitle>
					{t('unsaved_changes_title') || 'O\'zgarishlar saqlanmagan'}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{t('language_change_unsaved_message') || 'Til o\'zgartirishdan oldin o\'zgarishlarni saqlaysizmi?'}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowLanguageConfirm(false)}>
						{t('cancel') || 'Bekor qilish'}
					</Button>
					<Button 
						onClick={() => {
							handleCancel()
							setShowLanguageConfirm(false)
							changeLanguage(pendingLanguage)
						}}
						color='warning'
					>
						{t('discard_changes') || 'Saqlamasdan davom etish'}
					</Button>
					<Button 
						onClick={async () => {
							await handleSubmit(onSubmit)()
							setShowLanguageConfirm(false)
							changeLanguage(pendingLanguage)
						}}
						variant='contained'
						color='primary'
					>
						{t('save_and_continue') || 'Saqlash va davom etish'}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	)
}

export default Setting
