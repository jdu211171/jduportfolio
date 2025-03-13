import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../../utils/axiosUtils";
import { useAlert } from "../../contexts/AlertContext";
import { useLanguage } from "../../contexts/LanguageContext";

import RichTextEditor from "../../components/RichTextEditor/RichTextEditor";

import styles from "./Home.module.css";
import Photo1 from "../../assets/Photo1.jpg";
import Photo2 from "../../assets/Photo2.jpg";
import { Box, Button } from "@mui/material";

import translations from "../../locales/translations";

const Home = () => {
  const navigate = useNavigate();
  const { language } = useLanguage(); // Получение текущего языка из контекста

  const t = (key) => translations[language][key] || key; // Функция перевода

  const [role, setRole] = useState(null);
  const [editData, setEditData] = useState("");
  const [editMode, setEditMode] = useState(false);

  const showAlert = useAlert();

  const fetchHomePageData = async () => {
    const userRole = sessionStorage.getItem("role");
    setRole(userRole);
    try {
      const response = await axios.get("/api/settings/homepage");
      setEditData(response.data.value);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    }
  };

  const handleContentChange = (newContent) => {
    setEditData(newContent);
  };

  const handleClick = () => {
    navigate("/student");
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  const handleCancel = () => {
    fetchHomePageData();
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/settings/homepage`, {
        value: editData,
      });

      if (response.status === 200) {
        setEditMode(false);
        showAlert(t("changes_saved"), "success");
      }
    } catch (error) {
      console.error("Error updating homepage data:", error);
    }
  };

  useEffect(() => {
    fetchHomePageData();
  }, []);

  return (
    <div key={language}> {/* Динамическое обновление при смене языка */}
      <Box className={styles.header}>
        <h3>
          <a href="https://www.jdu.uz/">Japan Digital University</a>
        </h3>
        <Box display={"flex"} gap={"10px"}>
          {role === "Admin" && (
            <>
              {editMode ? (
                <>
                  <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                    {t("save")}
                  </Button>

                  <Button
                    onClick={handleCancel}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    {t("cancel")}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={toggleEditMode}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {t("edit")}
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>
      <div className={styles.container}>
        <div className={styles.textSection}>
          {editMode && (
            <RichTextEditor value={editData} onChange={handleContentChange} />
          )}

          {!editMode && (
            <p
              className={styles.textParagraph}
              dangerouslySetInnerHTML={{ __html: editData }}
            ></p>
          )}

          <div className={styles.buttonContainer}>
            <button className={styles.button} onClick={handleClick}>
              {t("next_button")}
            </button>
          </div>
        </div>
        <div className={styles.imageSection}>
          <img src={Photo1} alt={t("large_class_photo_alt")} />
          <img src={Photo2} alt={t("group_photo_alt")} />
        </div>
      </div>
    </div>
  );
};

export default Home;
