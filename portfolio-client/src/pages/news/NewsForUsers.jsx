import { useState, useEffect } from 'react';
import { CircularProgress, Chip, IconButton } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import translations from '../../locales/translations';
import LaunchIcon from '@mui/icons-material/Launch';
import axios from '../../utils/axiosUtils';

export const NewsForUsers = () => {
    const { language } = useLanguage();
    const t = key => translations[language][key] || key;
    
    // State management
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch news data from API
    const fetchNews = async () => {
        setLoading(true);
        
        try {
            const response = await axios.get('/api/news');
            const data = response.data;
            setNewsData(Array.isArray(data) ? data : data.news || []);
        } catch (err) {
            console.error('Error fetching news:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load news on component mount
    useEffect(() => {
        fetchNews();
    }, []);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                backgroundColor: '#f5f7fa'
            }}>
                <CircularProgress size={40} />
            </div>
        );
    }

    if (newsData.length === 0) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                backgroundColor: '#f5f7fa',
                color: '#7f8c8d',
                fontSize: '18px'
            }}>
                {t('noNewsAvailable')}
            </div>
        );
    }

    return (
        <div>
            {/* Header Section */}
            <div style={{
                textAlign: 'center',
                marginBottom: '40px'
            }}>
                <h1 style={{
                    fontSize: 'clamp(28px, 5vw, 36px)',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    margin: '0 0 7px 0'
                }}>
                    {t('newsHighlights') || 'Latest News'}
                </h1>
                <p style={{
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    color: '#7f8c8d',
                }}>
                    {t('checkOut')}
                </p>
            </div>

            {/* News Grid */}
            <div style={{
                margin: '0 auto',
                padding: '0 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(350px, 1fr))',
                gap: '10px',
                gridAutoRows: 'auto'
            }}>
                {newsData.map((news, index) => (
                    <div key={news.id || index} style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        border:'1px solid #e6e6e6'
                    }}>
                        {/* Image Section */}
                        <div style={{
                            height: '250px',
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {news.image_url ? (
                                <img 
                                    src={news.image_url} 
                                    alt={news.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    color: '#6c757d',
                                    fontSize: '16px',
                                    textAlign: 'center'
                                }}>
                                    No Image Available
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div style={{
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            flexGrow: 1
                        }}>
                            {/* Title */}
                            <h2 style={{
                                fontSize: 'clamp(18px, 3vw, 22px)',
                                fontWeight: '600',
                                color: '#2c3e50',
                                marginBottom: '12px',
                                lineHeight: '1.3'
                            }}>
                                {news.title}
                            </h2>

                            {/* Description */}
                            <p style={{
                                fontSize: 'clamp(14px, 2vw, 16px)',
                                color: '#7f8c8d',
                                lineHeight: '1.6',
                                marginBottom: '16px',
                                flexGrow: 1,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical'
                            }}>
                                {news.description}
                            </p>

                            {/* Hashtags */}
                            {news.hashtags && Array.isArray(news.hashtags) && news.hashtags.length > 0 && (
                                <div style={{
                                    marginBottom: '16px',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '6px'
                                }}>
                                    {news.hashtags.slice(0, 3).map((hashtag, idx) => (
                                        <Chip
                                            key={idx}
                                            label={hashtag}
                                            size="small"
                                            style={{
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                                fontSize: '12px'
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Footer */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px',
                                paddingTop: '16px',
                                borderTop: '1px solid #f1f3f4'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <span style={{
                                        fontSize: '13px',
                                        color: '#95a5a6'
                                    }}>
                                        {news.createdAt?.split('T')[0]}
                                    </span>
                                    <span style={{
                                        fontSize: '13px',
                                        color: '#2c3e50',
                                        fontWeight: '500',
                                        textTransform: 'capitalize'
                                    }}>
                                        {news.type}
                                    </span>
                                </div>

                                {/* Source Link */}
                                {news.source_link && (
                                    <IconButton
                                        component="a"
                                        href={news.source_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            backgroundColor: '#2c3e50',
                                            color: 'white',
                                            width: '36px',
                                            height: '36px'
                                        }}
                                    >
                                        <LaunchIcon style={{ fontSize: '16px' }} />
                                    </IconButton>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};
