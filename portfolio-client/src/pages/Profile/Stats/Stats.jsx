import React, { useState, useEffect } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import axios from "../../../utils/axiosUtils";
import certificateColors from "../../../utils/certificates";
import { Box, Tabs, Tab, Snackbar, Alert } from "@mui/material";
import CreditsProgressBar from "../../../components/CreditsProgressBar/CreditsProgressBar";
import SkillSelector from "../../../components/SkillSelector/SkillSelector";
import styles from "./Stats.module.css";

const Stats = () => {
  let id;
  const { studentId } = useParams();
  const location = useLocation();
  const { userId } = location.state || {};

  if (userId != 0 && userId) {
    id = userId;
  } else {
    id = studentId;
  }

  const [student, setStudent] = useState(null);
  const [kintoneData, setKintoneData] = useState({});
  const [editData, setEditData] = useState({});
  const [certificates, setCertificates] = useState({});
  const [subTabIndex, setSubTabIndex] = useState(0);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentResponse = await axios.get(`/api/students/${id}`);
        const studentData = studentResponse.data;

        const kintoneResponse = await axios.post(`/api/kintone/getby`, {
          table: "student_credits",
          col: "studentId",
          val: studentData.student_id,
        });

        if (kintoneResponse.data.records.length > 0) {
          setKintoneData(kintoneResponse.data.records[0]);
        }

        const fetchCertificates = async () => {
          setCertificateData("main", "JLPT", JSON.parse(studentData.jlpt));
          setCertificateData(
            "main",
            "JDU_JLPT",
            JSON.parse(studentData.jdu_japanese_certification)
          );
          setCertificateData("main", "IELTS", JSON.parse(studentData.ielts));
          setCertificateData(
            "other",
            "日本語弁論大会学内",
            JSON.parse(studentData.japanese_speech_contest)
          );
          setCertificateData(
            "other",
            "ITコンテスト学内",
            JSON.parse(studentData.it_contest)
          );

          setStudent(studentData);
        };

        await fetchCertificates();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const setCertificateData = (key, type, data) => {
    // Create a temporary array to hold the processed data
    let temp = [];
    // Process each item in the data array
    if (key == "main") {
      data?.list?.forEach((x) => {
        let obj = {
          name: x.level,
          date: x.date.slice(0, 7),
          color: certificateColors[type][x.level],
        };
        temp.push(obj);
      });
    } else {
      data?.list?.forEach((x) => {
        let obj = {
          name: x.level,
          date: x.date.slice(0, 7),
          color: certificateColors[key][x.level],
        };
        temp.push(obj);
      });
    }
    // Update the certificates state immutably
    setCertificates((prevCertificates) => ({
      ...prevCertificates,
      [key]: {
        ...prevCertificates[key],
        [type]: temp,
      },
    }));
  };

  const handleSubTabChange = (event, newIndex) => {
    setSubTabIndex(newIndex);
  };

  const openCreditDetails = (event) => {
    event.preventDefault();
    // Create an object with student data
    let tempStudent = {
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      partner_university: student.partner_university,
    };

    // Convert the object to a JSON string
    const studentData = JSON.stringify(tempStudent);

    // Open a new window with the student data included in the URL as a parameter
    const newWindow = window.open(
      `/credit-details?student=${encodeURIComponent(studentData)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  function base64EncodeUnicode(str) {
    // Encode to Base64
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode("0x" + p1)
      )
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ open: false, message: "", severity: "" });
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  const breakpoints = [
    { label: "入学", point: 0 },
    { label: "", point: 19 },
    { label: "", point: 38 },
    { label: "", point: 57 },
    { label: "卒業", point: 76 },
  ];

  const breakpoints2 = [
    { label: "入学", point: 0 },
    { label: "", point: 31 },
    { label: "", point: 62 },
    { label: "", point: 93 },
    { label: "卒業", point: 124 },
  ];

  return (
    <Box my={2}>
      <Tabs
        className={styles.Tabs}
        value={subTabIndex}
        onChange={handleSubTabChange}
      >
        <Tab label="JDU" />
        <Tab label={student.partner_university} />
      </Tabs>
      {subTabIndex === 0 && (
        <Box my={2}>
          JDU
          <CreditsProgressBar
            breakpoints={breakpoints}
            unit="単位"
            credits={
              JSON.stringify(kintoneData) !== "{}"
                ? Number(kintoneData.businessSkillsCredits?.value) +
                  Number(kintoneData.japaneseEmploymentCredits?.value)
                : 0
            }
            semester={
              JSON.stringify(kintoneData) !== "{}"
                ? kintoneData.semester?.value
                : 0
            }
          />
        </Box>
      )}
      {subTabIndex === 1 && (
        <Box my={2}>
          {student.partner_university}
          <CreditsProgressBar
            breakpoints={breakpoints2}
            unit="単位"
            credits={
              JSON.stringify(kintoneData) !== "{}"
                ? kintoneData.partnerUniversityCredits.value
                : 0
            }
            semester={
              JSON.stringify(kintoneData) !== "{}"
                ? kintoneData.semester?.value
                : 0
            }
          />
        </Box>
      )}
      <Link
        href="#"
        underline="hover"
        color="primary"
        style={{ fontWeight: 800 }}
        onClick={openCreditDetails}
      >
        詳細はこちらへ
      </Link>
      <Box my={2}>
        <SkillSelector
          title="資格"
          headers={{
            JLPT: "",
            JDU日本語認定試験: "",
            IELTS: "",
          }}
          data={certificates}
          editData={editData}
          showAutocomplete={true}
          showHeaders={false}
          keyName="main"
        />
        <SkillSelector
          title="その他"
          headers={{
            上級: "3年間以上",
            中級: "1年間〜1年間半",
            初級: "基礎",
          }}
          data={certificates}
          editData={editData}
          showAutocomplete={false}
          showHeaders={false}
          keyName="other"
        />
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
    </Box>
  );
};

export default Stats;
