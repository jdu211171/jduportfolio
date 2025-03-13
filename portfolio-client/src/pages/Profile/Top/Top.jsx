import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import ReactDOM from "react-dom";

import axios from "../../../utils/axiosUtils";
import { Box, Tabs, Tab, Button } from "@mui/material";
import Gallery from "../../../components/Gallery";
import TextField from "../../../components/TextField/TextField";
import SkillSelector from "../../../components/SkillSelector/SkillSelector";
import Deliverables from "../../../components/Deliverables/Deliverables";
import DraftsModal from "../../../components/Modals/DraftsModal";
import QA from "../../../pages/Profile/QA/QA";
import { useAlert } from "../../../contexts/AlertContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import translations from "../../../locales/translations";
import styles from "./Top.module.css";

const Top = () => {
  let id;
  const role = sessionStorage.getItem("role");
  const { studentId } = useParams();
  const location = useLocation();
  const { userId } = location.state || {};
  const statedata = location.state?.student;

  const { language } = useLanguage();
  const showAlert = useAlert();

  // Translation helper
  const t = (key) => translations[language][key] || key;

  if (userId !== 0 && userId) {
    id = userId;
  } else {
    id = studentId;
  }

  // ---------------------
  // Component state
  // ---------------------
  const [student, setStudent] = useState(null);
  const [editData, setEditData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [isHonban, setIsHonban] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [currentDraft, setCurrentDraft] = useState({});

  const [currentProfileType, setCurrentProfileType] = useState(
    "本番（承認済み）のプロフィールを閲覧中です。"
  );
  const [updateQA, SetUpdateQA] = useState(true);

  const [newImages, setNewImages] = useState([]);
  const [deletedUrls, setDeletedUrls] = useState([]);
  const [deliverableImages, setDeliverableImages] = useState({});
  const [subTabIndex, setSubTabIndex] = useState(0);

  // ---------------------
  // Fetch student data
  // ---------------------
  const fetchStudent = async () => {
    if (statedata) {
      setDraft(statedata.drafts[0]);
      if (
        statedata.drafts[0].status == "checking" ||
        statedata.drafts[0].status == "approved"
      ) {
        setIsChecking(true);
      } else {
        setIsChecking(false);
      }
    } else {
      try {
        const response = await axios.get(`/api/students/${id}`);
        const mappedData = mapData(response.data);
        setStudent(mappedData);
        setEditData(mappedData);
        SetUpdateQA(!updateQA);
      } catch (error) {
        showAlert("Error fetching student data", "error");
      }
    }
  };

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Function to structure incoming data into "draft"
  const mapData = (data) => {
    const draftKeys = [
      "deliverables",
      "gallery",
      "self_introduction",
      "hobbies",
      "other_information",
      "it_skills",
      "skills",
    ];

    return {
      ...data,
      draft: draftKeys.reduce((acc, key) => {
        acc[key] = data[key] || "";
        return acc;
      }, {}),
    };
  };

  // Handlers for applying a previously saved draft / honban
  const setHonban = () => {
    setCurrentProfileType("本番（承認済み）のプロフィールを閲覧中です。");
    setIsHonban(true);
    setCurrentDraft({});
    fetchStudent();
  };

  const setTopEditMode = (val) => {
    setEditMode(val);
  };

  const setDraft = (draft) => {
    if (draft.status != "approved") {
      setCurrentProfileType("下書きのプロフィールを閲覧中です。");
      setIsHonban(false);
    } else {
      setIsHonban(true);
      setCurrentProfileType("本番（承認済み）のプロフィールを閲覧中です。");
    }
    setCurrentDraft(draft);
    setEditData((prevEditData) => {
      const updatedEditData = {
        ...prevEditData,
        draft: draft.profile_data,
      };
      setStudent(updatedEditData);
      return updatedEditData;
    });
    SetUpdateQA(!updateQA);
  };

  const updateDraftStatus = async (draftId) => {
    const res = await axios.put(`/api/draft/status/${draftId}`, {
      status: "checking",
      reviewed_by: userId,
    });
    if (res.status == 200) {
      showAlert(t("setToChecking"), "success");
      setIsChecking(true);
    }
  };

  // ---------------------
  // Edit data update
  // ---------------------
  const handleUpdateEditData = (key, value) => {
    setEditData((prevEditData) => ({
      ...prevEditData,
      draft: {
        ...prevEditData.draft,
        [key]: value,
      },
    }));
  };

  // ---------------------
  // Edit data update
  // ---------------------
  const handleQAUpdate = (value) => {
    setEditData((prevEditData) => {
      const updatedEditData = {
        ...prevEditData,
        draft: {
          ...prevEditData.draft, // Preserve existing draft data
          qa: value, // Save inside `qa` within `draft`
        },
      };
      setStudent(updatedEditData);
      return updatedEditData;
    });
  };

  // ---------------------
  // Gallery updates
  // ---------------------
  const handleGalleryUpdate = (
    files,
    isNewFiles = false,
    isDelete = false,
    parentKey = null
  ) => {
    if (isNewFiles && !isDelete) {
      // Add new images
      const newFiles = Array.from(files);
      setNewImages((prevImages) => [...prevImages, ...newFiles]);
    } else if (isDelete) {
      // Deleting an image
      if (isNewFiles) {
        // If we're deleting from the newImages array
        setNewImages((prevImages) => prevImages.filter((_, i) => i !== files));
      } else {
        // If we're deleting from existing images
        const oldFiles = parentKey
          ? [...editData[parentKey].gallery]
          : [...editData.draft.gallery];

        deletedUrls.push(oldFiles[files]);
        oldFiles.splice(files, 1);

        if (parentKey) {
          handleUpdateEditData("gallery", oldFiles);
        } else {
          handleUpdateEditData("gallery", oldFiles);
        }
      }
    }
  };

  // Handle each deliverable image
  const handleImageUpload = (activeDeliverable, file) => {
    setDeliverableImages((prevImages) => ({
      ...prevImages,
      [activeDeliverable]: file,
    }));
  };

  // ---------------------
  // Toggle states
  // ---------------------
  const toggleEditMode = () => setEditMode((prev) => !prev);

  // ---------------------
  // Save / Draft Handlers
  // ---------------------
  const handleSave = async () => {
    try {
      const formData = new FormData();
      newImages.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      formData.append("role", role);
      formData.append("imageType", "Gallery");
      formData.append("id", id);

      deletedUrls.forEach((url, index) => {
        formData.append(`oldFilePath[${index}]`, url);
      });

      // Upload new/deleted images
      const fileResponse = await axios.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      let oldFiles = editData.draft.gallery;

      // If multiple files
      if (Array.isArray(fileResponse.data)) {
        fileResponse.data.forEach((file) => {
          oldFiles.push(file.Location);
        });
      }
      // If only one file
      else if (fileResponse.data.Location) {
        oldFiles.push(fileResponse.data.Location);
      }

      await handleUpdateEditData("gallery", oldFiles);

      // Handle deliverable images
      for (const [index, file] of Object.entries(deliverableImages)) {
        if (file) {
          const deliverableFormData = new FormData();
          deliverableFormData.append("role", role);
          deliverableFormData.append("file", file);
          deliverableFormData.append("imageType", "Deliverable");
          deliverableFormData.append("id", id);
          deliverableFormData.append(
            "oldFilePath",
            editData.draft.deliverables[index]?.imageLink || ""
          );

          const deliverableFileResponse = await axios.post(
            "/api/files/upload",
            deliverableFormData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          const deliverableImageLink = deliverableFileResponse.data.Location;
          // Update the deliverable's imageLink
          editData.draft.deliverables[index].imageLink = deliverableImageLink;
        }
      }

      // Finally, update student data
      await axios.put(`/api/students/${id}`, editData);

      // Reset states
      setStudent(editData);
      setNewImages([]);
      setDeletedUrls([]);
      setEditMode(false);

      showAlert(t("changesSavedSuccessfully"), "success");
    } catch (error) {
      console.error("Error saving student data:", error);
      showAlert(t("errorSavingChanges"), "error");
    }
  };

  const handleDraftUpsert = async (update = false) => {
    try {
      const formData = new FormData();
      newImages.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      formData.append("role", role);
      formData.append("imageType", "Gallery");
      formData.append("id", id);

      deletedUrls.forEach((url, index) => {
        formData.append(`oldFilePath[${index}]`, url);
      });

      // Upload new/deleted images
      const fileResponse = await axios.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      let oldFiles = editData.draft.gallery;

      if (Array.isArray(fileResponse.data)) {
        fileResponse.data.forEach((file) => {
          oldFiles.push(file.Location);
        });
      } else if (fileResponse.data.Location) {
        oldFiles.push(fileResponse.data.Location);
      }

      await handleUpdateEditData("gallery", oldFiles);

      // Handle deliverable images
      for (const [index, file] of Object.entries(deliverableImages)) {
        if (file) {
          const deliverableFormData = new FormData();
          deliverableFormData.append("role", role);
          deliverableFormData.append("file", file);
          deliverableFormData.append("imageType", "Deliverable");
          deliverableFormData.append("id", id);
          deliverableFormData.append(
            "oldFilePath",
            editData.draft.deliverables[index]?.imageLink || ""
          );

          const deliverableFileResponse = await axios.post(
            "/api/files/upload",
            deliverableFormData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          const deliverableImageLink = deliverableFileResponse.data.Location;
          editData.draft.deliverables[index].imageLink = deliverableImageLink;
        }
      }

      const draftData = {
        student_id: editData.student_id,
        profile_data: editData.draft,
        status: "draft",
        submit_count: 0,
      };
      if (!update) {
        // Save draft
        const res = await axios.post(`/api/draft`, draftData);
        setCurrentDraft(res.data);
      } else {
        // Update draft
        const res = await axios.put(`/api/draft/${currentDraft.id}`, draftData);
      }

      // Reset
      setStudent(editData);
      setNewImages([]);
      setDeletedUrls([]);
      setEditMode(false);
      showAlert(t("changesSavedSuccessfully"), "success");
    } catch (error) {
      console.error("Error saving student data:", error);
      showAlert(t("errorSavingChanges"), "error");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditData(student);
    setEditMode(false);
  };

  // ---------------------
  // Tab handling
  // ---------------------
  const handleSubTabChange = (event, newIndex) => {
    setSubTabIndex(newIndex);
  };

  if (!student) {
    return <div>{t("loading")}</div>;
  }

  // ---------------------
  // Button Portal Content
  // ---------------------
  const portalContent = (
    <Box className={styles.buttonsContainer}>
      {role === "Student" && (
        <>
          {editMode ? (
            <>
              {!isHonban && (
                <Button
                  onClick={() => handleDraftUpsert(true)}
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  {t("updateDraft")}
                </Button>
              )}
              <Button
                onClick={() => handleDraftUpsert(false)}
                variant="contained"
                color="primary"
                size="small"
              >
                {t("saveDraft")}
              </Button>

              {/* <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                size="small"
              >
                {t("save")}
              </Button> */}

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
              {t("editProfile")}
            </Button>
          )}
        </>
      )}
    </Box>
  );

  return (
    <Box my={2}>
      <>
        {subTabIndex !== 2 &&
          ReactDOM.createPortal(
            portalContent,
            document.getElementById("saveButton")
          )}
      </>

      <Box className={styles.TabsContainer}>
        <Tabs
          className={styles.Tabs}
          value={subTabIndex}
          onChange={handleSubTabChange}
        >
          <Tab label={t("selfIntroduction")} />
          <Tab label={t("deliverables")} />
          <Tab label={t("qa")} />
        </Tabs>
        {role == "Student" && (
          <DraftsModal
            id={editData.student_id}
            handleSettingtoHonban={setHonban}
            handleSettingDraft={setDraft}
          />
        )}
      </Box>
      {role == "Staff" && !isChecking && (
        <Box
          sx={{
            my: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={() => updateDraftStatus(currentDraft.id)}
            variant="contained"
            color="warning"
            size="small"
            sx={{ width: "80%", height: "36px", fontSize: "18px" }}
          >
            {t("start_checking")}
          </Button>
        </Box>
      )}
      {role == "Student" && (
        <Box
          sx={{
            mt: "8px",
            textAlign: "center",
            color: isHonban ? "green" : "red",
          }}
        >
          {currentProfileType}
        </Box>
      )}
      {subTabIndex === 0 && (
        <Box my={2}>
          <TextField
            title={t("selfIntroduction")}
            data={student.draft.self_introduction}
            editData={editData}
            editMode={editMode}
            updateEditData={handleUpdateEditData}
            keyName="self_introduction"
            parentKey="draft"
          />
          <Gallery
            galleryUrls={editData}
            newImages={newImages}
            deletedUrls={deletedUrls}
            editMode={editMode}
            updateEditData={handleGalleryUpdate}
            keyName="gallery"
            parentKey="draft"
          />
          <TextField
            title={t("hobbies")}
            data={student.draft.hobbies}
            editData={editData}
            editMode={editMode}
            updateEditData={handleUpdateEditData}
            keyName="hobbies"
            parentKey="draft"
          />
          <TextField
            title={t("specialSkills")}
            data={student.draft.other_information}
            editData={editData}
            editMode={editMode}
            updateEditData={handleUpdateEditData}
            keyName="other_information"
            parentKey="draft"
          />
          <SkillSelector
            title={t("itSkills")}
            headers={{
              上級: t("threeYearsOrMore"),
              中級: t("threeYearsOrMore"),
              初級: t("oneToOneAndHalfYears"),
            }}
            data={student.draft}
            editData={editData}
            editMode={editMode}
            updateEditData={handleUpdateEditData}
            showAutocomplete={true}
            showHeaders={true}
            keyName="it_skills"
            parentKey="draft"
          />
          <SkillSelector
            title={t("otherSkills")}
            headers={{
              上級: "3年間以上",
              中級: "1年間〜1年間半",
              初級: "基礎",
            }}
            data={student.draft}
            editMode={editMode}
            editData={editData}
            updateEditData={handleUpdateEditData}
            showAutocomplete={false}
            showHeaders={false}
            keyName="skills"
            parentKey="draft"
          />
        </Box>
      )}

      {subTabIndex === 1 && (
        <Box my={2}>
          <Deliverables
            data={student.draft.deliverables}
            editMode={editMode}
            editData={editData.draft.deliverables}
            updateEditData={handleUpdateEditData}
            onImageUpload={handleImageUpload}
            keyName="deliverables"
          />
        </Box>
      )}

      {subTabIndex === 2 && (
        <Box my={2}>
          <QA
            updateQA={updateQA}
            data={editData.draft.qa}
            currentDraft={currentDraft}
            handleQAUpdate={handleQAUpdate}
            isFromTopPage={true}
            topEditMode={editMode}
            handleDraftUpsert={handleDraftUpsert}
            isHonban={isHonban}
            setTopEditMode={setTopEditMode}
          />
        </Box>
      )}
    </Box>
  );
};

export default Top;

