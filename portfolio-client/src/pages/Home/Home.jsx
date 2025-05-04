import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Box, Button } from '@mui/material'
import 'swiper/css'
import 'swiper/css/pagination'
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import jduPhoto1 from '../../assets/jduPhoto1.jpg'
import jduPhoto2 from '../../assets/jduPhoto2.jpg'
import jduPhoto3 from '../../assets/jduPhoto3.jpg'
import jduPhoto4 from '../../assets/jduPhoto4.jpg'
import jduPhoto5 from '../../assets/jduPhoto5.jpg'
import jduPhoto6 from '../../assets/jduPhoto6.jpg'
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor'
import { useAlert } from '../../contexts/AlertContext'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'
import axios from '../../utils/axiosUtils'
import styles from './Home.module.css'
const footerData = [
	{
		date: 'April 25, 2025',
		title: 'Spring Orientation Session',
		discription:
			'Welcome event for new students joining this semester from both Japan and Uzbekistan.',
	},
	{
		date: 'May 10, 2025',
		title: 'Japanese Culture Festival',
		discription:
			'Annual cultural exchange event showcasing traditional Japanese arts and modern culture.',
	},
	{
		date: 'May 15, 2025',
		title: 'Industry Career Fair',
		discription:
			'Connect with Japanese companies offering career opportunities.',
	},
]

const carouselItems1 = [
	{
		alt: 'Tabiat manzarasi',
		imageUrl: jduPhoto1,
	},
	{
		alt: 'Shahar ko‘rinishi',
		imageUrl: jduPhoto3,
	},
	{
		alt: 'Dengiz bo‘yi',
		imageUrl: jduPhoto2,
	},
]
const carouselItems2 = [
	{
		alt: 'Tabiat manzarasi',
		imageUrl: jduPhoto4,
	},
	{
		alt: 'Shahar ko‘rinishi',
		imageUrl: jduPhoto5,
	},
	{
		alt: 'Dengiz bo‘yi',
		imageUrl: jduPhoto6,
	},
]

