import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications'
import axios from '../../utils/axiosUtils.js'
import { useState, useEffect } from 'react'
import { shortText } from '../functions.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import styles from './Notifications.module.css'

export default function Notifications() {
	const [isVisible, setIsVisible] = useState(false)
	const [modalIsVisible, setModalIsVisible] = useState(false)
	const [selectedMessage, setSelectedMessage] = useState(null)
	const [isMessages, setIsMessages] = useState([])
	const [isStudents, setIsStudents] = useState([])
	const [isStaff, setIsStaff] = useState({})
	const [isAdmin, setIsAdmin] = useState({})
	const [isCurrent, setIsCurrent] = useState({})
	const [count, setIscount] = useState(0)

	const del = async id => {
		try {
			const response = await axios.delete('/api/notification/' + id)

			if (response.status === 200) {
				console.log({ message: "✅ Xabar muvaffaqiyatli o'chirildi!" })
				fetchData()
			} else {
				console.log({ message: "❌ Xabarni o'chirib bo'lmadi!" })
			}
		} catch (error) {
			console.log({ message: `❌ Xatolik: ${error}` })
		}
		setModalIsVisible(false)
	}

	const fetchData = async () => {
		try {
			const [messagesRes, recruitersRes, staffRes, adminRes] =
				await Promise.all([
					axios.get('/api/notification'),
					axios.get('/api/students'),
					axios.get('/api/staff'),
					axios.get('/api/admin/1'),
				])

			setIsMessages(messagesRes.data)
			setIsStudents(recruitersRes.data)
			setIsStaff(staffRes.data)
			setIsAdmin(adminRes.data)
		} catch (error) {
			console.error('Xatolik yuz berdi: ', error)
		}
	}
	useEffect(() => {
		fetchData()
	}, [])

	useEffect(() => {
		setIscount(
			isMessages?.filter(message => message.status === 'unread').length || 0
		)
	}, [isMessages])

	const click = item => {
		const userRoles = {
			student: isStudents[item.user_id],
			staff: isStaff[item.user_id],
			admin: isAdmin,
		}

		if (userRoles[item.user_role]) {
			setIsCurrent({
				first_name: userRoles[item.user_role].first_name,
				last_name: userRoles[item.user_role].last_name,
				photo: userRoles[item.user_role].photo,
			})
		}

		setSelectedMessage(item)
		setModalIsVisible(true)
	}

	const FchangeStatus = async message => {
		if (message.status === 'unread') {
			setIscount(count - 1)
			setModalIsVisible(false)
		} else {
			setModalIsVisible(false)
		}
	}

	return (
		<div className={styles.notificationContainer}>
			<div onClick={() => setIsVisible(!isVisible)}>
				{count > 0 && (
					<span className={styles.notificationBadge}>
						{count > 99 ? '99+' : count}
					</span>
				)}
				<CircleNotificationsIcon
					fontSize='large'
					className={styles.notificationIcon}
				/>
			</div>

			{isVisible && (
				<div className={styles.dropdown}>
					<div className={styles.dropdownArrow}></div>

					<div className={styles.headerZone}>
						<div>Notifications</div>
					</div>
					<div className={styles.mainPage}>
						{isMessages.length !== 0 ? (
							isMessages.map((item, ind) => (
								<div
									onClick={() => {
										click(item)
									}}
									key={ind}
									className={styles.notificationItem}
								>
									<div className={styles.avatarContainer}>
										<img
											src={
												item.user_role === 'student'
													? isStudents[item.user_id]?.photo
													: item.user_role === 'staff'
														? isStaff[item.user_id]?.photo
														: item.user_role === 'admin'
															? isAdmin.photo
															: ''
											}
											alt={item.image}
											className={styles.avatar}
										/>
										<div className={styles.messageContainer}>
											<div
												className={
													item.status === 'unread' ? styles.unread : ''
												}
											>
												{shortText(item.message, 28)}
											</div>
											<div>{shortText(item.createdAt, 10, true)}</div>
										</div>
									</div>

									{item.status === 'unread' ? (
										<div className={styles.newIndicator}>NEW</div>
									) : (
										''
									)}
								</div>
							))
						) : (
							<div className={styles.noNotifications}>
								No notifications yet...
							</div>
						)}
					</div>
				</div>
			)}
			{modalIsVisible && selectedMessage && (
				<div className={styles.modal}>
					<div className={styles.modalContent}>
						<div className={styles.modalHeader}>
							<img
								className={styles.modalAvatar}
								src={isCurrent?.photo || 'https://via.placeholder.com/80'}
								alt='User'
							/>
							<div>
								<h2 className={styles.userName}>
									{isCurrent?.first_name} {isCurrent?.last_name}
								</h2>
								<p className={styles.userRole}>{selectedMessage?.user_role}</p>
							</div>
						</div>

						<div className={styles.messageBody}>
							<p className={styles.messageText}>{selectedMessage?.message}</p>
							<p className={styles.messageDate}>
								📅 {shortText(selectedMessage?.createdAt, 10, true)}
							</p>
						</div>

						<div className={styles.modalFooter}>
							<button
								onClick={() => FchangeStatus(selectedMessage)}
								className={styles.okButton}
							>
								OK
							</button>
							<button
								className={styles.deleteButton}
								onClick={() => {
									del(selectedMessage.id)
								}}
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
