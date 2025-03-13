import React, { useContext } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';
import translations from "../../locales/translations";
import { UserContext } from '../../contexts/UserContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { language } = useContext(UserContext); // Получаем текущий язык из контекста
  const t = translations[language] || translations.en; // Получаем переводы для текущего языка

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Box className={styles.notfoundBackground}>
      <Container maxWidth="md" className={styles.notfoundContainer}>
        <Typography variant="h3" gutterBottom>
          {t.notFoundTitle} {/* Перевод заголовка */}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {t.notFoundMessage} {/* Перевод сообщения */}
        </Typography>
        <Button onClick={handleBackToHome} variant="contained" className={styles.notfoundButton}>
          {t.backToHome} {/* Перевод кнопки */}
        </Button>
      </Container>
    </Box>
  );
};

export default NotFound;