const Home = () => {
	const navigate = useNavigate()
	const { language } = useLanguage()
	const t = key => translations[language][key] || key
	const [role, setRole] = useState(null)
	const [editData, setEditData] = useState('')
	const [editMode, setEditMode] = useState(false)
	const showAlert = useAlert()
	const fetchHomePageData = async () => {
		const userRole = sessionStorage.getItem('role')
		setRole(userRole)
		try {
			const response = await axios.get('/api/settings/homepage')
			setEditData(response.data.value)
		} catch (error) {
			console.error('Error fetching homepage data:', error)
		}
	}

	const handleContentChange = newContent => {
		setEditData(newContent)
	}

	const handleClick = () => {
		navigate('/student')
	}

	const toggleEditMode = () => {
		setEditMode(prev => !prev)
	}

	const handleCancel = () => {
		fetchHomePageData()
		setEditMode(false)
	}

	const handleSave = async () => {
		try {
			const response = await axios.put(`/api/settings/homepage`, {
				value: editData,
			})

			if (response.status === 200) {
				setEditMode(false)
				showAlert(t('changes_saved'), 'success')
			}
		} catch (error) {
			console.error('Error updating homepage data:', error)
		}
	}

	const cleanHtmlContent = html => {
		if (!html) return ''

		const tempDiv = document.createElement('div')
		tempDiv.innerHTML = html

		const paragraphs = tempDiv.querySelectorAll('p')

		paragraphs.forEach(p => {
			const span = document.createElement('span')
			span.innerHTML = p.innerHTML
			p.parentNode.replaceChild(span, p)
		})

		return tempDiv.innerHTML
	}

	useEffect(() => {
		fetchHomePageData()
	}, [])

	return (
		<div key={language}>
			<Box className={styles.header}>
				<Box display={'flex'} gap={'10px'}>
					{role === 'Admin' && (
						<>
							{editMode ? (
								<>
									<Button
										sx={{
											backgroundColor: '#6A0DAD',
											borderRadius: '10px',
											fontWeight: 600,
										}}
										onClick={handleSave}
										variant='contained'
										size='small'
									>
										{t('save')}
									</Button>

									<Button
										sx={{ borderRadius: '10px', fontWeight: 600 }}
										onClick={handleCancel}
										variant='outlined'
										color='error'
										size='small'
									>
										{t('cancel')}
									</Button>
								</>
							) : (
								<Button
									onClick={toggleEditMode}
									variant='contained'
									sx={{
										backgroundColor: '#6A0DAD',
										borderRadius: '10px',
										fontWeight: 600,
									}}
									size='small'
								>
									{t('edit')}
								</Button>
							)}
						</>
					)}
				</Box>
			</Box>
			<div className={styles.container}>
				<div className={styles.main}>
					<img
						src='https://b4.3ddd.ru/media/cache/sky_gallery_big_resize/gallery_images/582249d33ca6a.jpeg'
						alt='universty photo'
						style={{ objectFit: 'cover' }}
					/>
					<div className={styles.gradientOverlay}>
						{editMode && (
							<RichTextEditor value={editData} onChange={handleContentChange} />
						)}
						{!editMode && (
							<p
								className={styles.discription}
								dangerouslySetInnerHTML={{ __html: cleanHtmlContent(editData) }}
							></p>
						)}
						<button className={styles.button} onClick={handleClick}>
							{t('next_button')}
						</button>
					</div>
				</div>

				<div className={styles.carousels}>
					<div style={{ maxWidth: '450px' }} className={styles.carousel1}>
						<Swiper
							spaceBetween={20}
							slidesPerView={1}
							autoplay={{
								delay: 2500,
								disableOnInteraction: false,
							}}
							pagination={{
								dynamicBullets: true,
							}}
							modules={[Autoplay, Pagination]}
							className='mySwiper'
						>
							{carouselItems1.map((item, ind) => (
								<SwiperSlide key={ind}>
									<img
										src={item.imageUrl}
										alt={item.alt}
										height={300}
										style={{ borderRadius: 20 }}
									/>
								</SwiperSlide>
							))}
						</Swiper>
					</div>

					<div className={styles.carousel2}>
						<Swiper
							style={{ width: '100%', maxWidth: '250px' }}
							spaceBetween={20}
							slidesPerView={1}
							autoplay={{
								delay: 2500,
								disableOnInteraction: false,
							}}
							pagination={{
								dynamicBullets: true,
							}}
							modules={[Autoplay, Pagination]}
							className={`mySwiper' ${styles.mySwiper}`}
						>
							{carouselItems2.map((item, ind) => (
								<SwiperSlide key={ind} className={styles.swiperslide2}>
									<img
										src={item.imageUrl}
										alt={item.alt}
										height={300}
										style={{ borderRadius: 20 }}
									/>
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				</div>

				<div className={styles.mainImages}>
					<div className={styles.mainImage}>
						<div
							style={{ fontWeight: 600, fontSize: '22px', textAlign: 'center' }}
						>
							私たちの大学
						</div>
						<div style={{ minWidth: '100%' }}>
							ウズベキスタンに設立し運営している正式な私立大学です。ウズベキスタンにあるサテライトキャンパスをJDUと呼びます。ウズベキスタンの学生は、提携している日本の大学の授業にオンラインで参加し、日本の大学の試験を経て単位取得、卒業を目指します。（日本とウズベキスタン両国の学位を取得して卒業することが可能です）卒業時には日本企業への就職を目指し、毎年に数多くの学生が入学しています。
						</div>
					</div>
					<div className={styles.mainImage}>
						<div
							style={{ fontWeight: 600, fontSize: '22px', textAlign: 'center' }}
						>
							About Our University
						</div>
						<div>
							Japan Digital University is an official private university
							established and operated in Uzbekistan. We call our satellite
							campus in Uzbekistan JDU. Students in Uzbekistan participate in
							classes at affiliated Japanese universities online, take exams at
							Japanese universities, and aim to earn credits and graduate. (It
							is possible to graduate with degrees from both Japan and
							Uzbekistan.) Upon graduation, students aim to find employment at
							Japanese companies, and many students enroll every year.
						</div>
					</div>
				</div>
			</div>
			<div className={styles.footer}>
				<div style={{ fontSize: '20px', fontWeight: 700 }}>Upcoming Events</div>
				<div className={styles.cards}>
					{footerData.map((item, ind) => (
						<div key={ind} className={styles.card}>
							<div
								style={{ fontSize: '17px', fontWeight: 500, color: '#6A0DAD' }}
							>
								{item.date}
							</div>
							<div
								style={{
									fontSize: '17px',
									fontWeight: 600,
									marginBlockStart: '5px',
								}}
							>
								{item.title}
							</div>
							<div
								style={{
									fontSize: '14px',
									marginBlockStart: '5px',
									color: '#6B7280',
								}}
							>
								{item.discription}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default Home
