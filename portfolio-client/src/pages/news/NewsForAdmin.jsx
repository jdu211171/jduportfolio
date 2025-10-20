import SearchIcon from '@mui/icons-material/Search'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Skeleton,
	Snackbar,
	TextField,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { ReactComponent as DeleteIcon } from '../../assets/icons/news-delete-icon.svg'
import { ReactComponent as EditIcon } from '../../assets/icons/news-edit-icon.svg'
import { ReactComponent as LinkIcon } from '../../assets/icons/news-link-icon.svg'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'
import axios from '../../utils/axiosUtils'
export const NewsForAdmin = () => {
	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	const formatDate = s => {
		try {
			if (!s) return ''
			const d = new Date(s)
			return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(
				d
			)
		} catch {
			return s?.split?.('T')?.[0] || ''
		}
	}

	// State management
	const [newsData, setNewsData] = useState([])
	const [readedUser, setReadedUser] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [deleteLoading, setDeleteLoading] = useState(null)
	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const [createLoading, setCreateLoading] = useState(false)
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const [editLoading, setEditLoading] = useState(false)
	const [editingNews, setEditingNews] = useState(null)
	const [removeImage, setRemoveImage] = useState(false)
	const [toastOpen, setToastOpen] = useState(false)
	const [toastMessage, setToastMessage] = useState('')
	const [newNews, setNewNews] = useState({
		title: '',
		description: '',
		hashtags: '',
		image: null,
		source_link: '',
	})

	const fetchNews = async (searchQuery = '') => {
		setLoading(true)
		setError(null)

		try {
			const params = {}
			if (searchQuery) {
				params.search = searchQuery
			}

			const response = await axios.get('/api/news', { params })
			const data = response.data
			setNewsData(Array.isArray(data) ? data : data.news || [])
		} catch (err) {
			setError(err.response?.data?.message || err.message)
			console.error('Error fetching news:', err)
		} finally {
			setLoading(false)
		}
	}
	const readedUsers = async () => {
		setLoading(true)

		try {
			const response = await axios.get('/api/news-views/with-status')
			const data = response.data
			console.log(data)

			setReadedUser(data.news || [])
		} catch (err) {
			console.error('Error fetching news:', err)
		} finally {
			setLoading(false)
		}
	}
	useEffect(() => {
		fetchNews()
		readedUsers()
	}, [])

	// Debounced search (while keeping button search)
	const didMountRef = useRef(false)
	useEffect(() => {
		if (!didMountRef.current) {
			didMountRef.current = true
			return
		}
		const h = setTimeout(() => {
			fetchNews(searchTerm)
		}, 400)
		return () => clearTimeout(h)
	}, [searchTerm])

	const handleSearch = () => {
		fetchNews(searchTerm)
	}

	const handleKeyPress = e => {
		if (e.key === 'Enter') {
			handleSearch()
		}
	}

	// Delete news
	const handleDeleteNews = async newsId => {
		if (!window.confirm(t('confirmDeleteNews'))) {
			return
		}

		setDeleteLoading(newsId)
		setError(null)

		try {
			const response = await axios.delete(`/api/news/${newsId}`)

			setNewsData(prevNews => prevNews.filter(news => news.id !== newsId))

			console.log('News deleted successfully')
		} catch (err) {
			console.error('Error deleting news:', err)

			let errorMessage = 'Failed to delete news'

			if (err.response) {
				const status = err.response.status
				const serverMessage =
					err.response.data?.message || err.response.data?.error
			} else {
				errorMessage = `Failed to delete news: ${err.message}`
			}

			setError(errorMessage)
		} finally {
			setDeleteLoading(null)
		}
	}
	const showToast = msg => {
		setToastMessage(msg)
		setToastOpen(true)
	}

	const toggleExpand = key => {
		setExpandedKeys(prev => {
			const next = new Set(prev)
			if (next.has(key)) next.delete(key)
			else next.add(key)
			return next
		})
	}
	// Create new news
	const handleCreateNews = async () => {
		setCreateLoading(true)
		setError(null)

		try {
			const formData = new FormData()

			formData.append('title', newNews.title)
			formData.append('description', newNews.description)
			formData.append('source_link', newNews.source_link)

			const hashtagsArray = newNews.hashtags
				.split(',')
				.map(tag => tag.trim())
				.filter(tag => tag.length > 0)
			formData.append('hashtags', JSON.stringify(hashtagsArray))

			if (newNews.image) {
				formData.append('image', newNews.image)
			}

			const response = await axios.post('/api/news', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})

			const data = response.data

			setNewsData(prevNews => [data, ...prevNews])
			showToast(t('fileUploadSuccess'))
			setNewNews({
				title: '',
				description: '',
				hashtags: '',
				image: null,
				source_link: '',
			})
			setCreateDialogOpen(false)
		} catch (err) {
			setError(
				`Failed to create news: ${err.response?.data?.message || err.message}`
			)
			console.error('Error creating news:', err)
		} finally {
			setCreateLoading(false)
		}
	}

	const handleInputChange = (field, value) => {
		setNewNews(prev => ({
			...prev,
			[field]: value,
		}))
	}

	const handleFileChange = event => {
		const file = event.target.files[0]
		setNewNews(prev => ({
			...prev,
			image: file,
		}))
	}

	const handleEditNews = news => {
		setEditingNews(news)
		setNewNews({
			title: news.title || '',
			description: news.description || '',
			hashtags:
				news.hashtags && Array.isArray(news.hashtags)
					? news.hashtags.join(', ')
					: news.hashtags || '',
			image: null,
			source_link: news.source_link || '',
		})
		setRemoveImage(false)
		setEditDialogOpen(true)
	}

	// Update news
	const handleUpdateNews = async () => {
		if (!editingNews) return

		setEditLoading(true)
		setError(null)

		try {
			const formData = new FormData()

			formData.append('title', newNews.title)
			formData.append('description', newNews.description)
			formData.append('source_link', newNews.source_link)

			const hashtagsArray = newNews.hashtags
				? newNews.hashtags
						.split(',')
						.map(tag => tag.trim())
						.filter(tag => tag.length > 0)
				: []

			hashtagsArray.forEach(tag => {
				formData.append('hashtags[]', tag)
			})

			if (newNews.image) {
				formData.append('image', newNews.image)
			}

			// communicate removeImage intent if no new file selected
			if (!newNews.image && removeImage) {
				formData.append('removeImage', 'true')
			}

			const response = await axios.put(
				`/api/news/${editingNews.id}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			)

			const updatedNews = {
				...response.data,
				hashtags:
					typeof response.data.hashtags === 'string'
						? JSON.parse(response.data.hashtags)
						: response.data.hashtags,
			}
			setNewsData(prevNews =>
				prevNews.map(news => (news.id === editingNews.id ? updatedNews : news))
			)

			setNewNews({
				title: '',
				description: '',
				hashtags: '',
				image: null,
				source_link: '',
			})
			setEditingNews(null)
			setRemoveImage(false)
			setEditDialogOpen(false)
		} catch (err) {
			setError(
				`Failed to update news: ${err.response?.data?.message || err.message}`
			)
			console.error('Error updating news:', err)
		} finally {
			setEditLoading(false)
		}
	}

	return (
		<div>
			<Snackbar
				open={toastOpen}
				autoHideDuration={3000}
				onClose={() => setToastOpen(false)}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert
					onClose={() => setToastOpen(false)}
					severity='success' // success | error | warning | info
					sx={{ width: '100%' }}
				>
					{toastMessage}
				</Alert>
			</Snackbar>
			{/* Header Section */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					maxWidth: '1200px',
					margin: '0 auto 20px',
					flexWrap: 'wrap',
					gap: '20px',
				}}
			>
				<div
					style={{
						fontSize: 'clamp(24px, 5vw, 32px)',
						fontWeight: 'bold',
						color: '#2c3e50',
					}}
				>
					{t('newsHighlights')}
				</div>
				<Button
					variant='contained'
					onClick={() => setCreateDialogOpen(true)}
					style={{
						fontSize: 'clamp(14px, 2vw, 16px)',
						padding: '8px 16px',
					}}
				>
					{t('addNews')}
				</Button>
			</div>

			{/* Search Section */}
			<div
				style={{
					margin: '0 auto',
					backgroundColor: 'white',
					borderRadius: '16px',
					padding: '5px',
					marginBottom: '40px',
					width: '100%',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '16px',
						backgroundColor: '#f8f9fa',
						borderRadius: '12px',
						padding: '12px 15px',
						border: '2px solid #e9ecef',
						transition: 'all 0.3s ease',
						flexWrap: 'wrap',
					}}
				>
					<SearchIcon
						style={{
							color: '#6c757d',
							fontSize: '24px',
							minWidth: '24px',
						}}
					/>
					<input
						type='text'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder={t('searchByHashtag')}
						style={{
							flex: 1,
							border: 'none',
							outline: 'none',
							backgroundColor: 'transparent',
							fontSize: 'clamp(14px, 2vw, 16px)',
							color: '#2c3e50',
							fontFamily: 'inherit',
							minWidth: '200px',
						}}
					/>
					<Button
						variant='contained'
						onClick={handleSearch}
						disabled={loading}
						style={{
							borderRadius: '8px',
							padding: '12px 24px',
							fontSize: 'clamp(14px, 2vw, 16px)',
							fontWeight: '600',
							textTransform: 'none',
							minWidth: '80px',
						}}
					>
						{loading ? (
							<CircularProgress size={20} color='inherit' />
						) : (
							t('search')
						)}
					</Button>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<div style={{ maxWidth: '1200px', margin: '0 auto 20px' }}>
					<Alert severity='error' style={{ borderRadius: '12px' }}>
						{error}
					</Alert>
				</div>
			)}

			{/* Loading handled by skeletons in grid below */}

			{/* News Content Section */}
			<div
				style={{
					maxWidth: '1200px',
					margin: '0 auto',
					display: 'grid',
					gridTemplateColumns:
						'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
					gap: 'clamp(12px, 2vw, 20px)',
					padding: '0 10px',
				}}
			>
				{!loading && newsData.length === 0 && !error ? (
					<div
						style={{
							gridColumn: '1 / -1',
							textAlign: 'center',
							padding: '60px 20px',
							color: '#7f8c8d',
						}}
					>
						<div style={{ fontSize: '18px', marginBottom: '8px' }}>
							{t('noNewsFound')}
						</div>
						<div style={{ fontSize: '14px' }}>{t('tryAdjusting')}</div>
					</div>
				) : (
					newsData.map(news => {
						const newsView = readedUser.find(v => v.id === news.id)
						const viewCount = newsView ? newsView.viewCount : 0
						return (
							<div
								key={news.id}
								style={{
									position: 'relative',
									backgroundColor: '#FFFFFF',
									borderRadius: '16px',
									border: '1px solid #e1e8ed',
									cursor: 'pointer',
									height: 'auto',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									flexDirection: 'column',
								}}
							>
								<span
									style={{
										position: 'absolute',
										top: 10,
										left: 10,
										display: 'flex',
										alignItems: 'center',
										gap: '4px',
										backgroundColor: 'rgba(0,0,0,0.6)',
										color: 'white',
										padding: '4px 8px',
										borderRadius: '12px',
										fontSize: '12px',
									}}
								>
									<VisibilityIcon size={14} />
									{viewCount}
								</span>
								{/* News Image */}
								<div>
									<div
										style={{
											width: '100%',
											height: 'clamp(150px, 25vw, 200px)',
											backgroundColor: '#f8f9fa',
											borderRadius: '12px 12px 0 0',
											overflow: 'hidden',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										{news.image_url ? (
											<img
												src={news.image_url}
												alt={news.title}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
												}}
											/>
										) : (
											<div
												style={{
													color: '#6c757d',
													fontSize: 'clamp(12px, 2vw, 14px)',
													textAlign: 'center',
													padding: '20px',
												}}
											>
												{t('noImageAvailable')}
											</div>
										)}
									</div>

									<div
										style={{
											padding: 'clamp(8px, 2vw, 12px)',
										}}
									>
										{/* News Title */}

										<h3
											style={{
												fontSize: 'clamp(16px, 3vw, 20px)',
												fontWeight: '600',
												color: '#2c3e50',
												marginBottom: '12px',
												lineHeight: '1.4',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												display: '-webkit-box',
												WebkitLineClamp: 2,
												WebkitBoxOrient: 'vertical',
											}}
										>
											{news.title}
										</h3>

										{/* News Description - scroll variant */}
										<div
											style={{
												maxHeight: '8.8em',
												overflow: 'auto',
												marginBottom: '8px',
												paddingRight: 4,
											}}
										>
											<p
												style={{
													fontSize: 'clamp(12px, 2vw, 14px)',
													color: '#7f8c8d',
													lineHeight: '1.6',
													margin: 0,
													wordBreak: 'break-word',
													overflowWrap: 'anywhere',
												}}
											>
												{news.description}
											</p>
										</div>

										{/* Hashtags */}
										{news.hashtags &&
											Array.isArray(news.hashtags) &&
											news.hashtags.length > 0 && (
												<div
													style={{
														display: 'flex',
														flexWrap: 'wrap',
														gap: '6px',
													}}
												>
													{news.hashtags.map((hashtag, index) => (
														<Chip
															key={index}
															label={`${hashtag}`}
															size='small'
															style={{
																backgroundColor: '#e3f2fd',
																color: '#1976d2',
																fontSize: 'clamp(10px, 1.5vw, 12px)',
																height: 'clamp(20px, 3vw, 24px)',
															}}
														/>
													))}
												</div>
											)}
									</div>
								</div>
								<div style={{ padding: 10, width: '100%' }}>
									{/* Footer */}
									<div
										style={{
											width: '100%',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											marginBottom: 10,
										}}
									>
										<div
											style={{
												textTransform: 'capitalize',
												color: 'black',
												fontWeight: '500',
												fontSize: 'clamp(14px, 2.5vw, 18px)',
											}}
										>
											{news.type}
										</div>
										<div style={{ fontSize: 'clamp(10px, 1.5vw, 12px)' }}>
											{formatDate(news.createdAt)}
										</div>
									</div>
									{/* Action Buttons */}
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											gap: 'clamp(6px, 1vw, 8px)',
											flexWrap: 'wrap',
										}}
									>
										{news.source_link && (
											<IconButton
												style={{
													backgroundColor: 'rgba(255, 255, 255, 0.9)',
													backdropFilter: 'blur(10px)',
													width: 'clamp(32px, 5vw, 36px)',
													height: 'clamp(32px, 5vw, 36px)',
													borderRadius: 9,
													border: '1px solid gray',
												}}
												size='small'
												component='a'
												href={news.source_link}
												target='_blank'
												rel='noopener noreferrer'
												onClick={e => e.stopPropagation()}
												aria-label={t('source')}
											>
												<LinkIcon />
											</IconButton>
										)}
										<IconButton
											onClick={e => {
												e.stopPropagation()
												handleEditNews(news)
											}}
											style={{
												width: 'clamp(32px, 5vw, 36px)',
												height: 'clamp(32px, 5vw, 36px)',
												borderRadius: 9,
												border: '1px solid gray',
											}}
											size='small'
											aria-label={t('edit')}
										>
											<EditIcon />
										</IconButton>
										<IconButton
											onClick={e => {
												e.stopPropagation()
												handleDeleteNews(news.id)
											}}
											disabled={deleteLoading === news.id}
											style={{
												width: 'clamp(32px, 5vw, 36px)',
												height: 'clamp(32px, 5vw, 36px)',
												color: '#dc3545',
												borderRadius: 9,
												border: '1px solid gray',
											}}
											size='small'
											aria-label={t('delete')}
										>
											{deleteLoading === news.id ? (
												<CircularProgress size={18} color='inherit' />
											) : (
												<DeleteIcon />
											)}
										</IconButton>
										{/* <div onClick={()=>users()} style={{background:'pink'}}>users</div> */}
									</div>
								</div>
							</div>
						)
					})
				)}
				{loading &&
					Array.from({ length: 6 }).map((_, idx) => (
						<div
							key={`sk-${idx}`}
							style={{
								backgroundColor: '#FFFFFF',
								borderRadius: '16px',
								border: '1px solid #e1e8ed',
							}}
						>
							<div
								style={{ width: '100%', height: 'clamp(150px, 25vw, 200px)' }}
							>
								<Skeleton variant='rectangular' width='100%' height='100%' />
							</div>
							<div style={{ padding: '12px' }}>
								<Skeleton variant='text' width='80%' height={28} />
								<Skeleton variant='text' width='60%' height={18} />
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginTop: 8,
									}}
								>
									<Skeleton variant='text' width={90} height={16} />
									<Skeleton variant='rectangular' width={100} height={32} />
								</div>
							</div>
						</div>
					))}
			</div>

			{/* Create News Dialog */}
			<Dialog
				open={createDialogOpen}
				onClose={() => setCreateDialogOpen(false)}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle>{t('CreateNews')}</DialogTitle>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
						<Box>
							<input
								accept='image/*'
								style={{ display: 'none' }}
								id='image-upload'
								type='file'
								onChange={handleFileChange}
							/>
							<label htmlFor='image-upload'>
								<Button
									variant='outlined'
									component='span'
									fullWidth
									startIcon={<UploadFileIcon />}
									sx={{
										justifyContent: 'flex-start',
										textTransform: 'none',
										paddingY: 1.5,
									}}
								>
									{newNews.image ? newNews.image.name : t('upload_picture')}
								</Button>
							</label>
						</Box>
						<TextField
							label={t('title')}
							value={newNews.title}
							onChange={e => handleInputChange('title', e.target.value)}
							fullWidth
							required
						/>
						<TextField
							label={t('description')}
							value={newNews.description}
							onChange={e => handleInputChange('description', e.target.value)}
							fullWidth
							multiline
							rows={4}
							maxRows={6}
							required
						/>
						<TextField
							label={t('hashtag')}
							value={newNews.hashtags}
							onChange={e => handleInputChange('hashtags', e.target.value)}
							fullWidth
							placeholder={t('hashtagPlaceholder')}
							required
						/>
						<TextField
							label={t('sourseLink')}
							value={newNews.source_link}
							onChange={e => handleInputChange('source_link', e.target.value)}
							fullWidth
							placeholder='https://example.com'
							// optional: link may be empty
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCreateDialogOpen(false)}>
						{t('cencel')}
					</Button>
					<Button
						onClick={handleCreateNews}
						variant='contained'
						disabled={createLoading || !newNews.title || !newNews.description}
					>
						{createLoading ? (
							<CircularProgress size={20} color='inherit' />
						) : (
							t('create')
						)}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit News Dialog */}
			<Dialog
				open={editDialogOpen}
				onClose={() => {
					setEditDialogOpen(false)
					setEditingNews(null)
					setNewNews({
						title: '',
						description: '',
						hashtags: '',
						image: null,
						source_link: '',
					})
					setRemoveImage(false)
				}}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle>{t('EditNews')}</DialogTitle>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
						<Box>
							<input
								accept='image/*'
								style={{ display: 'none' }}
								id='edit-image-upload'
								type='file'
								onChange={handleFileChange}
							/>
							<label htmlFor='edit-image-upload'>
								<Button variant='outlined' component='span' fullWidth>
									{newNews.image ? newNews.image.name : t('upload_picture')}
								</Button>
							</label>
						</Box>
						{editingNews?.image_url && !removeImage && !newNews.image && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								<img
									src={editingNews.image_url}
									alt={editingNews.title}
									style={{
										width: 160,
										height: 90,
										objectFit: 'cover',
										borderRadius: 8,
										border: '1px solid #e0e0e0',
									}}
								/>
								<Button color='error' onClick={() => setRemoveImage(true)}>
									{t('remove') || 'Remove Image'}
								</Button>
							</Box>
						)}
						<TextField
							label={t('title')}
							value={newNews.title}
							onChange={e => handleInputChange('title', e.target.value)}
							fullWidth
							required
						/>
						<TextField
							label={t('description')}
							value={newNews.description}
							onChange={e => handleInputChange('description', e.target.value)}
							fullWidth
							multiline
							rows={4}
							maxRows={6}
							required
						/>
						<TextField
							label={t('hashtag')}
							value={newNews.hashtags}
							onChange={e => handleInputChange('hashtags', e.target.value)}
							fullWidth
							placeholder={t('hashtagPlaceholder')}
							required
						/>
						<TextField
							label={t('sourseLink')}
							value={newNews.source_link}
							onChange={e => handleInputChange('source_link', e.target.value)}
							fullWidth
							placeholder='https://example.com'
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setEditDialogOpen(false)
							setEditingNews(null)
							setNewNews({
								title: '',
								description: '',
								hashtags: '',
								image: null,
								source_link: '',
							})
						}}
					>
						{t('cancel')}
					</Button>
					<Button
						onClick={handleUpdateNews}
						variant='contained'
						disabled={editLoading || !newNews.title || !newNews.description}
					>
						{editLoading ? (
							<CircularProgress size={20} color='inherit' />
						) : (
							t('updateNews')
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}
{
	/* Sample News Cards
{[1, 2, 3].map((item) => (
    <div key={item} style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e1e8ed',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer'
    }}>
        <div style={{
            width: '100%',
            height: '200px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6c757d',
            fontSize: '14px'
        }}>
            News Image {item}
        </div>
        <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '12px',
            lineHeight: '1.4'
        }}>
            Sample News Title {item}
        </h3>
        <p style={{
            fontSize: '14px',
            color: '#7f8c8d',
            lineHeight: '1.6',
            marginBottom: '16px'
        }}>
            This is a sample news description that provides a brief overview of the news content...
        </p>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#95a5a6'
        }}>
            <span>2 days ago</span>
            <span>#technology #update</span>
        </div>
    </div>
))} */
}
