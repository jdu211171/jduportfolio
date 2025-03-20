import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications'
import axios from '../../utils/axiosUtils.js'
import { useState, useEffect, useRef } from 'react'
import { shortText } from '../functions.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import styles from './Notifications.module.css'
import CloseIcon from '@mui/icons-material/Close'

export default function Notifications() {
	const [isVisible, setIsVisible] = useState(false)
	const [modalIsVisible, setModalIsVisible] = useState(false)
	const [selectedMessage, setSelectedMessage] = useState(null)
	const [messages, setMessages] = useState([])
	const [userData, setUserData] = useState({
		students: [],
		staff: {},
		admin: {},
	})
	const [currentUser, setCurrentUser] = useState({})
	const [unreadCount, setUnreadCount] = useState(0)
	const [filter, setFilter] = useState('all')
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
					(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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

			console.log(`Filter: ${statusFilter}, Fetched Messages:`, fetchedMessages)
			setMessages(fetchedMessages)
			setUnreadCount(
				Array.isArray(fetchedMessages)
					? fetchedMessages.filter(msg => msg.status === 'unread').length
					: 0
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
			// Modal ochiq bo‘lsa va modal tashqarisiga bosilsa
			if (
				modalIsVisible &&
				modalRef.current &&
				!modalRef.current.contains(event.target)
			) {
				setModalIsVisible(false) // Faqat modal yopiladi
				return // Dropdownni yopishga o‘tmaydi
			}
			// Modal yopiq bo‘lsa va dropdown tashqarisiga bosilsa
			if (
				!modalIsVisible &&
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target) &&
				!event.target.closest(`.${styles.notificationIcon}`)
			) {
				setIsVisible(false) // Dropdown yopiladi
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [modalIsVisible]) // modalIsVisible holatini kuzatish uchun qo‘shildi

	const del = async id => {
		try {
			const response = await axios.delete(`/api/notification/${id}`)
			if (response.status === 200) {
				console.log("✅ Xabar muvaffaqiyatli o'chirildi!")
				fetchData(filter)
			} else {
				console.log("❌ Xabarni o'chirib bo'lmadi!")
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

	const handleClick = item => {
		const userRoles = {
			student: userData.students[item.user_id],
			staff: userData.staff[item.user_id],
			admin: userData.admin,
		}

		setCurrentUser({
			first_name: userRoles[item.user_role]?.first_name || 'Unknown',
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
					fontSize='large'
					className={styles.notificationIcon}
				/>
			</div>

			{isVisible && (
				<div ref={dropdownRef} className={styles.dropdown}>
					<div className={styles.dropdownArrow}></div>
					<div className={styles.headerZone}>Notifications</div>
					<div className={styles.filterTabs}>
						<button
							className={`${styles.filterButton} ${
								filter === 'all' ? styles.active : ''
							}`}
							onClick={() => setFilter('all')}
						>
							All
						</button>
						<button
							className={`${styles.filterButton} ${
								filter === 'unread' ? styles.active : ''
							}`}
							onClick={() => setFilter('unread')}
						>
							Unread
						</button>
						<button
							className={`${styles.filterButton} ${
								filter === 'read' ? styles.active : ''
							}`}
							onClick={() => setFilter('read')}
						>
							Read
						</button>
					</div>

					<div className={styles.mainPage}>
						{messages.length > 0 ? (
							messages.map(item => (
								<div
									key={item.id || Math.random()}
									onClick={() => handleClick(item)}
									className={`${styles.notificationItem} ${
										item.status === 'unread' ? styles.unread : ''
									}`}
								>
									<div className={styles.avatarContainer}>
										<img
											src={
												item.user_role === 'student'
													? userData.students[item.user_id]?.photo
													: item.user_role === 'staff'
														? userData.staff[item.user_id]?.photo
														: item.user_role === 'admin'
															? userData.admin.photo
															: 'https://via.placeholder.com/40'
											}
											alt='User Avatar'
											className={styles.avatar}
										/>
										<div className={styles.messageContainer}>
											<div>{shortText(item.message, 28)}</div>
											<div>{shortText(item.createdAt, 10, true)}</div>
										</div>
									</div>
									{item.status === 'unread' && (
										<div className={styles.newIndicator}>NEW</div>
									)}
								</div>
							))
						) : (
							<div className={styles.noNotifications}>
								No{' '}
								{filter === 'all'
									? 'notifications'
									: filter === 'unread'
										? 'unread notifications'
										: 'read notifications'}{' '}
								yet...
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
						{/* <div className={styles.modalHeader}>
							<img
								className={styles.modalAvatar}
								src={currentUser.photo}
								alt='User'
							/>
							<div>
								<h2 className={styles.userName}>
									{currentUser.first_name} {currentUser.last_name}
								</h2>
								<p className={styles.userRole}>{selectedMessage.user_role}</p>
							</div>
						</div> */}
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
								OK
							</button>
							<button
								className={styles.deleteButton}
								onClick={() => del(selectedMessage.id)}
							>
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
