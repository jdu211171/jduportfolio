import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../../../utils/axiosUtils";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Grid,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import styles from "./CompanyProfile.module.css";

import Gallery from "../../../components/Gallery";
import TextField from "../../../components/TextField/TextField";

import translations from "../../../locales/translations";
import { useContext } from "react";
import { UserContext } from "../../../contexts/UserContext";

const CompanyProfile = ({ userId = 0 }) => {
  const role = sessionStorage.getItem("role");
  const navigate = useNavigate();
  const location = useLocation();

  const { recruiterId } = location.state || {};
  const { language } = useContext(UserContext);
  const t = translations[language] || translations.en;
  let id;
  if (userId != 0) {
    id = userId;
  } else {
    id = recruiterId;
  }

  const [company, setCompany] = useState(null);
  const [editData, setEditData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [deletedUrls, setDeletedUrls] = useState([]);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get(`/api/recruiters/${id}`);
        setCompany(response.data);
        setEditData(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (id) {
      fetchCompany();
    }
  }, [id]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Append new images to form data
      newImages.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      // Append other necessary fields
      formData.append("role", role);
      formData.append("imageType", "CompanyGallery");
      formData.append("id", id);

      // Append the array of deleted URLs
      deletedUrls.forEach((url, index) => {
        formData.append(`oldFilePath[${index}]`, url);
      });

      // Send the form data via POST requesïït for new images
      const fileResponse = await axios.post("/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update gallery URLs with new file locations
      let oldFiles = editData.gallery;
      if (Array.isArray(fileResponse.data)) {
        fileResponse.data.forEach((file) => {
          oldFiles.push(file.Location);
        });
      } else if (fileResponse.data.Location) {
        oldFiles.push(fileResponse.data.Location);
      }

      await handleUpdateEditData("gallery", oldFiles);

      // Handle deleted URLs

      // Save updated company data
      await axios.put(`/api/recruiters/${id}`, editData);
      setCompany(editData);
      setEditMode(false);
      setNewImages([]);
      setDeletedUrls([]);
    } catch (error) {
      console.error("Error saving company data:", error);
    }
  };

  const handleGalleryUpdate = (files, isNewFiles = false, isDelete = false) => {
    if (isNewFiles && !isDelete) {
      // Convert FileList to an array of files
      const newFiles = Array.from(files);

      // Update the state with new files
      setNewImages((prevImages) => [...prevImages, ...newFiles]);
    } else if (isDelete) {
      if (isNewFiles) {
        // Remove new files (filtered by index)
        setNewImages((prevImages) => prevImages.filter((_, i) => i !== files));
      } else {
        // Remove old files (by index)
        let oldFiles = editData.gallery;
        deletedUrls.push(oldFiles[files]);
        oldFiles.splice(files, 1);
        handleUpdateEditData("gallery", oldFiles);
      }
    }
  };

  const handleCancel = () => {
    setEditData(company);
    setEditMode(!editMode);
  };

  const handleUpdateEditData = (key, value) => {
    setEditData((prevEditData) => ({
      ...prevEditData,
      [key]: value,
    }));
  };

  const [galleryUrls, setGalleryUrls] = useState([]);

  if (!company) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Grid container>
        <Grid></Grid>
      </Grid>

      <Box className={styles.topControlButtons}>
        <Box
          display="flex"
          alignItems="center"
          sx={{
            border: 1,
            borderRadius: 1,
            borderColor: "grey.300",
            flexGrow: 1,
          }}
        >
          <IconButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </IconButton>
          {/* | {t["back"]} */}
        </Box>
        <Box id="saveButton">
          <Box my={2} className={styles.buttonsContainer}>
            {role === "Recruiter" && (
              <>
                {editMode ? (
                  <>
                    <Button
                      onClick={handleSave}
                      variant="contained"
                      color="primary"
                      size="small"
                    >
                      {t["save"]}
                    </Button>

                    <Button
                      onClick={handleCancel}
                      variant="outlined"
                      color="error"
                      size="small"
                    >
                      {t["cancel"]}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={toggleEditMode}
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                    {t["edit_profile"]}
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
      <Box className={styles.container}>
        <Box className={styles.avatarContainer}>
          <Avatar
            src={company.photo}
            alt={company.first_name}
            sx={{ width: 130, height: 130 }}
          />
        </Box>
        <Box className={styles.infoContainer}>
          <Box className={styles.nameEmailContainer}>
            <Box>
              <Typography
                variant="h4"
                component="div"
                className={styles.mainTitle}
              >
                {company.first_name} {company.last_name}
              </Typography>
            </Box>
            {["Admin", "Staff", "Recruiter"].includes(role) && (
              <Box>
                <a href={`mailto:${company.email}`} className={styles.email}>
                  <EmailIcon className={styles.emailIcon} />
                  {company.email}
                </a>
              </Box>
            )}
          </Box>
          <Box className={styles.chipContainer}>
            <Chip
              label={`${company.company_name}`}
              variant="outlined"
              color="primary"
              sx={{
                fontSize: "16px",
                padding: "2px 6px",
                height: "auto",
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box p={2}>
        <TextField
          title={t["company_overview"]}
          data={company.company_description}
          editData={editData}
          editMode={editMode}
          updateEditData={handleUpdateEditData}
          keyName="company_description"
        />
        <Gallery
          galleryUrls={editData}
          newImages={newImages}
          deletedUrls={deletedUrls}
          editMode={editMode}
          updateEditData={handleGalleryUpdate}
          keyName="gallery"
        />
      </Box>
    </Box>
  );
};

export default CompanyProfile;
