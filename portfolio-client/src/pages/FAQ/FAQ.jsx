import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  useTheme,
  IconButton,
  Button,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DeleteIcon from "@mui/icons-material/Delete";
import FAQstyle from "./FAQ.module.css";

import QATextField from "../../components/QATextField/QATextField";
import QAAccordion from "../../components/QAAccordion/QAAccordion";

import axios from "../../utils/axiosUtils";
import { useAlert } from "../../contexts/AlertContext";

const FAQ = () => {
  const [editData, setEditData] = useState([]);
  const [settings, setSettings] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [role, setRole] = useState(null);

  const showAlert = useAlert();

  const theme = useTheme();

  const fetchFAQ = async () => {
    const userRole = sessionStorage.getItem("role");
    await setRole(userRole);
    try {
      const response = await axios.get("/api/settings/faq"); // Assuming this is the endpoint for FAQ
      await setEditData(JSON.parse(response.data.value)); // Set the FAQ data
    } catch (error) {
      console.error("Error fetching FAQ data:", error);
    }
  };

  const fetchSettings = async () => {
    const keys = ["contactEmail", "contactPhone", "workingHours", "location"]; // Define the keys here

    try {
      // Make the GET request to the endpoint with the keys
      const response = await axios.get("/api/settings", {
        params: {
          keys: keys.join(","), // Convert the array into a comma-separated string
        },
      });

      // Process the response and return the settings object
      const data = response.data;
      setSettings(data);
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Handle errors appropriately, for example by showing a notification
      throw new Error("Failed to fetch settings");
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchFAQ();
  }, []);

  const handleUpdate = (keyName, value, qa) => {
    setEditData((prevEditData) => {
      // Clone the previous editData
      const updatedEditData = [...prevEditData];

      // If the key exists, update the corresponding value
      if (updatedEditData[keyName]) {
        updatedEditData[keyName] = {
          ...updatedEditData[keyName],
          [qa]: value, // Update the 'answer' field
        };
      }

      return updatedEditData;
    });
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  const handleSave = async () => {
    try {
      const updatedValue = JSON.stringify(editData); // Ensure it is stringified

      // Send a PUT request to save the updated FAQ data
      const response = await axios.put(`/api/settings/faq`, {
        value: updatedValue,
      });

      if (response.status === 200) {
        setEditMode(false);
        showAlert("Changes saved successfully!", "success");
      }
    } catch (error) {
      console.error("Error updating FAQ data:", error);
    }
  };

  const handleCancel = () => {
    fetchFAQ();
    setEditMode(false);
  };

  const handleAdd = async () => {
    await setEditData((prevEditData) => [
      ...prevEditData,
      { question: "", answer: "" },
    ]);
    console.log(
      document
        .querySelectorAll('textarea[aria-invalid="false"]')
        [editData.length * 2].focus()
    );
  };

  const handleDelete = (indexToDelete) => {
    setEditData((prevEditData) =>
      prevEditData.filter((_, index) => {
        return index != indexToDelete;
      })
    );
  };

  return (
    <Container>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography variant="h5" gutterBottom className={FAQstyle["faq-title"]}>
          FAQ
        </Typography>
        <Box display={"flex"} gap={"10px"}>
          {role == "Admin" && (
            <>
              {editMode ? (
                <>
                  <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                    保存
                  </Button>

                  <Button
                    onClick={handleCancel}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleAdd}
                    variant="outlined"
                    color="primary"
                    size="small"
                  >
                    追加
                  </Button>
                </>
              ) : (
                <Button
                  onClick={toggleEditMode}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  QAを編集
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>
      <Box className={FAQstyle["faq-content"]}>
        <Box my={2}>
          {editMode &&
            Object.entries(editData).map(([key, { question, answer }]) => (
              <Box key={key}>
                <QATextField
                  data={editData} // Pass any relevant data here if needed
                  editData={editData}
                  category={false} // Use labels to get the current category
                  question={question}
                  keyName={key}
                  updateEditData={handleUpdate}
                  DeleteQA={handleDelete}
                  aEdit={role == "Admin"}
                  qEdit={role == "Admin"}
                />
              </Box>
            ))}
        </Box>

        <Box my={2}>
          {!editMode &&
            Object.entries(editData).map(([key, { question, answer }]) => (
              <QAAccordion
                key={key}
                question={question}
                answer={answer ? answer : "回答なし"}
              />
            ))}
        </Box>
      </Box>

      <Box position={"absolute"} bottom={"8px"}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <Box display="flex">
              <EmailIcon className={FAQstyle["faq-icons"]} />
              <Typography sx={{ ml: 1 }}>{settings.contactEmail}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Box display="flex">
              <PhoneIcon className={FAQstyle["faq-icons"]} />
              <Typography sx={{ ml: 1 }}>{settings.contactPhone}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Box display="flex">
              <AccessTimeIcon className={FAQstyle["faq-icons"]} />
              <Typography sx={{ ml: 1 }}>{settings.workingHours}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Box display="flex">
              <LocationOnIcon className={FAQstyle["faq-icons"]} />
              <Typography sx={{ ml: 1 }}>{settings.location}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default FAQ;
