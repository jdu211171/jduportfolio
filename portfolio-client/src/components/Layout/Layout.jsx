import { Modal } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { UserContext } from '../../contexts/UserContext'
import translations from '../../locales/translations'
import UserAvatar from '../Table/Avatar/UserAvatar'
// icons
import { ReactComponent as BookmarkIcon } from '../../assets/icons/bookmark.svg'
import { ReactComponent as ProfileIcon } from '../../assets/icons/profile.svg'
import { ReactComponent as MenuIcon } from '../../assets/icons/menuIcon.svg'
import { ReactComponent as HomeIcon } from '../../assets/icons/home-8-line.svg'
import { ReactComponent as GroupIcon } from '../../assets/icons/group-line.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/question-line.svg'
import { ReactComponent as QuestionIcon } from '../../assets/icons/question-answer-line.svg'
import { ReactComponent as LogoutIcon } from '../../assets/icons/login-circle-line.svg'
import { ReactComponent as UserPlusIcon } from '../../assets/icons/user-add-line.svg'
import { ReactComponent as StudentIcon } from '../../assets/icons/user-follow-line.svg'
import { ReactComponent as SearchIcon } from '../../assets/icons/user-search-line.svg'
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings-3-line.svg'

import Notifications from '../Notification/Notifications.jsx'
import style from './Layout.module.css'
import logo from '/src/assets/logo40.png'

// Utility function to check roles
const checkRole = (role, allowedRoles) => {
	return allowedRoles.includes(role)
}

