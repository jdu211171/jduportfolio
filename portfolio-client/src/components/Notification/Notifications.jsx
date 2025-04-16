import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications'
import CheckIcon from '@mui/icons-material/Check'
import axios from '../../utils/axiosUtils.js'
import { useState, useEffect, useRef } from 'react'
import { shortText } from '../functions.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import styles from './Notifications.module.css'
import translations from '../../locales/translations.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'
import CloseIcon from '@mui/icons-material/Close'

export default function Notifications() {
	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	const [isVisible, setIsVisible] = useState(false)
	const [modalIsVisible, setModalIsVisible] = useState(false)
	const [selectedMessage, setSelectedMessage] = useState(null)
	const [messages, setMessages] = useState([])
	const [userData,] = useState({
		students: [],
		staff: {},
		admin: {},
	})
	const [, setCurrentUser] = useState({})
	const [unreadCount, setUnreadCount] = useState(0)
	const [filter, setFilter] = useState('all')
	const [isLoading, setIsLoading] = useState(false)
	const modalRef = useRef(null)
	const dropdownRef = useRef(null)

	const fetchData = async (statusFilter = 'all') => {
		try {
			let fetchedMessages = []
			if (statusFilter === 'all') {
				const [unreadRes, readRes] = await Promise.all([
					axios.get('/api/notification/user').catch(() => ({ data: [] })),
					axios
						.get('/api/notification/history')
						.catch(() => ({ data: { notifications: [] } })),
				])
				const unreadData = Array.isArray(unreadRes.data) ? unreadRes.data : []
				const readData = Array.isArray(readRes.data.notifications)
					? readRes.data.notifications
					: []
				fetchedMessages = [...unreadData, ...readData].sort(
					(a, b) => new Date(b.createdAt) - new Date(a.createdAt),
				)
			} else if (statusFilter === 'unread') {
				const unreadRes = await axios
					.get('/api/notification/user')
					.catch(() => ({ data: [] }))
				fetchedMessages = Array.isArray(unreadRes.data) ? unreadRes.data : []
			} else if (statusFilter === 'read') {
				const readRes = await axios
					.get('/api/notification/history')
					.catch(() => ({ data: { notifications: [] } }))
				fetchedMessages = Array.isArray(readRes.data.notifications)
					? readRes.data.notifications
					: []
			}
			setMessages(fetchedMessages)
			setUnreadCount(
				Array.isArray(fetchedMessages)
					? fetchedMessages.filter(msg => msg.status === 'unread').length
					: 0,
			)
		} catch (error) {
			console.error('Xatolik yuz berdi:', error)
			setMessages([])
			setUnreadCount(0)
		}
	}

	useEffect(() => {
		fetchData(filter)
	}, [filter])

	useEffect(() => {
		const handleClickOutside = event => {
			if (
				modalIsVisible &&
				modalRef.current &&
				!modalRef.current.contains(event.target)
			) {
				setModalIsVisible(false)
				return
			}
			if (
				!modalIsVisible &&
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target) &&
				!event.target.closest(`.${styles.notificationIcon}`)
			) {
				setIsVisible(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [modalIsVisible])

	const del = async id => {
		try {
			const response = await axios.delete(`/api/notification/${id}`)
			if (response.status === 200) {
				console.log('✅ Xabar muvaffaqiyatli o\'chirildi!')
				fetchData(filter)
			} else {
				console.log('❌ Xabarni o\'chirib bo\'lmadi!')
			}
		} catch (error) {
			console.error('Xatolik:', error)
		}
		setModalIsVisible(false)
	}

	const markAsRead = async notificationId => {
		try {
			await axios.patch(`/api/notification/${notificationId}/read`)
			fetchData(filter)
		} catch (error) {
			console.error('Xatolik yuz berdi:', error)
		}
	}

	const markAllAsRead = async () => {
		setIsLoading(true)
		try {
			const response = await axios.patch('/api/notification/read-all')
			if (response.status === 200) {
				console.log('✅ Hammasi o‘qilgan deb belgilandi!')
				fetchData(filter)
			}
		} catch (error) {
			console.error('Xatolik yuz berdi:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleClick = item => {
		const userRoles = {
			student: userData.students[item.user_id],
			staff: userData.staff[item.user_id],
			admin: userData.admin,
		}
		setCurrentUser({
			first_name: userRoles[item.user_role]?.first_name || 'Noma’lum',
			last_name: userRoles[item.user_role]?.last_name || '',
			photo:
				userRoles[item.user_role]?.photo || 'https://via.placeholder.com/80',
		})
		setSelectedMessage(item)
		setModalIsVisible(true)
		if (item.status === 'unread') markAsRead(item.id)
	}

	return (
		<div className={styles.notificationContainer}>
			<div onClick={() => setIsVisible(!isVisible)}>
				{unreadCount > 0 && (
					<span className={styles.notificationBadge}>
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				)}
				<CircleNotificationsIcon
					fontSize="large"
					className={styles.notificationIcon}
				/>
			</div>

			{isVisible && (
				<div ref={dropdownRef} className={styles.dropdown}>
					<div className={styles.dropdownArrow}></div>
					<div
						className={styles.headerZone}
						style={{ backgroundColor: '#4682B4' }}
					>
						<span>{t('notifications')}</span>
						{unreadCount > 0 && (
							<button
								className={styles.markAllButton}
								onClick={markAllAsRead}
								disabled={isLoading}
								aria-label={t('mark_all_read')}
							>
								{isLoading ? (
									t('loading')
								) : (
									<>
										<CheckIcon
											fontSize="small"
											style={{ marginRight: '4px' }}
										/>
										{t('mark_all_read')}
									</>
								)}
							</button>
						)}
					</div>
					<div className={styles.filterTabs}>
						<button
							className={`${styles.filterButton} ${
								filter === 'all' ? styles.active : ''
							}`}
							onClick={() => setFilter('all')}
						>
							{t('all')}
						</button>
						<button
							className={`${styles.filterButton} ${
								filter === 'unread' ? styles.active : ''
							}`}
							onClick={() => setFilter('unread')}
						>
							{t('unread')}
						</button>
						<button
							className={`${styles.filterButton} ${
								filter === 'read' ? styles.active : ''
							}`}
							onClick={() => setFilter('read')}
						>
							{t('read')}
						</button>
					</div>

					<div className={styles.mainPage}>
						{messages.length > 0 ? (
							messages.map(item => (
								<div
									onClick={() => handleClick(item)}
									className={`${styles.notificationItem} ${item.status === 'unread' ? styles.unread : ''}`}
								>
									<div className={styles.messageContainer}>
										<div>{shortText(item.message, 28)}</div>
										<div>{shortText(item.createdAt, 10, true)}</div>
									</div>
									{item.status === 'unread' && (
										<div className={styles.newIndicator}>{t('new')}</div>
									)}
								</div>
							))
						) : (
							<div className={styles.noNotifications}>
								{filter === 'all'
									? t('no_notifications')
									: filter === 'unread'
										? t('no_unread_notifications')
										: t('no_read_notifications')}
							</div>
						)}
					</div>
				</div>
			)}

			{modalIsVisible && selectedMessage && (
				<div className={styles.modal}>
					<div ref={modalRef} className={styles.modalContent}>
						<button
							className={styles.closeButton}
							onClick={() => setModalIsVisible(false)}
						>
							<CloseIcon />
						</button>
						<div className={styles.messageBody}>
							<p className={styles.messageText}>{selectedMessage.message}</p>
							<p className={styles.messageDate}>
								📅 {shortText(selectedMessage.createdAt, 10, true)}
							</p>
						</div>
						<div className={styles.modalFooter}>
							<button
								className={styles.okButton}
								onClick={() => setModalIsVisible(false)}
							>
								{t('ok')}
							</button>
							<button
								className={styles.deleteButton}
								onClick={() => del(selectedMessage.id)}
							>
								<FontAwesomeIcon icon={faTrash} /> {t('delete')}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
