import { useState, useEffect } from 'react';
import { Button, CircularProgress, Chip, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import translations from '../../locales/translations';
import SearchIcon from '@mui/icons-material/Search';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from '../../utils/axiosUtils'
export const NewsForAdmin = () => {
    const { language } = useLanguage();
    const t = key => translations[language][key] || key;
    
    // State management
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [newNews, setNewNews] = useState({
        title: '',
        description: '',
        hashtags: '',
        image: null,
        source_link: ''
    });

    // Fetch news data from API
    const fetchNews = async (searchQuery = '') => {
        setLoading(true);
        setError(null);
        
        try {
            const params = {};
            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await axios.get('/api/news', { params });
            const data = response.data;
            setNewsData(Array.isArray(data) ? data : data.news || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            console.error('Error fetching news:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load news on component mount
    useEffect(() => {
        fetchNews();
    }, []);

    // Handle search
    const handleSearch = () => {
        fetchNews(searchTerm);
    };

    // Handle enter key in search input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Delete news
    const handleDeleteNews = async (newsId) => {
        if (!window.confirm('Are you sure you want to delete this news?')) {
            return;
        }

        setDeleteLoading(newsId);
        setError(null); // Clear any previous errors
            console.log(newsId);
            
        try {
            const response = await axios.delete(`/api/news/${newsId}`);
            
            // Remove the deleted news from the list only if deletion was successful
            setNewsData(prevNews => prevNews.filter(news => news.id !== newsId));
            
            // Optional: Show success message
            console.log('News deleted successfully');
            
        } catch (err) {
            console.error('Error deleting news:', err);
            
            // More detailed error handling
            let errorMessage = 'Failed to delete news';
            
            if (err.response) {
                // Server responded with error status
                const status = err.response.status;
                const serverMessage = err.response.data?.message || err.response.data?.error;
                
                if (status === 404) {
                    errorMessage = 'News not found or already deleted';
                } else if (status === 403) {
                    errorMessage = 'You do not have permission to delete this news';
                } else if (status === 500) {
                    errorMessage = `Server error while deleting news: ${serverMessage || 'Internal server error'}`;
                } else {
                    errorMessage = `Failed to delete news: ${serverMessage || `Error ${status}`}`;
                }
            } else if (err.request) {
                // Network error
                errorMessage = 'Network error - could not connect to server';
            } else {
                // Other error
                errorMessage = `Failed to delete news: ${err.message}`;
            }
            
            setError(errorMessage);
        } finally {
            setDeleteLoading(null);
        }
    };

    // Create new news
    const handleCreateNews = async () => {
        setCreateLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            
            formData.append('title', newNews.title);
            formData.append('description', newNews.description);
            formData.append('source_link', newNews.source_link);
            
            // Parse hashtags from string to array
            const hashtagsArray = newNews.hashtags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
            formData.append('hashtags', JSON.stringify(hashtagsArray));
            
            if (newNews.image) {
                formData.append('image', newNews.image);
            }

            const response = await axios.post('/api/news', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = response.data;
            
            // Add the new news to the beginning of the list
            setNewsData(prevNews => [data, ...prevNews]);
            
            // Reset form and close dialog
            setNewNews({
                title: '',
                description: '',
                hashtags: '',
                image: null,
                source_link: ''
            });
            setCreateDialogOpen(false);
            
        } catch (err) {
            setError(`Failed to create news: ${err.response?.data?.message || err.message}`);
            console.error('Error creating news:', err);
        } finally {
            setCreateLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setNewNews(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle file input change
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setNewNews(prev => ({
            ...prev,
            image: file
        }));
    };

    // Handle edit news
    const handleEditNews = (news) => {
        setEditingNews(news);
        setNewNews({
            title: news.title || '',
            description: news.description || '',
            hashtags: news.hashtags && Array.isArray(news.hashtags) ? news.hashtags.join(', ') : (news.hashtags || ''),
            image: null,
            source_link: news.source_link || ''
        });
        setEditDialogOpen(true);
    };

    // Update news
    const handleUpdateNews = async () => {
        if (!editingNews) return;
        
        setEditLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            
            formData.append('title', newNews.title);
            formData.append('description', newNews.description);
            formData.append('source_link', newNews.source_link);
            
            // Parse hashtags from string to array
            const hashtagsArray = newNews.hashtags
                ? newNews.hashtags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0)
                : [];
            formData.append('hashtags', JSON.stringify(hashtagsArray));
            
            if (newNews.image) {
                formData.append('image', newNews.image);
            }

            const response = await axios.put(`/api/news/${editingNews.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const updatedNews = {
                ...response.data,
                hashtags: typeof response.data.hashtags === 'string'
                    ? JSON.parse(response.data.hashtags)
                    : response.data.hashtags
            };
            // Update the news in the list
            setNewsData(prevNews => 
                prevNews.map(news => 
                    news.id === editingNews.id ? updatedNews : news
                )
            );
            
            // Reset form and close dialog
            setNewNews({
                title: '',
                description: '',
                hashtags: '',
                image: null,
                source_link: ''
            });
            setEditingNews(null);
            setEditDialogOpen(false);
            
        } catch (err) {
            setError(`Failed to update news: ${err.response?.data?.message || err.message}`);
            console.error('Error updating news:', err);
        } finally {
            setEditLoading(false);
        }
    };
    
    return (
        <div style={{
            backgroundColor: '#f5f7fa',
        }}>
            {/* Header Section */}
            <div style={{
                display:'flex',
                alignItems:'center',
                justifyContent:'space-between',
                maxWidth: '1200px',
                margin: '0 auto 20px',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div style={{
                    fontSize: 'clamp(24px, 5vw, 32px)',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                }}>
                    {t('newsHighlights')}
                </div>
                <Button 
                    variant='contained'
                    onClick={() => setCreateDialogOpen(true)}
                    style={{
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        padding: '8px 16px'
                    }}
                >
                    +新しい
                </Button>
            </div>
            
            {/* Search Section */}
            <div style={{
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '5px',
                marginBottom: '40px',
                width: '100%'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '12px 15px',
                    border: '2px solid #e9ecef',
                    transition: 'all 0.3s ease',
                    flexWrap: 'wrap'
                }}>
                    <SearchIcon style={{
                        color: '#6c757d',
                        fontSize: '24px',
                        minWidth: '24px'
                    }}/>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                            minWidth: '200px'
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
                            minWidth: '80px'
                        }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : t('search')}
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{ maxWidth: '1200px', margin: '0 auto 20px' }}>
                    <Alert severity="error" style={{ borderRadius: '12px' }}>
                        {error}
                    </Alert>
                </div>
            )}

            {/* Loading State */}
            {loading && !error && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px'
                }}>
                    <CircularProgress size={40} />
                </div>
            )}
            
            {/* News Content Section */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
                gap: 'clamp(12px, 2vw, 20px)',
                padding: '0 10px'
            }}>
                {!loading && newsData.length === 0 && !error ? (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#7f8c8d'
                    }}>
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                            No news found
                        </div>
                        <div style={{ fontSize: '14px' }}>
                            Try adjusting your search terms
                        </div>
                    </div>
                ) : (
                    newsData.map((news) => (
                        <div key={news.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            // padding: '24px',
                            border: '1px solid #e1e8ed',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                        >
                           
                            {/* News Image */}
                            <div style={{
                                width: '100%',
                                height: 'clamp(150px, 25vw, 200px)',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '12px 12px 0 0',
                                marginBottom: '16px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
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
                                        fontSize: 'clamp(12px, 2vw, 14px)',
                                        textAlign: 'center',
                                        padding: '20px'
                                    }}>
                                        No Image Available
                                    </div>
                                )}
                            </div>

                           <div style={{padding: 'clamp(8px, 2vw, 12px)'}}>
                             {/* News Title */}
                            <h3 style={{
                                fontSize: 'clamp(16px, 3vw, 20px)',
                                fontWeight: '600',
                                color: '#2c3e50',
                                marginBottom: '12px',
                                lineHeight: '1.4',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}>
                                {news.title}
                            </h3>

                            {/* News Description */}
                            <p style={{
                                fontSize: 'clamp(12px, 2vw, 14px)',
                                color: '#7f8c8d',
                                lineHeight: '1.6',
                                marginBottom: '16px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
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
                                    {news.hashtags.map((hashtag, index) => (
                                        <Chip
                                            key={index}
                                            label={`${hashtag}`}
                                            size="small"
                                            style={{
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                                fontSize: 'clamp(10px, 1.5vw, 12px)',
                                                height: 'clamp(20px, 3vw, 24px)'
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
                                fontSize: 'clamp(10px, 1.5vw, 12px)',
                                color: '#95a5a6',
                                marginBottom:'10px',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
                                <div style={{
                                    textTransform:'capitalize',
                                    color:'black',
                                    fontWeight:'500',
                                    fontSize: 'clamp(14px, 2.5vw, 18px)'
                                }}>
                                    {news.type}
                                </div>
                                <div style={{ fontSize: 'clamp(10px, 1.5vw, 12px)' }}>
                                    {news.createdAt.split('T')[0]}
                                </div>
                            </div>
                                 {/* Action Buttons */}
                            <div style={{
                                display:'flex',
                                alignItems:'center',
                                justifyContent:'center',
                                gap: 'clamp(6px, 1vw, 8px)',
                                flexWrap: 'wrap'
                            }}>
                           
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNews(news.id);
                                    }}
                                    disabled={deleteLoading === news.id}
                                    style={{
                                        width: 'clamp(32px, 5vw, 36px)',
                                        height: 'clamp(32px, 5vw, 36px)',
                                        color: '#dc3545',
                                        borderRadius:9,
                                        border:'1px solid gray'
                                    }}
                                    size="small"
                                >
                                    {deleteLoading === news.id ? (
                                        <CircularProgress size={18} color="inherit" />
                                    ) : (
                                        <DeleteIcon style={{ fontSize: 'clamp(14px, 2.5vw, 18px)' }}  color='#626262'/>
                                    )}
                                </IconButton>
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditNews(news);
                                    }}
                                    style={{
                                        width: 'clamp(32px, 5vw, 36px)',
                                        height: 'clamp(32px, 5vw, 36px)',
                                        borderRadius:9,
                                        border:'1px solid gray'
                                    }}
                                    size="small"
                                >
                                    <EditIcon style={{ fontSize: 'clamp(14px, 2.5vw, 18px)' }} color='#626262' />
                                </IconButton>
                                <IconButton
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        width: 'clamp(32px, 5vw, 36px)',
                                        height: 'clamp(32px, 5vw, 36px)',
                                        borderRadius:9,
                                        border:'1px solid gray'
                                    }}
                                    size="small"
                                >
                                      {news.source_link && (
                                    <a
                                        href={news.source_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            textDecoration: 'none',
                                            color:'#626262',
                                            display:'flex',
                                            alignItems:'center',
                                            justifyContent:'center'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <LaunchIcon style={{ fontSize: 'clamp(14px, 2.5vw, 18px)' }}/>
                                    </a>
                                )}
                                </IconButton>
                            </div>
                           </div>
                       
                        </div>
                    ))
                )}
            </div>

            {/* Create News Dialog */}
            <Dialog 
                open={createDialogOpen} 
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Create New News</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Title"
                            value={newNews.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Description"
                            value={newNews.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            required
                        />
                        <TextField
                            label="Hashtags (comma separated)"
                            value={newNews.hashtags}
                            onChange={(e) => handleInputChange('hashtags', e.target.value)}
                            fullWidth
                            placeholder="e.g., technology, news, update"
                            required
                        />
                        <TextField
                            label="Source Link"
                            value={newNews.source_link}
                            onChange={(e) => handleInputChange('source_link', e.target.value)}
                            fullWidth
                            placeholder="https://example.com"
                            required
                        />
                        <Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="image-upload"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="image-upload">
                                <Button variant="outlined" component="span" fullWidth>
                                    {newNews.image ? newNews.image.name : 'Upload Image'}
                                </Button>
                            </label>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateNews}
                        variant="contained"
                        disabled={createLoading || !newNews.title || !newNews.description}
                    >
                        {createLoading ? <CircularProgress size={20} color="inherit" /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit News Dialog */}
            <Dialog 
                open={editDialogOpen} 
                onClose={() => {
                    setEditDialogOpen(false);
                    setEditingNews(null);
                    setNewNews({
                        title: '',
                        description: '',
                        hashtags: '',
                        image: null,
                        source_link: ''
                    });
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit News</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Title"
                            value={newNews.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Description"
                            value={newNews.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            required
                        />
                        <TextField
                            label="Hashtags (comma separated)"
                            value={newNews.hashtags}
                            onChange={(e) => handleInputChange('hashtags', e.target.value)}
                            fullWidth
                            placeholder="e.g., technology, news, update"
                            required
                        />
                        <TextField
                            label="Source Link"
                            value={newNews.source_link}
                            onChange={(e) => handleInputChange('source_link', e.target.value)}
                            fullWidth
                            placeholder="https://example.com"
                            required
                        />
                        <Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="edit-image-upload"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="edit-image-upload">
                                <Button variant="outlined" component="span" fullWidth>
                                    {newNews.image ? newNews.image.name : 'Upload New Image (optional)'}
                                </Button>
                            </label>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setEditDialogOpen(false);
                        setEditingNews(null);
                        setNewNews({
                            title: '',
                            description: '',
                            hashtags: '',
                            image: null,
                            source_link: ''
                        });
                    }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleUpdateNews}
                        variant="contained"
                        disabled={editLoading || !newNews.title || !newNews.description}
                    >
                        {editLoading ? <CircularProgress size={20} color="inherit" /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
{/* Sample News Cards
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
))} */}