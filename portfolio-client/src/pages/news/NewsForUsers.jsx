import LaunchIcon from '@mui/icons-material/Launch'
import { Button, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'
import axios from '../../utils/axiosUtils'
import styles from './NewsForUsers.module.css'
function shortText(text, count = 100) {
  if (text.length > count) {
    return text.slice(0, count) + "...";
  }
  return text;
}
export const NewsForUsers = () => {
	// const { id } = useContext(UserContext)
	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	// State management
	const [newsData, setNewsData] = useState([])
	const [loading, setLoading] = useState(false)
	const [loadingMarkAsRead, setloadingMarkAsRead] = useState(false)
	const [selectedNews, setSelectedNews] = useState(null)
	const [dialogOpen, setDialogOpen] = useState(false)
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
			console.error('Error marking news as read:', err)
		} finally {
			fetchNews()
			// Dispatch custom event to notify Layout component about news count change
			window.dispatchEvent(new CustomEvent('newsCountChanged'))
			setloadingMarkAsRead(false)
			setDialogOpen(false)
		}
	}

	const handleNewsClick = (news) => {
		setSelectedNews(news)
		setDialogOpen(true)
	}

	const handleCloseDialog = () => {
		setDialogOpen(false)
		setSelectedNews(null)
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
					const isUnread = !news.isViewed
					return (
						<div 
							key={itemKey} 
							className={`${styles.card} ${isUnread ? styles.cardUnread : ''}`}
							onClick={() => handleNewsClick(news)}
						>
							{/* Unread Badge */}
							{isUnread && <div className={styles.unreadBadge}></div>}

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
								<h2 className={styles.title}>{shortText(news.title, 65)}</h2>

								{/* Description scroll variant */}
								<div className={styles.descScroll}>
									<p className={styles.descText}>{shortText(news.description, 110)}</p>
								</div>
								<div className={styles.meta}>
									<span className={styles.date}>
										{news.createdAt?.split('T')[0]}
									</span>
									<span className={styles.type}>{news.type}</span>
								</div>

								{/* Hashtags
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
														color: '#5627dc',
														fontSize: '12px',
													}}
												/>
											))}
										</div>
									)} */}

								{/* Footer */}
								{/* <div className={styles.footer}>
									<div className={styles.meta}>
										<span className={styles.date}>
											{news.createdAt?.split('T')[0]}
										</span>
										<span className={styles.type}>{news.type}</span>
									</div>
									<div>
										{news.source_link && (
											<IconButton
												className={styles.linkButton}
												component='a'
												href={news.source_link}
												target='_blank'
												rel='noopener noreferrer'
												size='small'
												onClick={(e) => e.stopPropagation()}
											>
												<LaunchIcon style={{ fontSize: '16px' }} />
											</IconButton>
										)}
									</div>
								</div> */}
							</div>
						</div>
					)
				})}
			</div>

			{/* News Detail Dialog */}
			<Dialog 
				open={dialogOpen} 
				onClose={handleCloseDialog}
				maxWidth="lg"
				fullWidth
				PaperProps={{
					style: {
						borderRadius: '16px',
						maxHeight: '90vh'
					}
				}}
			>
				<DialogTitle 
					style={{ 
						paddingBottom: '8px',
						fontSize: '18px',
						fontWeight: 600,
						color: '#2c3e50'
					}}
				>
					{t('newsDetails') || 'News Details'}
				</DialogTitle>
				<DialogContent className={styles.dialogContent}>
					{selectedNews && (
						<div>
							{/* Image */}
							{selectedNews.image_url && (
								<img 
									src={selectedNews.image_url} 
									alt={selectedNews.title}
									className={styles.dialogImage}
								/>
							)}

							{/* Title */}
							<h1 className={styles.dialogTitle}>
								{selectedNews.title}
							</h1>

							{/* Description */}
							<div className={styles.dialogDescription}>
								{selectedNews.description}
							</div>

							{/* Hashtags */}
							{selectedNews.hashtags && 
								Array.isArray(selectedNews.hashtags) && 
								selectedNews.hashtags.length > 0 && (
								<div className={styles.dialogTags}>
									{selectedNews.hashtags.map((hashtag, idx) => (
										<Chip
											key={idx}
											label={hashtag}
											size='medium'
											style={{
												backgroundColor: '#e3f2fd',
												color: '#5627dc',
												fontSize: '13px',
											}}
										/>
									))}
								</div>
							)}

							{/* Meta Information */}
							<div className={styles.dialogMeta}>
								<div>
									<div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '4px' }}>
										{t('publishedOn') || 'Published on'}: {selectedNews.createdAt?.split('T')[0]}
									</div>
									<div style={{ fontSize: '14px', color: '#2c3e50', fontWeight: 500 }}>
										{t('type') || 'Type'}: {selectedNews.type}
									</div>
								</div>
								{selectedNews.source_link && (
									<IconButton
										component='a'
										href={selectedNews.source_link}
										target='_blank'
										rel='noopener noreferrer'
										style={{
											backgroundColor: '#2c3e50',
											color: '#ffffff',
											width: '40px',
											height: '40px',
										}}
									>
										<LaunchIcon />
									</IconButton>
								)}
							</div>

							{/* Actions */}
							<div className={styles.dialogActions}>
								{!selectedNews.isViewed && (
									<Button
										variant='contained'
										onClick={() => markAsRead(selectedNews.id)}
										disabled={loadingMarkAsRead}
										style={{
											backgroundColor: '#5627dc',
											color: '#ffffff',
											borderRadius: '8px',
											textTransform: 'none',
											padding: '10px 20px'
										}}
									>
										{loadingMarkAsRead ? t('loading') : (t('mark_as_read') || 'Mark as Read')}
									</Button>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
