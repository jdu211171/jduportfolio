import LaunchIcon from '@mui/icons-material/Launch'
import { Alert, Button, Chip, CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'
import axios from '../../utils/axiosUtils'
import styles from './NewsForUsers.module.css'

const formatDate = (s, language) => {
  try {
    if (!s) return ''
    const d = new Date(s)
    return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(d)
  } catch {
    return s?.split?.('T')?.[0] || ''
  }
}

const getDomain = url => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return null
  }
}

export const NewsDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const t = key => translations[language][key] || key

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    document.title = item?.title ? `${item.title} | JDU Portfolio` : `${t('newsDetails')} | JDU Portfolio`
  }, [item, language])

  const fetchDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      // Try to get full list with isViewed status first (ensures flag is accurate)
      const listRes = await axios.get('/api/news-views/with-status')
      const list = Array.isArray(listRes.data) ? listRes.data : listRes.data.news || []
      const found = list.find(n => String(n.id) === String(id))
      if (found) {
        setItem(found)
        return
      }
      // Fallback to single fetch without status
      const res = await axios.get(`/api/news/${id}`)
      setItem(res.data)
    } catch (err) {
      console.error('Error fetching news detail:', err)
      setError(err?.response?.data?.message || err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  const markAsRead = async () => {
    if (!item || item.isViewed) return
    setMarking(true)
    const prev = item
    setItem({ ...item, isViewed: true })
    try {
      await axios.post(`/api/news-views/${id}/read`)
      // notify layout badge
      window.dispatchEvent(new CustomEvent('news:unread-count-change', { detail: { delta: -1 } }))
    } catch (err) {
      console.error('Error marking as read:', err)
      setItem(prev)
      setError(err?.response?.data?.message || err.message || 'Error')
    } finally {
      setMarking(false)
    }
  }

  // Note: Auto-mark-on-open removed; user triggers via button only

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <CircularProgress size={40} />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
        <Alert severity='error'>{error}</Alert>
        <div style={{ marginTop: 12 }}>
          <Button variant='outlined' onClick={() => navigate(-1)}>{t('back')}</Button>
        </div>
      </div>
    )
  }

  if (!item) return null

  const domain = item.source_link ? getDomain(item.source_link) : null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <Button variant='text' onClick={() => navigate(-1)}>{t('back')}</Button>
      </div>
      <div className={styles.detailImage}>
        {item.image_url ? (
          <img className={styles.img} src={item.image_url} alt={item.title} loading='lazy' decoding='async' />
        ) : (
          <div className={styles.noImage}>{t('noImageAvailable')}</div>
        )}
      </div>
      <h1 className={styles.title} style={{ marginTop: 16 }}>{item.title}</h1>
      <div className={styles.meta} style={{ marginTop: 8 }}>
        <span className={styles.date}>{formatDate(item.createdAt, language)}</span>
        <span className={styles.type}>{item.type}</span>
      </div>
      {item.hashtags && Array.isArray(item.hashtags) && item.hashtags.length > 0 && (
        <div className={styles.tags} style={{ marginTop: 8 }}>
          {item.hashtags.map((h, i) => (
            <Chip key={i} label={h} size='small' className={styles.tagChip} />
          ))}
        </div>
      )}
      <p className={styles.descText} style={{ marginTop: 12 }}>{item.description}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Button variant='contained' disabled={item.isViewed || marking} onClick={markAsRead}>
          {marking ? t('loading') : item.isViewed ? t('readed') : t('mark_as_read')}
        </Button>
        {item.source_link && (
          <Button component='a' href={item.source_link} target='_blank' rel='noopener noreferrer' startIcon={<LaunchIcon />}>
            {domain ? domain : t('source')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default NewsDetail
