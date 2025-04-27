import { Modal } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { UserContext } from '../../contexts/UserContext'
import translations from '../../locales/translations'
import UserAvatar from '../Table/Avatar/UserAvatar'
// icons
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LiveHelpOutlinedIcon from '@mui/icons-material/LiveHelpOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined'
import SearchSharpIcon from '@mui/icons-material/SearchSharp'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { ReactComponent as BookmarkIcon } from '../../assets/icons/bookmark.svg'
import { ReactComponent as NavButtonIcon } from '../../assets/icons/navButton.svg'
import { ReactComponent as ProfileIcon } from '../../assets/icons/profile.svg'
import Notifications from '../Notification/Notifications.jsx'
import style from './Layout.module.css'
import logo from '/src/assets/logo.png'

// Utility function to check roles
const checkRole = (role, allowedRoles) => {
	return allowedRoles.includes(role)
}

const Layout = () => {
	const [openLogoutModal, setOpenLogoutModal] = useState(false)
	const { language, changeLanguage } = useLanguage()
	const t = key => translations[language][key] || key
	
	const handleLogout = () => {
		sessionStorage.clear()
		window.location.href = '/login'
	}
	const navItems = [
		{
			section: 'GENERAL',
			items: [
				{
					to: '/',
					icon: <HomeOutlinedIcon fontSize='small'/>,
					label: t('home'),
					roles: ['Admin', 'Staff', 'Recruiter'],
				},
				{
					to: '/companyprofile',
					icon: <ProfileIcon />,
					label: t('profile'),
					roles: ['Recruiter'],
				},
				{
					to: '/student',
					icon: <SearchSharpIcon fontSize='small'/>,
					label: t('student_search'),
					roles: ['Admin', 'Staff', 'Recruiter'],
				},
				{
					to: '/checkprofile',
					icon: <PersonSearchOutlinedIcon fontSize='small'/>,
					label: t('student_check'),
					roles: ['Admin', 'Staff'],
				},
				{
					to: '/staff',
					icon: <GroupsOutlinedIcon fontSize='small'/>,
					label: t('staff'),
					roles: ['Admin'],
				},
				{
					to: '/profile',
					icon: <ProfileIcon />,
					label: t('profile'),
					roles: ['Student'],
				},
				{
					to: '/recruiter',
					icon: <PersonAddOutlinedIcon fontSize='small'/>,
					label: t('recruiter'),
					roles: ['Admin', 'Staff', 'Student'],
				},
				{
					to: '/bookmarked',
					icon: <BookmarkIcon />,
					label: t('bookmarked'),
					roles: ['Recruiter'],
				},
			],
		},
		{
			section: 'GENERAL',
			items: [
				{
					to: '/settings',
					icon: <SettingsOutlinedIcon  fontSize='small'/>,
					label: t('settings'),
					roles: ['Admin', 'Staff', 'Recruiter', 'Student'],
				},
				{
					to: '/help',
					icon: <InfoOutlinedIcon fontSize='small'/>,
					label: t('help'),
					roles: ['Admin', 'Staff', 'Recruiter', 'Student'],
				},
				{
					to: '/student-qa',
					icon: <LiveHelpOutlinedIcon fontSize='small'/>,
					label: t('student_qa'),
					roles: ['Admin'],
				},
			],
		},
	]

	const { activeUser } = useContext(UserContext)
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [smallScreen, setSmallScreen] = useState(false)
	const [, setUserData] = useState({})
	const [role, ] = useState(sessionStorage.getItem('role')) // Get role from sessionStorage

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
		setUserData(JSON.parse(sessionStorage.getItem('loginUser')))
		// Initial check
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

	const handleChangeLanguage = lng => {
		changeLanguage(lng)
	}

	return (
		<div className={isMenuOpen ? style.menuOpen : style.menuClose}>
			<div className={style.topBar}>

				<div className={style.left}>
					<div className={style.logo}>
						<img src={logo} alt='Logo' width={40}/>
						<div style={{fontWeight:700}}>JDU Portfolio</div>
					</div>
				</div>

				<div className={style.right}>
					<div className={style.navButton} onClick={handleNavButtonClick}>
						<NavButtonIcon />
					</div>
					<div className={style.topBarBox}>
						<div className={style.languageSwitcher}>
							{role != 'Recruiter' && <Notifications />}
						</div>
						<div className={style.languageSwitcher}>
							<select
								onChange={e => handleChangeLanguage(e.target.value)}
								defaultValue={language}
							>
								<option value='ja'>日本語</option>
								<option value='en'>English</option>
								<option value='uz'>O‘zbek</option>
							</select>
						</div>
						<div className={style.timeBox}>
							<div style={{ textAlign: 'right' }}>
								<div className={style.timeText}>{t('japan')}</div>
								<div className={style.time}>{japanTime}</div>
							</div>
							<svg
								width='13'
								height='32'
								viewBox='0 0 13 32'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
								style={{ margin: '0 4px' }}
							>
								<path
									d='M5.22727 14.3864V15.6364H0.136364V14.3864H5.22727ZM12.5866 14.3864V15.6364H7.49574V14.3864H12.5866Z'
									fill='#101828'
								/>
								<path
									d='M5.69886 17.8182L1.94886 31.75H0.431818L4.18182 17.8182H5.69886Z'
									fill='#101828'
								/>
								<path
									d='M10.7553 0.102272L7.70845 11.4219H6.47585L9.52273 0.102272H10.7553Z'
									fill='#667085'
								/>
							</svg>

							<div>
								<div className={style.timeText}>{t('uzbekistan')}</div>
								<div className={style.time}>{uzbekistanTime}</div>
							</div>
						</div>
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
								<span className={style.navGroup}>
									{item.section}
								</span>
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
								<LogoutOutlinedIcon style={{ transform: 'rotate(180deg)'}}/>
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
				<main className={style.right} id={style.main}>
					<Outlet />
				</main>
			</div>
			<Modal open={openLogoutModal} onClose={() => setOpenLogoutModal(false)}>
				<div className={style.modalContent}>
					<h2>{t('logout')}</h2>
					<p>{t('Are_you_sure')}</p>
					<div className={style.modalButtons}>
						<button onClick={handleLogout} className={style.yesbutton}>{t('yesModal')}</button>
						<button onClick={() => setOpenLogoutModal(false)} className={style.nobutton}>{t('noModal')}</button>
					</div>
				</div>
			</Modal>
		</div>
	)
}

export default Layout

