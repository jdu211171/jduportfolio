import LaunchIcon from '@mui/icons-material/Launch'
import { Button, Chip, CircularProgress, IconButton } from '@mui/material'
import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'
import axios from '../../utils/axiosUtils'
import styles from './NewsForUsers.module.css'

export const NewsForUsers = () => {
	// const { id } = useContext(UserContext)
	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	// State management
	const [newsData, setNewsData] = useState([])
	const [loading, setLoading] = useState(false)
	const [loadingMarkAsRead, setloadingMarkAsRead] = useState(false)
	// scroll variant: no expand state needed

	// Fetch news data from API
	const fetchNews = async () => {
		setLoading(true)

		try {
			const response = await axios.get('/api/news-views/with-status')
			const data = response.data

			setNewsData(Array.isArray(data) ? data : data.news || [])
		} catch (err) {
			console.error('Error fetching news:', err)
		} finally {
			setLoading(false)
		}
	}
	const markAsRead = async id => {
		setloadingMarkAsRead(true)
		try {
			const response = await axios.post(`/api/news-views/${id}/read`)
			const data = response.data
		} catch (err) {
			console.error('Error fetching news:', err)
		} finally {
			fetchNews()
			setloadingMarkAsRead(false)
		}
	}
	// Load news on component mount
	useEffect(() => {
		fetchNews()
	}, [])

	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '400px',
					backgroundColor: '#f5f7fa',
				}}
			>
				<CircularProgress size={40} />
			</div>
		)
	}

	if (newsData.length === 0) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '400px',
					backgroundColor: '#f5f7fa',
					color: '#7f8c8d',
					fontSize: '18px',
				}}
			>
				{t('noNewsAvailable')}
			</div>
		)
	}

	return (
		<div>
			{/* Header Section */}
			<div
				style={{
					textAlign: 'center',
					marginBottom: '40px',
				}}
			>
				<h1
					style={{
						fontSize: 'clamp(28px, 5vw, 36px)',
						fontWeight: 'bold',
						color: '#2c3e50',
						margin: '0 0 7px 0',
					}}
				>
					{t('newsHighlights') || 'Latest News'}
				</h1>
				<p
					style={{
						fontSize: 'clamp(14px, 2vw, 16px)',
						color: '#7f8c8d',
					}}
				>
					{t('checkOut')}
				</p>
			</div>

			{/* News Grid */}
			<div className={styles.grid}>
				{newsData.map((news, index) => {
					const itemKey = news.id ?? `i-${index}`
					return (
						<div key={itemKey} className={styles.card}>
							{/* Image Section */}
							<div className={styles.image}>
								{news.image_url ? (
									<img
										className={styles.img}
										src={news.image_url}
										alt={news.title}
									/>
								) : (
									<div className={styles.noImage}>{t('noImageAvailable')}</div>
								)}
							</div>

							{/* Content Section */}
							<div className={styles.content}>
								{/* Title */}
								<h2 className={styles.title}>{news.title}</h2>

								{/* Description scroll variant */}
								<div className={styles.descScroll}>
									<p className={styles.descText}>{news.description}</p>
								</div>

								{/* Hashtags */}
								{news.hashtags &&
									Array.isArray(news.hashtags) &&
									news.hashtags.length > 0 && (
										<div className={styles.tags}>
											{news.hashtags.slice(0, 3).map((hashtag, idx) => (
												<Chip
													key={idx}
													label={hashtag}
													size='small'
													style={{
														backgroundColor: '#e3f2fd',
														color: '#1976d2',
														fontSize: '12px',
													}}
												/>
											))}
										</div>
									)}

								{/* Footer */}
								<div className={styles.footer}>
									<div className={styles.meta}>
										<span className={styles.date}>
											{news.createdAt?.split('T')[0]}
										</span>
										<span className={styles.type}>{news.type}</span>
									</div>
									<div>
										<Button
											variant='contained'
											style={{ marginRight: 8 }}
											disabled={news.isViewed}
											onClick={() => markAsRead(news.id)}
										>
											{loadingMarkAsRead
												? t('loading')
												: news.isViewed
													? t('readed')
													: t('mark_as_read')}
										</Button>
										{news.source_link && (
											<IconButton
												className={styles.linkButton}
												component='a'
												href={news.source_link}
												target='_blank'
												rel='noopener noreferrer'
												size='small'
											>
												<LaunchIcon style={{ fontSize: '16px' }} />
											</IconButton>
										)}
									</div>
									{/* Source Link */}
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
