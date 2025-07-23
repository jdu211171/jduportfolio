import { useState, useEffect } from 'react';
import { CircularProgress, Chip, IconButton } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import translations from '../../locales/translations';
import LaunchIcon from '@mui/icons-material/Launch';
import axios from '../../utils/axiosUtils';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

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
                No news available
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#f5f7fa',
            minHeight: 'screen',
        }}>
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

            {/* Swiper Carousel */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay, EffectFade]}
                    spaceBetween={30}
                    slidesPerView={1}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    effect="fade"
                    fadeEffect={{
                        crossFade: true
                    }}
                    loop={true}
                    style={{
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    {newsData.map((news, index) => (
                        <SwiperSlide key={news.id || index}>
                            <div style={{
                                backgroundColor: 'white',
                                minHeight: '500px',
                                display: 'flex',
                                flexDirection: window.innerWidth > 768 ? 'row' : 'column'
                            }}>
                                {/* Image Section */}
                                <div style={{
                                    flex: window.innerWidth > 768 ? '1' : 'none',
                                    height: window.innerWidth > 768 ? '500px' : '250px',
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
                                    flex: window.innerWidth > 768 ? '1' : 'none',
                                    padding: 'clamp(20px, 4vw, 40px)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    {/* Title */}
                                    <h2 style={{
                                        fontSize: 'clamp(20px, 4vw, 28px)',
                                        fontWeight: '600',
                                        color: '#2c3e50',
                                        marginBottom: '16px',
                                        lineHeight: '1.3'
                                    }}>
                                        {news.title}
                                    </h2>

                                    {/* Description */}
                                    <p style={{
                                        fontSize: 'clamp(14px, 2.5vw, 16px)',
                                        color: '#7f8c8d',
                                        lineHeight: '1.6',
                                        marginBottom: '20px',
                                        flex: 1,
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 4,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {news.description}
                                    </p>

                                    {/* Hashtags */}
                                    {news.hashtags && Array.isArray(news.hashtags) && news.hashtags.length > 0 && (
                                        <div style={{
                                            marginBottom: '20px',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px'
                                        }}>
                                            {news.hashtags.slice(0, 5).map((hashtag, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={hashtag}
                                                    size="small"
                                                    style={{
                                                        backgroundColor: '#e3f2fd',
                                                        color: '#1976d2',
                                                        fontSize: 'clamp(11px, 2vw, 13px)'
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
                                        gap: '10px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px'
                                        }}>
                                            <span style={{
                                                fontSize: 'clamp(12px, 2vw, 14px)',
                                                color: '#95a5a6'
                                            }}>
                                                {news.createdAt?.split('T')[0]}
                                            </span>
                                            <span style={{
                                                fontSize: 'clamp(12px, 2vw, 14px)',
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
                                                    width: '40px',
                                                    height: '40px'
                                                }}
                                            >
                                                <LaunchIcon style={{ fontSize: '18px' }} />
                                            </IconButton>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Custom Swiper Styles */}
            <style jsx>{`
                .swiper-button-next,
                .swiper-button-prev {
                    color: #2c3e50 !important;
                    background: rgba(255, 255, 255, 0.9) !important;
                    width: 50px !important;
                    height: 50px !important;
                    border-radius: 50% !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                }

                .swiper-button-next:after,
                .swiper-button-prev:after {
                    font-size: 20px !important;
                    font-weight: bold !important;
                }

                .swiper-pagination-bullet {
                    background: #d1d5db !important;
                    opacity: 1 !important;
                    width: 12px !important;
                    height: 12px !important;
                }

                .swiper-pagination-bullet-active {
                    background: #2c3e50 !important;
                }

                .swiper-pagination {
                    bottom: 20px !important;
                }

                @media (max-width: 768px) {
                    .swiper-button-next,
                    .swiper-button-prev {
                        width: 40px !important;
                        height: 40px !important;
                    }
                    
                    .swiper-button-next:after,
                    .swiper-button-prev:after {
                        font-size: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
};