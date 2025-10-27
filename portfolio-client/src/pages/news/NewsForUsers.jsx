import LaunchIcon from '@mui/icons-material/Launch'
import SearchIcon from '@mui/icons-material/Search'
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Skeleton, InputAdornment, Snackbar, TextField } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
	const [error, setError] = useState(null)
	// Per-item marking state
	const [markingIds, setMarkingIds] = useState(new Set())
	// Filters & view
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedTag, setSelectedTag] = useState('') // '' = all
	const [sortBy, setSortBy] = useState('newest')
	const [visibleCount, setVisibleCount] = useState(12)
	// No local detail modal; use /news/:id route
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	// Read all states
	const [readAllOpen, setReadAllOpen] = useState(false)
	const [readAllLoading, setReadAllLoading] = useState(false)
	const [toastOpen, setToastOpen] = useState(false)
	const [toastMessage, setToastMessage] = useState('')

	// Fetch news data from API
	const fetchNews = async () => {
		setLoading(true)
		setError(null)
		try {
			const response = await axios.get('/api/news-views/with-status')
			const data = response.data
			const items = Array.isArray(data) ? data : data.news || []
			setNewsData(items)
		} catch (err) {
			console.error('Error fetching news:', err)
			setError(err?.response?.data?.message || err.message || 'Error')
		} finally {
			setLoading(false)
		}
	}

	const markAsRead = async id => {
		// Optimistic update and per-item loading
		setMarkingIds(prev => new Set(prev).add(id))
		const prevData = newsData
		setNewsData(d => d.map(n => (n.id === id ? { ...n, isViewed: true } : n)))
		try {
			await axios.post(`/api/news-views/${id}/read`)
			const wasUnread = prevData.some(n => n.id === id && !n.isViewed)
			if (wasUnread) {
				window.dispatchEvent(new CustomEvent('news:unread-count-change', { detail: { delta: -1 } }))
			}
		} catch (err) {
			console.error('Error marking news as read:', err)
			setError(err?.response?.data?.message || err.message || 'Error')
			// Revert on failure
			setNewsData(prevData)
		} finally {
			setMarkingIds(prev => {
				const next = new Set(prev)
				next.delete(id)
				return next
			})
		}
	}
	// Load news on component mount
	useEffect(() => {
		fetchNews()
	}, [])

	// Helpers
	const formatDate = s => {
		try {
			if (!s) return ''
			const d = new Date(s)
			const y = d.getFullYear()
			const m = String(d.getMonth() + 1).padStart(2, '0')
			const day = String(d.getDate()).padStart(2, '0')
			return `${y}/${m}/${day}`
		} catch {
			return s?.split?.('T')?.[0]?.replace?.(/-/g, '/') || ''
		}
	}

	const getDomain = url => {
		try {
			return new URL(url).hostname.replace('www.', '')
		} catch {
			return null
		}
	}

	// Unique tags
	const allTags = useMemo(() => {
		const s = new Set()
		newsData.forEach(n => {
			if (Array.isArray(n.hashtags)) n.hashtags.forEach(tag => s.add(tag))
		})
		return Array.from(s)
	}, [newsData])

	// Derived list based on filters and sort
	const filteredSorted = useMemo(() => {
		let list = [...newsData]
		if (searchTerm.trim()) {
			const q = searchTerm.toLowerCase()
			list = list.filter(n => (n.title || '').toLowerCase().includes(q) || (n.description || '').toLowerCase().includes(q))
		}
		if (selectedTag) {
			list = list.filter(n => Array.isArray(n.hashtags) && n.hashtags.includes(selectedTag))
		}
		list.sort((a, b) => {
			const da = new Date(a.createdAt).getTime() || 0
			const db = new Date(b.createdAt).getTime() || 0
			return sortBy === 'newest' ? db - da : da - db
		})
		return list
	}, [newsData, searchTerm, selectedTag, sortBy])

	const visibleItems = filteredSorted.slice(0, visibleCount)
	const sentinelId = 'news-sentinel'
	const unreadCount = useMemo(() => newsData.filter(n => !n.isViewed).length, [newsData])

	const handleReadAll = async () => {
		setReadAllLoading(true)
		const delta = unreadCount
		try {
			await axios.post('/api/news-views/read-all')
			setNewsData(d => d.map(n => ({ ...n, isViewed: true })))
			if (delta > 0) {
				window.dispatchEvent(new CustomEvent('news:unread-count-change', { detail: { delta: -delta } }))
			}
			setToastMessage(t('allNewsMarkedRead') || 'All news marked as read')
			setToastOpen(true)
		} catch (err) {
			console.error('Error marking all as read:', err)
			setError(err?.response?.data?.message || err.message || 'Error')
		} finally {
			setReadAllLoading(false)
			setReadAllOpen(false)
		}
	}

	// Open detail via navigate inline

	// Initialize from URL params (and react to changes)
	useEffect(() => {
		const qp = Object.fromEntries(searchParams.entries())
		if (typeof qp.q === 'string') setSearchTerm(qp.q)
		if (typeof qp.tag === 'string') setSelectedTag(qp.tag)
		if (qp.sort === 'newest' || qp.sort === 'oldest') setSortBy(qp.sort)
	}, [searchParams])

	// Sync to URL params
	useEffect(() => {
		const qp = {}
		if (searchTerm) qp.q = searchTerm
		if (selectedTag) qp.tag = selectedTag
		if (sortBy && sortBy !== 'newest') qp.sort = sortBy
		// Only update when params actually differ to avoid loops
		const current = Object.fromEntries(searchParams.entries())
		const keys = new Set([...Object.keys(qp), ...Object.keys(current)])
		let differs = false
		for (const k of keys) {
			if ((qp[k] || '') !== (current[k] || '')) {
				differs = true
				break
			}
		}
		if (differs) setSearchParams(qp, { replace: true })
	}, [searchTerm, selectedTag, sortBy, searchParams, setSearchParams])

	// Infinite scroll (IntersectionObserver)
	useEffect(() => {
		const el = document.getElementById(sentinelId)
		if (!el) return
		const observer = new IntersectionObserver(
			entries => {
				const first = entries[0]
				if (first.isIntersecting) {
					if (filteredSorted.length > visibleCount) {
						setVisibleCount(c => c + 12)
					}
				}
			},
			{ rootMargin: '200px' }
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [filteredSorted.length, visibleCount])

	// Header labels (avoid duplicate subtitle)
	const headerTitle = t('newsHighlights') || 'Latest News'
	const headerSub = t('checkOut')

	return (
		<div className={styles.page}>
			{/* Header */}
			<div className={styles.header}>
				<h1 className={styles.headerTitle}>{headerTitle}</h1>
				{headerSub && headerSub !== headerTitle && <p className={styles.headerSub}>{headerSub}</p>}
			</div>

			{/* Error */}
			{error && (
				<div className={styles.errorWrap}>
					<Alert
						severity='error'
						action={
							<Button color='inherit' size='small' onClick={fetchNews}>
								{t('retry')}
							</Button>
						}
					>
						{error}
					</Alert>
				</div>
			)}

			{/* Toolbar */}
			<div className={styles.toolbar}>
				<TextField
					value={searchTerm}
					onChange={e => {
						setSearchTerm(e.target.value)
						setVisibleCount(12)
					}}
					placeholder={t('searchNewsPlaceholder')}
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<SearchIcon style={{ color: '#6c757d' }} />
							</InputAdornment>
						),
					}}
					className={styles.search}
					size='small'
				/>
				<Select value={sortBy} onChange={e => setSortBy(e.target.value)} className={styles.select} size='small'>
					<MenuItem value='newest'>{t('newest')}</MenuItem>
					<MenuItem value='oldest'>{t('oldest')}</MenuItem>
				</Select>
				<Button variant='outlined' onClick={() => setReadAllOpen(true)} disabled={unreadCount === 0 || readAllLoading}>
					{readAllLoading ? t('loading') : t('mark_all_read')}
				</Button>
			</div>

			{/* Tag Filters */}
			{allTags.length > 0 && (
				<div className={styles.filters}>
					<Chip
						label={t('all')}
						className={selectedTag === '' ? styles.chipActive : styles.chip}
						onClick={() => {
							setSelectedTag('')
							setVisibleCount(12)
						}}
						size='small'
					/>
					{allTags.map((tag, i) => (
						<Chip
							key={i}
							label={tag}
							className={selectedTag === tag ? styles.chipActive : styles.chip}
							onClick={() => {
								setSelectedTag(tag === selectedTag ? '' : tag)
								setVisibleCount(12)
							}}
							size='small'
						/>
					))}
				</div>
			)}

			{/* News Grid — 3 per row */}
			<div className={styles.grid}>
				{loading ? (
					Array.from({ length: 6 }).map((_, idx) => (
						<div key={`s-${idx}`} className={styles.card}>
							<div className={styles.image}>
								<Skeleton variant='rectangular' width='100%' height='100%' />
							</div>
							<div className={styles.content}>
								<Skeleton variant='text' width='80%' height={28} />
								<Skeleton variant='text' width='100%' height={18} />
								<Skeleton variant='text' width='60%' height={18} />
								<div className={styles.footer}>
									<Skeleton variant='text' width={90} height={16} />
									<Skeleton variant='rectangular' width={100} height={36} />
								</div>
							</div>
						</div>
					))
				) : visibleItems.length === 0 ? (
					<div className={styles.empty}>{t('noNewsAvailable')}</div>
				) : (
					visibleItems.map((news, index) => {
						const itemKey = news.id ?? `i-${index}`
						const domain = news.source_link ? getDomain(news.source_link) : null
						const isMarking = markingIds.has(news.id)
						return (
							<div key={itemKey} className={`${styles.card} ${!news.isViewed ? styles.cardUnread : ''}`} onClick={() => navigate(`/news/${news.id}`)} role='article'>
								{!news.isViewed && <span className={styles.unreadDot} />}
								{/* Image Section */}
								<div className={styles.image}>{news.image_url ? <img className={styles.img} src={news.image_url} alt={news.title} loading='lazy' decoding='async' /> : <div className={styles.noImage}>{t('noImageAvailable')}</div>}</div>

								{/* Content Section */}
								<div className={styles.content}>
									<h2 className={styles.title}>{news.title}</h2>
									<div className={styles.descScroll}>
										<p className={styles.descText}>{news.description}</p>
									</div>
									{news.hashtags && Array.isArray(news.hashtags) && news.hashtags.length > 0 && (
										<div className={styles.tags}>
											{news.hashtags.slice(0, 3).map((hashtag, idx) => (
												<Chip key={idx} label={hashtag} size='small' className={styles.tagChip} />
											))}
										</div>
									)}
									<div className={styles.footer}>
										<div className={styles.meta}>
											<div className={styles.publisher}>Japan Digital University</div>
											<div className={styles.date}>{formatDate(news.createdAt)}</div>
										</div>
										<div className={styles.actions} onClick={e => e.stopPropagation()}>
											<Button variant='contained' disabled={news.isViewed || isMarking} onClick={() => markAsRead(news.id)}>
												{isMarking ? t('loading') : news.isViewed ? t('readed') : t('mark_as_read')}
											</Button>
											{news.source_link && (
												<Button component='a' href={news.source_link} target='_blank' rel='noopener noreferrer' className={styles.sourceBtn} aria-label={t('source')}>
													<LaunchIcon style={{ fontSize: 16, marginRight: 6 }} />
													{domain ? domain : t('source')}
												</Button>
											)}
										</div>
									</div>
								</div>
							</div>
						)
					})
				)}
			</div>

			{/* Load more */}
			{!loading && filteredSorted.length > visibleCount && (
				<div className={styles.loadMoreWrap}>
					<Button variant='outlined' onClick={() => setVisibleCount(c => c + 12)}>
						{t('loadMore')}
					</Button>
				</div>
			)}

			{/* Sentinel for infinite scroll */}
			<div id={sentinelId} />

			{/* Detail modal removed; using dedicated detail route */}
			{/* Read all confirm */}
			<Dialog open={readAllOpen} onClose={() => setReadAllOpen(false)}>
				<DialogTitle>{t('mark_all_read')}</DialogTitle>
				<DialogContent>
					<div style={{ paddingTop: 8 }}>{t('confirmMarkAllRead') || 'Mark all news as read?'}</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setReadAllOpen(false)}>{t('cancel')}</Button>
					<Button onClick={handleReadAll} variant='contained' disabled={readAllLoading || unreadCount === 0}>
						{readAllLoading ? t('loading') : t('mark_all_read')}
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar open={toastOpen} autoHideDuration={2500} onClose={() => setToastOpen(false)} message={toastMessage} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} />
		</div>
	)
}
