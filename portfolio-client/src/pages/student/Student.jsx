import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";

import axios from "../../utils/axiosUtils";
import { useLanguage } from "../../contexts/LanguageContext"; // Подключение контекста языка
import translations from "../../locales/translations"; // Подключение переводов

const Student = ({ OnlyBookmarked = false }) => {
  const { language } = useLanguage(); // Получение текущего языка из контекста
  const t = (key) => translations[language][key] || key; // Функция перевода
  const [filterState, setFilterState] = useState({});
  const [updatedBookmark, setUpdatedBookmark] = useState({
    studentId: null,
    timestamp: new Date().getTime(),
  });
  const recruiterId = JSON.parse(sessionStorage.getItem("loginUser")).id;

  const filterProps = [
    {
      key: "semester",
      label: t("grade"), // Переводится
      type: "checkbox",
      options: [t("grade1"), t("grade2"), t("grade3"), t("grade4")],
      minWidth: "120px",
    },
    {
      key: "it_skills",
      label: t("programming_languages"),
      type: "checkbox",
      options: ["JS", "Python", "Java", "SQL"],
      minWidth: "160px",
    },
    {
      key: "jlpt",
      label: t("jlpt"),
      type: "checkbox",
      options: ["N1", "N2", "N3", "N4", "N5"],
      minWidth: "160px",
    },
    // {  //deleted from table // todo, disscuss, whether it is managed by student?
    //   key: "ielts",
    //   label: t("ielts"),
    //   type: "checkbox",
    //   options: ["6.0", "6.5", "7.0", "7.5", "8.0"],
    //   minWidth: "160px",
    // },
    {
      key: "jdu_japanese_certification",
      label: t("jdu_certification"),
      type: "checkbox",
      options: ["Q1", "Q2", "Q3", "Q4", "Q5"],
      minWidth: "160px",
    },
    {
      key: "partner_university_credits",
      label: t("credits"),
      type: "radio",
      options: ["20", "40", "60", "80", "100"],
      unit: t("credits_unit"),
      minWidth: "160px",
    },
    {
      key: "partner_university",
      label: t("partner_university"),
      type: "checkbox",
      options: [
        t("tokyo_communication_university"),
        t("sanno_junior_college"),
        t("kyoto_university"),
        t("otemae_university"),
        t("niigata_university"),
      ],
      minWidth: "160px",
    },
    {
      key: "other_information",
      label: t("special_skills"),
      type: "radio",
      options: [t("yes"), t("no")],
      minWidth: "160px",
    },
  ];

  const handleFilterChange = (newFilterState) => {
    setFilterState(newFilterState);
  };

  const navigate = useNavigate();

  const navigateToProfile = (student) => {
    navigate(`profile/${student.id}`);
  };

  const addToBookmark = async (student) => {
    try {
      const response = await axios.post("/api/bookmarks/toggle", {
        studentId: student.id,
        recruiterId,
      });
      setUpdatedBookmark({
        studentId: response.data.studentId,
        timestamp: new Date().getTime(),
      });
    } catch (error) {
      console.error("Error bookmarking student:", error);
    }
  };

  const headers = [
    {
      id: "bookmark",
      numeric: false,
      disablePadding: true,
      label: "",
      type: "bookmark",
      role: "Recruiter",
      onClickAction: addToBookmark,
    },
    {
      id: "first_name",
      numeric: false,
      disablePadding: true,
      label: t("student"),
      type: "avatar",
      minWidth: "220px",
      onClickAction: navigateToProfile,
    },
    {
      id: "email",
      numeric: false,
      disablePadding: false,
      label: t("email"),
      type: "email",
      minWidth: "160px",
      visibleTo: ["Admin", "Staff"],
    },
    {
      id: "jlpt",
      numeric: true,
      disablePadding: false,
      label: t("jlpt"),
      minWidth: "160px",
      isJSON: true,
    },
    {
      id: "partner_university",
      numeric: false,
      disablePadding: false,
      label: t("partner_university"),
      isJSON: false,
    },
  ];

  const tableProps = {
    headers: headers,
    dataLink: "/api/students",
    filter: filterState,
    recruiterId: recruiterId,
    OnlyBookmarked: OnlyBookmarked,
  };

  return (
    <div key={language}>
      {" "}
      {/* Перерендеринг при смене языка */}
      <Box sx={{ width: "100%", height: "100px" }}>
        <Filter
          fields={filterProps}
          filterState={filterState}
          onFilterChange={handleFilterChange}
        />
      </Box>
      <Table tableProps={tableProps} updatedBookmark={updatedBookmark} />
    </div>
  );
};

export default Student;

