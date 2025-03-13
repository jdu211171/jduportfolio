import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import { useLocation, useParams } from "react-router-dom";
import styles from "./QA.module.css";
import QATextField from "../../../components/QATextField/QATextField";
import QAAccordion from "../../../components/QAAccordion/QAAccordion";
import TextField from "../../../components/TextField/TextField";
import ProfileConfirmDialog from "../../../components/Dialogs/ProfileConfirmDialog";

import {
  School,
  AutoStories,
  Face,
  WorkHistory,
  TrendingUp,
} from "@mui/icons-material";
import axios from "../../../utils/axiosUtils";
import {
  Box,
  Tabs,
  Tab,
  Button,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";

import translations from "../../../locales/translations";
import { UserContext } from "../../../contexts/UserContext";

const QA = ({
  data = {},
  handleQAUpdate,
  isFromTopPage = false,
  topEditMode = false,
  updateQA = false,
  currentDraft = {},
  isHonban = false,
  handleDraftUpsert = () => {},
  setTopEditMode = () => {},
}) => {
  const role = sessionStorage.getItem("role");
  const labels = ["学生成績", "専門知識", "個性", "実務経験", "キャリア目標"];
  let id;
  const { studentId } = useParams();
  const location = useLocation();
  const { userId } = location.state || {};

  const { language } = useContext(UserContext);
  const t = translations[language] || translations.en;

  if (userId != 0 && userId) {
    id = userId;
  } else {
    id = studentId;
  }

  const [studentQA, setStudentQA] = useState(isFromTopPage ? data : {});
  const [editData, setEditData] = useState(isFromTopPage ? data : {});
  const [editMode, setEditMode] = useState(topEditMode);
  const [isFirstTime, setIsFirstTime] = useState(false);

  const [confirmMode, setConfirmMode] = useState(false);
  const [comment, setComment] = useState("test");
  const [reviewMode, setReviewMode] = useState(
    !currentDraft || Object.keys(currentDraft).length === 0
  );
  const [passedDraft, setPassedDraft] = useState(currentDraft);
  const fetchStudent = async () => {
    try {
      if (!(Object.keys(data).length > 0)) {
        let answers;
        if (id) {
          answers = (await axios.get(`/api/qa/student/${id}`)).data;
        }

        const questions = JSON.parse(
          (await axios.get("/api/settings/studentQA")).data.value
        );
        let response;
        if (answers) {
          response = combineQuestionsAndAnswers(questions, answers);
        } else {
          response = questions;
        }

        setStudentQA(response);
        setEditData(response);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id, updateQA]);

  useEffect(() => {
    setEditData(isFromTopPage ? data : {});
  }, [updateQA]);

  useEffect(() => {
    setEditMode(topEditMode);
  }, [topEditMode]);

  const handleUpdate = (category, keyName, value, qa) => {
    setEditData((prevEditData) => {
      const updatedEditData = { ...prevEditData };
      if (updatedEditData[category]) {
        updatedEditData[category] = {
          ...updatedEditData[category],
          [keyName]: {
            ...updatedEditData[category][keyName],
            [qa]: value,
          },
        };
      }
      return updatedEditData;
    });
    if (isFromTopPage) {
      handleQAUpdate(editData);
    }
  };

  const updateComment = (key, value) => {
    setComment(() => ({
      [key]: value,
    }));
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setTopEditMode(!editMode);
  };
  const toggleConfirmMode = () => {
    setConfirmMode((prev) => !prev);
  };

  // ---------------------
  // Confirm Profile Handler
  // ---------------------
  const handleConfirmProfile = async () => {
    try {
      // Example final confirmation logic:
      const res = await axios.put(`/api/draft/${currentDraft.id}/submit`);
      if (res.status == 200) {
        showAlert(t["profileConfirmed"], "success");
      }
    } catch (error) {
      showAlert(t["errorConfirmingProfile"], "error");
    } finally {
      // Always close the dialog
      setConfirmMode(false);
    }
  };

  const approveProfile = async (value) => {
    try {
      // Example final confirmation logic:
      const res = await axios.put(`/api/draft/status/${currentDraft.id}`, {
        status: value,
        comments: comment.comment,
      });
      showAlert(t["profileConfirmed"], "success");
    } catch (error) {
      showAlert(t["errorConfirmingProfile"], "error");
    } finally {
      // Always close the dialog
      setConfirmMode(false);
    }
  };

  const setProfileVisible = async (visibility) => {
    try {
      // Example final confirmation logic:
      const res = await axios.put(`/api/students/${id}`, {
        visibility: visibility,
      });
      showAlert(t["profileConfirmed"], "success");
    } catch (error) {
      showAlert(t["errorConfirmingProfile"], "error");
    } finally {
      // Always close the dialog
      setConfirmMode(false);
    }
  };

  const handleSave = async () => {
    try {
      if (role == "Admin") {
        let questions = removeKey(editData, "answer");

        const updatedValue = JSON.stringify(questions); // Ensure it is stringified

        // Send a PUT request to save the updated FAQ data
        const response = await axios.put(`/api/settings/studentQA`, {
          value: updatedValue,
        });
        showAlert("Changes saved successfully!", "success");
        setEditMode(false);
        setTopEditMode(false);
      } else {
        let answers = removeKey(editData, "question");
        let res;
        if (isFirstTime) {
          res = await axios.post("/api/qa/", { studentId: id, data: answers });
        } else {
          res = await axios.put(`/api/qa/${id}`, { data: answers });
        }
        setStudentQA(res.data);
        setEditMode(false);
        setTopEditMode(false);
      }

      showAlert("Changes saved successfully!", "success");
    } catch (error) {
      console.error("Error saving student data:", error);
      showAlert("Error saving changes.", "error");
    }
  };

  const handleCancel = () => {
    fetchStudent();
    setEditMode(false);
    setTopEditMode(false);
  };

  const handleAdd = async () => {
    let keys = Object.keys(getCategoryData(subTabIndex));
    let lastKey = keys[keys.length - 1];
    let nextKeyNumber = parseInt(lastKey.slice(1)) + 1;
    let nextKey = "q" + nextKeyNumber;

    await setEditData((prevEditData) => {
      const updatedEditData = { ...prevEditData };
      const category = labels[subTabIndex];
      if (updatedEditData[category]) {
        updatedEditData[category] = {
          ...updatedEditData[category],
          [nextKey]: {
            question: "",
            answer: "",
          },
        };
      }
      return updatedEditData;
    });
    console.log(
      document
        .querySelectorAll('textarea[aria-invalid="false"]')
        [nextKeyNumber - 1].focus()
    );
  };

  const handleDelete = (indexToDelete) => {
    setEditData((prevEditData) => {
      const updatedEditData = { ...prevEditData };
      const category = labels[subTabIndex];

      if (
        updatedEditData[category] &&
        updatedEditData[category][indexToDelete]
      ) {
        // Delete the key from the category
        delete updatedEditData[category][indexToDelete];
      }

      return updatedEditData;
    });
  };

  const removeKey = (obj, excludeKey) => {
    const newObj = {};

    for (const key in obj) {
      if (key === "idList") {
        // Directly copy idList without modifications
        newObj[key] = obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        newObj[key] = {};
        for (const subKey in obj[key]) {
          if (
            typeof obj[key][subKey] === "object" &&
            obj[key][subKey] !== null
          ) {
            const { [excludeKey]: excluded, ...rest } = obj[key][subKey]; // Exclude the `answer`/`question` key
            newObj[key][subKey] = rest;
          }
        }
      } else {
        newObj[key] = obj[key]; // Copy other non-object properties as-is
      }
    }

    return newObj;
  };

  const combineQuestionsAndAnswers = (questions, answers) => {
    const combinedData = {};
    let firsttime = Object.keys(answers.idList).length === 0;
    if (firsttime) {
      setIsFirstTime(true);
    }
    // Loop through each category (e.g., '専門知識', '個性', etc.)
    for (const category in questions) {
      if (category == "idList") {
        combinedData[category] = answers[category];
      } else {
        combinedData[category] = {};
        // For each question in the category, find the corresponding answer
        for (const key in questions[category]) {
          combinedData[category][key] = {
            question: questions[category][key].question, // Store the question
            answer: firsttime
              ? ""
              : !answers[category][key]
              ? ""
              : answers[category][key].answer, // Store the answer
          };
        }
      }
    }

    return combinedData;
  };

  const [subTabIndex, setSubTabIndex] = useState(0);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const handleSubTabChange = (event, newIndex) => {
    setSubTabIndex(newIndex);
  };

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ open: false, message: "", severity: "" });
  };

  const getCategoryData = (index) => {
    const category = labels[index];
    return editData[category] || {}; // Ensure we return an empty object if category not found
  };

  if (!studentQA) {
    return <div>Loading...</div>;
  }

  const portalContent = (
    <Box className={styles.buttonsContainer}>
      {(role == "Student") | (role == "Admin") && (
        <>
          {editMode ? (
            <>
              {role == "Admin" && (
                <Button
                  onClick={handleAdd}
                  variant="outlined"
                  color="primary"
                  size="small"
                >
                  {t["add"]}
                </Button>
              )}
              {!isHonban && (
                <Button
                  onClick={() => handleDraftUpsert(true)}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {t["updateDraft"]}
                </Button>
              )}
              {role == "Student" && (
                <Button
                  onClick={() => handleDraftUpsert(false)}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {t["saveDraft"]}
                </Button>
              )}
              {role == "Admin" && (
                <Button
                  onClick={handleSave}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {t["save"]}
                </Button>
              )}
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
            <>
              {role == "Student" && !isHonban && (
                <Button
                  onClick={toggleConfirmMode}
                  variant="contained"
                  color="secondary"
                  size="small"
                >
                  {t["submitAgree"]}
                </Button>
              )}
              <Button
                onClick={toggleEditMode}
                variant="contained"
                color="primary"
                size="small"
              >
                {role == "Student" ? t["editProfile"] : ""}
                {role == "Admin" ? t["q_edit"] : ""}
              </Button>
            </>
          )}
        </>
      )}
    </Box>
  );

  return (
    <Box mb={2}>
      {!id && (
        <Box className={styles.topControlButtons} mb={2} px={2}>
          <Box id="saveButton">{portalContent}</Box>
        </Box>
      )}

      <>
        {id &&
          ReactDOM.createPortal(
            portalContent,
            document.getElementById("saveButton")
          )}
      </>

      <Tabs
        className={styles.Tabs}
        value={subTabIndex}
        onChange={handleSubTabChange}
        sx={{
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        <Tab icon={<School />} iconPosition="bottom" label="学生成績" />
        <Tab icon={<AutoStories />} iconPosition="bottom" label="専門知識" />
        <Tab icon={<Face />} iconPosition="bottom" label="個性" />
        <Tab icon={<WorkHistory />} iconPosition="bottom" label="実務経験" />
        <Tab icon={<TrendingUp />} iconPosition="bottom" label="キャリア目標" />
      </Tabs>

      <Box my={2}>
        {editMode &&
          Object.entries(getCategoryData(subTabIndex)).map(
            ([key, { question, answer }]) => (
              <QATextField
                key={key}
                data={studentQA} // Pass any relevant data here if needed
                editData={editData}
                category={labels[subTabIndex]} // Use labels to get the current category
                question={question}
                keyName={key}
                aEdit={role == "Admin"}
                qEdit={role == "Student"}
                updateEditData={handleUpdate}
                DeleteQA={handleDelete}
              />
            )
          )}
      </Box>

      <Box my={2}>
        {!editMode &&
          Object.entries(getCategoryData(subTabIndex)).map(
            ([key, { question, answer }]) =>
              !(question.split("]")[0] == "[任意" && !answer) && (
                <QAAccordion
                  key={key}
                  question={question.split("]")[1]}
                  answer={answer ? answer : "回答なし"}
                  notExpand={id ? false : true}
                />
              )
          )}
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      {/* ---- CONFIRM DIALOG ---- */}
      <ProfileConfirmDialog
        open={confirmMode}
        onClose={toggleConfirmMode}
        onConfirm={handleConfirmProfile}
      />
      {(role == "Staff" || role == "Admin") && !reviewMode && (
        <Box
          sx={{
            borderRadius: "10px",
            background: "#ffe",
            padding: 2,
          }}
        >
          {passedDraft.status != "approved" ? (
            <>
              <TextField
                title="コメント"
                data={comment}
                editData={comment}
                editMode={true}
                updateEditData={updateComment}
                keyName="comments"
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <Button
                  onClick={() => approveProfile("approved")}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  承認済み
                </Button>
                <Button
                  onClick={() => approveProfile("resubmission_required")}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  要修正
                </Button>
              </Box>
            </>
          ) : (
            <>
              {role == "Admin" && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <Button
                    onClick={() => setProfileVisible(false)}
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                    非公開
                  </Button>
                  <Button
                    onClick={() => setProfileVisible(true)}
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                    公開
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default QA;