const Layout = () => {
	const [openLogoutModal, setOpenLogoutModal] = useState(false)
	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	const handleLogout = () => {
		sessionStorage.clear()
		window.location.href = '/login'
	}
	const navItems = [
		{
			items: [
				{
					to: '/',
					icon: <HomeIcon style={{ width: '24px', height: '24px' }} />,
					label: t('home'),
					roles: ['Admin', 'Staff', 'Recruiter'],
				},
				{
					to: '/companyprofile',
					icon: <ProfileIcon style={{ width: '24px', height: '24px' }} />,
					label: t('profile'),
					roles: ['Recruiter'],
				},
				{
					to: '/student',
					icon: <SearchIcon style={{ width: '24px', height: '24px' }} />,
					label: t('student_search'),
					roles: ['Admin', 'Staff', 'Recruiter'],
				},
				{
					to: '/checkprofile',
					icon: <StudentIcon style={{ width: '24px', height: '24px' }} />,
					label: t('student_check'),
					roles: ['Admin', 'Staff'],
				},
				{
					to: '/staff',
					icon: <GroupIcon style={{ width: '24px', height: '24px' }} />,
					label: t('staff'),
					roles: ['Admin'],
				},
				{
					to: '/profile',
					icon: <ProfileIcon style={{ width: '24px', height: '24px' }} />,
					label: t('profile'),
					roles: ['Student'],
				},
				{
					to: '/recruiter',
					icon: <UserPlusIcon style={{ width: '24px', height: '24px' }} />,
					label: t('recruiter'),
					roles: ['Admin', 'Staff', 'Student'],
				},
				{
					to: '/bookmarked',
					icon: <BookmarkIcon style={{ width: '24px', height: '24px' }} />,
					label: t('bookmarked'),
					roles: ['Recruiter'],
				},
				{
					to: '/settings',
					icon: <SettingsIcon style={{ width: '24px', height: '24px' }} />,
					label: t('settings'),
					roles: ['Admin', 'Staff', 'Recruiter', 'Student'],
				},
				{
					to: '/help',
					icon: <HelpIcon style={{ width: '24px', height: '24px' }} />,
					label: t('help'),
					roles: ['Admin', 'Staff', 'Recruiter', 'Student'],
				},
				{
					to: '/student-qa',
					icon: <QuestionIcon style={{ width: '24px', height: '24px' }} />,
					label: t('student_qa'),
					roles: ['Admin'],
				},
			],
		},
	]

	const { activeUser } = useContext(UserContext)
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [smallScreen, setSmallScreen] = useState(false)
	const [role] = useState(sessionStorage.getItem('role'))

	const [japanTime, setJapanTime] = useState('')
	const [uzbekistanTime, setUzbekistanTime] = useState('')

	const handleResize = () => {
		setSmallScreen(window.innerWidth > 768)
		setIsMenuOpen(window.innerWidth > 768)
	}

	const updateTime = () => {
		const now = new Date()
		const options = { hour: '2-digit', minute: '2-digit' }

		const japanTimeString = now.toLocaleTimeString('ja-JP', {
			...options,
			timeZone: 'Asia/Tokyo',
		})
		const uzbekistanTimeString = now.toLocaleTimeString('uz-UZ', {
			...options,
			timeZone: 'Asia/Tashkent',
		})

		setJapanTime(japanTimeString)
		setUzbekistanTime(uzbekistanTimeString)
	}

	useEffect(() => {
		window.addEventListener('resize', handleResize)
		handleResize()
		updateTime()
		const intervalId = setInterval(updateTime, 60000)
		return () => {
			window.removeEventListener('resize', handleResize)
			clearInterval(intervalId)
		}
	}, [])

	const handleNavButtonClick = () => {
		setIsMenuOpen(prevState => !prevState)
	}

	return (
		<div className={isMenuOpen ? style.menuOpen : style.menuClose}>
			<div className={style.topBar}>
				<div className={style.left}>
					<div className={style.logo}>
						<img src={logo} alt='Logo' width={40} />
						<div style={{ fontWeight: 700 }}>JDU Portfolio</div>
					</div>
				</div>

				<div className={style.right}>
					{/* header button */}
					<div className={style.navButton} onClick={handleNavButtonClick}>
						<MenuIcon style={{ width: '24px', height: '24px' }} />
					</div>
					<div className={style.topBarBox}>
						{/* language selector */}
						{/* <div className={style.languageSwitcher}>
							<select
								onChange={e => handleChangeLanguage(e.target.value)}
								defaultValue={language}
							>
								<option value='ja'>日本語</option>
								<option value='en'>English</option>
								<option value='uz'>O‘zbek</option>
							</select>
						</div> */}

						{/* TIME */}
						<div className={style.timeBox}>
							<div className={style.timeBoxCountry}>
								<div>{t('japan')}</div>/<div>{t('uzbekistan')}</div>
							</div>
							<div className={style.timeBoxCountry}>
								<div style={{ fontWeight: 600 }}>{japanTime}</div>/
								<div style={{ fontWeight: 600 }}>{uzbekistanTime}</div>
							</div>
						</div>

						{/* notifications */}
						{
							(role === 'Recruiter',
							'Admin',
							'Staff',
							'Student' && <Notifications />)
						}

						{/* USER IMAGE */}
						<div className={style.loginUser}>
							<UserAvatar
								photo={activeUser?.photo}
								name={activeUser?.name}
								studentId={activeUser?.studentId}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className={style.sideBar}>
				<header className={style.left}>
					<nav>
						{navItems.map((item, index) => (
							<ul key={'ul-' + index}>
								{/* <span className={style.navGroup}>
									{item.section}
								</span> */}
								{item.items
									.filter(item => checkRole(role, item.roles))
									.map((item, index) => (
										<li key={index}>
											<NavLink
												to={item.to}
												className={({ isActive }) =>
													isActive ? style.active : ''
												}
											>
												{item.icon}
												<div>{item.label}</div>
											</NavLink>
										</li>
									))}
							</ul>
						))}

						<ul onClick={() => setOpenLogoutModal(true)}>
							<li className={style.NavbarBottom}>
								<LogoutIcon
									style={{
										// transform: 'rotate(180deg)',
										width: '24px',
										height: '24px',
									}}
								/>
								<div>{t('logout')}</div>
							</li>
						</ul>
					</nav>
				</header>
				{isMenuOpen && !smallScreen && (
					<div
						className={style.overlay}
						onClick={e => {
							e.preventDefault()
							setIsMenuOpen(false)
						}}
					/>
				)}
				<main id={style.main}>
					<Outlet />
				</main>
			</div>
			<Modal open={openLogoutModal} onClose={() => setOpenLogoutModal(false)}>
				<div className={style.modalContent}>
					<h2>{t('logout')}</h2>
					<p>{t('Are_you_sure')}</p>
					<div className={style.modalButtons}>
						<button onClick={handleLogout} className={style.yesbutton}>
							{t('yesModal')}
						</button>
						<button
							onClick={() => setOpenLogoutModal(false)}
							className={style.nobutton}
						>
							{t('noModal')}
						</button>
					</div>
				</div>
			</Modal>
		</div>
	)
}

export default Layout
