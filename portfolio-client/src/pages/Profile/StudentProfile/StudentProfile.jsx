import React, { useEffect, useState } from 'react'
import {
	useParams,
	useNavigate,
	useLocation,
	Outlet,
	NavLink,
} from 'react-router-dom'
import axios from '../../../utils/axiosUtils'
import { Box, Typography, IconButton, Chip, Avatar, Grid } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EmailIcon from '@mui/icons-material/Email'
import styles from './StudentProfile.module.css'
import translations from '../../../locales/translations'
import { useContext } from 'react'
import { UserContext } from '../../../contexts/UserContext'

const StudentProfile = ({ userId = 0 }) => {
	const { studentId } = useParams()
	const { language } = useContext(UserContext)
	const t = translations[language] || translations.en
	let id
	if (userId != 0) {
		id = userId
	} else {
		id = studentId
	}
	const role = sessionStorage.getItem('role')

	const navigate = useNavigate()
	const location = useLocation()
	const [student, setStudent] = useState(null)

	useEffect(() => {
		const fetchStudent = async () => {
			try {
				const response = await axios.get(`/api/students/${id}`)
				setStudent(response.data)
			} catch (error) {
				showAlert('Error fetching student data', 'error')
			}
		}

		if (id) {
			fetchStudent()
		}
	}, [id])

	const handleBackClick = () => {
		const isRootPath = location.pathname.endsWith('/top')
		if (isRootPath) {
			if (location.pathname.startsWith('/checkprofile')) {
				navigate('/checkprofile')
			} else {
				navigate('/student')
			}
		} else {
			navigate(-1)
		}
	}

	const calculateAge = birthDateString => {
		const today = new Date()
		const birthDate = new Date(birthDateString)
		let age = today.getFullYear() - birthDate.getFullYear()
		const monthDifference = today.getMonth() - birthDate.getMonth()

		if (
			monthDifference < 0 ||
			(monthDifference === 0 && today.getDate() < birthDate.getDate())
		) {
			age--
		}

		return age
	}

	if (!student) {
		return <div>Loading...</div>
	}

	return (
		<Box
			sx={{
				borderRadius: '10px',
			}}
		>
			<Box className={styles.topControlButtons}>
				{role !== 'Student' && (
					<Box
						display='flex'
						alignItems='center'
						sx={{
							border: 1,
							borderRadius: 1,
							borderColor: 'grey.300',
							flexGrow: 1,
						}}
					>
						<IconButton onClick={handleBackClick}>
							<ArrowBackIcon />
						</IconButton>
						| {t.back}
					</Box>
				)}
			</Box>
			<Box className={styles.container}>
				<Box className={styles.avatarContainer}>
					<Avatar
						src={student.photo}
						alt={student.first_name}
						sx={{ width: 120, height: 120 }}
					/>
				</Box>
				<Box className={styles.infoContainer}>
					<Box className={styles.nameEmailContainer}>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
							{/* name and lastname */}
							<div style={{ fontSize: 20, fontWeight: 500 }}>
								{student.first_name} {student.last_name}
							</div>
							{/* student id and birthday */}
							<div style={{ display: 'flex', gap: 10 }}>
								<div style={{ display: 'flex' }}>
									<div style={{ color: '#787878' }}>{t.student_id}:</div>
									<div>{student.student_id}</div>
								</div>
								<div style={{ display: 'flex' }}>
									<div style={{ color: '#787878' }}>{t.age}:</div>
									<div>{calculateAge(student.date_of_birth)}</div>
								</div>
							</div>
							{/* JLPT and sotsugyou */}
							<div style={{ display: 'flex', gap: 10 }}>
								<div style={{ display: 'flex' }}>
									<div style={{ color: '#787878' }}>jlpt tarjima:</div>
									<div>{JSON.parse(student.jlpt).highest}</div>
								</div>
								<div style={{ display: 'flex' }}>
									<div style={{ color: '#787878' }}>卒業見込み:</div>
									<div>{calculateAge(student.date_of_birth)}</div>
								</div>
							</div>
						</Box>
						{['Admin', 'Staff', 'Student'].includes(role) && (
							<Box>
								<a href={`mailto:${student.email}`} className={styles.email}>
									<EmailIcon className={styles.emailIcon} />
									{student.email}
								</a>
								<Box className={styles.statusChipContainer}>
									<div>
										{student.visibility ? (
											<div style={{ color: '#7ED6A7' }}>{t.published}</div>
										) : (
											<div style={{ color: '#812958' }}>{t.private}</div>
										)}
									</div>
									<Box id='saveButton'></Box>
								</Box>
							</Box>
						)}
					</Box>
				</Box>
			</Box>
			{/* <Box className={styles.navbar}>
				<NavLink
					to={`top`}
					state={{ userId: userId }}
					className={({ isActive }) => (isActive ? styles.active : '')}
				>
					{t.top}
				</NavLink>
				<NavLink
					to={`qa`}
					state={{ userId: userId }}
					className={({ isActive }) => (isActive ? styles.active : '')}
				>
					{t.qa}
				</NavLink>
				<NavLink
					to={`stats`}
					state={{ userId: userId }}
					className={({ isActive }) => (isActive ? styles.active : '')}
					style={{ minWidth: '130px' }}
				>
					{t.stats}
				</NavLink>
			</Box> */}
			<Outlet />
		</Box>
	)
}

export default StudentProfile
