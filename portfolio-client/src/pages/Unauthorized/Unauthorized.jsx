import React, { useContext } from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import translations from "../../locales/translations";
import styles from "./Unauthorized.module.css";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { language } = useContext(UserContext);
  const t = translations[language] || translations.en;

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <Box className={styles.unauthorizedBackground}>
      <Container maxWidth="md" className={styles.unauthorizedContainer}>
        <Typography variant="h3" gutterBottom>
          {t.unauthorizedTitle}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {t.unauthorizedMessage}
        </Typography>
        <Button
          onClick={handleBackToLogin}
          variant="contained"
          className={styles.unauthorizedButton}
        >
          {t.unauthorizedButton}
        </Button>
      </Container>
    </Box>
  );
};

export default Unauthorized;
