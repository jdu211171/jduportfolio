import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import Cookies from 'js-cookie'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import universityImage from '../../assets/university.png'
import { LanguageSelect } from '../../components/languageSelector/LanguageSelect'
import { UserContext } from '../../contexts/UserContext'
import translations from '../../locales/translations'
import axios from '../../utils/axiosUtils'
import styles from './Login.module.css'

const Login = () => {
	const savedLanguage = localStorage.getItem('language') || 'ja'
	const [language] = useState(savedLanguage)
	const t = key => translations[language][key] || key
	const navigate = useNavigate()
	const { updateUser } = useContext(UserContext)

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState('')
	const [loginMode, setLoginMode] = useState(true)

	const handleLogin = async e => {
		e.preventDefault()
		setError('')

		try {
			const response = await axios.post('/api/auth/login', { email, password })

			const { userType, userData } = response.data
			const token = Cookies.get('token')
			// Set token and userType as cookies (ensure these are set properly)
			// const expiresAt = new Date();
			// expiresAt.setTime(expiresAt.getTime() + (1 * 60 * 60 * 1000)); //expires at 1h
			// Cookies.set('token', token, { expires: expiresAt, secure: true, sameSite: 'Strict' });
			// Cookies.set('userType', userType, { expires: expiresAt, secure: true, sameSite: 'Strict' });

			sessionStorage.setItem('token', token)
			sessionStorage.setItem('role', userType)
			sessionStorage.setItem('loginUser', JSON.stringify(userData))
			updateUser()
			navigate('/')
		} catch (err) {
			setError(err.response?.data?.error || 'Login failed')
		}
	}

	const handleForgotPassword = async e => {
		e.preventDefault()
		setError('')
		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			})

			if (!response.ok) {
				throw new Error('Failed to send password reset email')
			}
		} catch (err) {
			setError(err.message)
		}
	}

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	return (
		<div className={styles['login-container']}>
			<div className={styles['login-form']}>
				<div className={styles['header-container']}>
					<img src={logo} alt='Logo' width={80} height={80} />
					<div className={styles['text-container']}>
						<h2 style={{ textWrap: 'wrap' }}>
							{loginMode ? t('welcome') : t('forgotPassword')}
						</h2>
						{!loginMode && <p>{t('resetPassword2')}</p>}
					</div>
				</div>
				{error && <p style={{ color: 'red' }}>{error}</p>}
				{loginMode ? (
					<form onSubmit={handleLogin}>
						<div className={styles['input-group']}>
							<div className={styles['language']}>
								<div style={{ fontWeight: 700 }}>{t('email')}</div>
								<LanguageSelect style={{ padding: '2px' }} />
							</div>
							<div className={styles['input-icon']}>
								<EmailOutlinedIcon />
								<input
									type='email'
									placeholder={t('enterYourLogin')}
									value={email}
									onChange={e => setEmail(e.target.value)}
									required
								/>
							</div>
						</div>
						<div className={styles['input-group']}>
							<label>{t('current_password')}</label>
							<div className={styles['input-icon']}>
								<LockOutlinedIcon />
								<input
									type={showPassword ? 'text' : 'password'}
									placeholder={t('enterYourPassword')}
									value={password}
									onChange={e => setPassword(e.target.value)}
									required
								/>
								{password && (
									<span
										onClick={togglePasswordVisibility}
										className={styles['visibility-icon']}
									>
										{showPassword ? (
											<VisibilityOffOutlinedIcon />
										) : (
											<VisibilityOutlinedIcon />
										)}
									</span>
								)}
							</div>
						</div>
						<div className={styles['remember-me-container']}>
							<div className={styles['remember-me']}>
								<input type='checkbox' id='remember' name='remember' />
								<label htmlFor='remember'>{t('save')}</label>
							</div>
							<div className={styles['forgot-password']}>
								<button
									type='button'
									onClick={() => setLoginMode(false)}
									className={styles['forgot-password-button']}
								>
									{t('forgotPassword')}
								</button>
							</div>
						</div>
						<button
							type='submit'
							className={`${styles['button-custom']} ${styles['submit-button']}`}
						>
							{t('loginLabel')}
						</button>
						<button
							type='button'
							className={`${styles['button-google-custom']}`}
							onClick={() => {
								window.location.href = '/api/auth/google'
							}}
						>
							<img src='/google-icon.webp' alt='google-icon' width={23} />
							Googleでログイン
						</button>
					</form>
				) : (
					// Forgot Password mode
					<form onSubmit={handleForgotPassword}>
						<div className={styles['login-label']}>
							<label style={{ fontWeight: 700 }}>{t('mailAddress')}</label>
							<LanguageSelect />
						</div>
						<div className={styles['input-group']}>
							<label>{t('email')}</label>
							<div className={styles['input-icon']}>
								<input
									type='email'
									placeholder={t('enterYourLogin')}
									value={email}
									onChange={e => setEmail(e.target.value)}
									required
								/>
							</div>
						</div>
						<div className={styles['button-group']}>
							<button
								type='submit'
								className={`${styles['button-custom']} ${styles['submit-button']}`}
							>
								{t('send')}
							</button>
							<button
								type='button'
								className={`${styles['button-custom']} ${styles['back-button']}`}
								onClick={() => setLoginMode(true)}
							>
								{t('back')}
							</button>
						</div>
					</form>
				)}
			</div>
			<div className={styles['login-image']}>
				<img src={universityImage} alt='University' />
			</div>
		</div>
	)
}

export default Login
