import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box } from "@mui/material";

import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";
import { useLanguage } from "../../contexts/LanguageContext";
import translations from "../../locales/translations";

const Recruiter = () => {
  const { language } = useLanguage();
  const t = (key) => translations[language][key] || key;
  const navigate = useNavigate();
  const navigateToCompanyProfile = (recruiter) => {
    navigate(`/companyprofile`, {
      state: { recruiterId: recruiter.id }, // passing state
    });
  };

  const headers = [
    {
      id: "name",
      numeric: false,
      disablePadding: true,
      label: t("recruiter"),
      type: "avatar",
      minWidth: "160px",
      onClickAction: navigateToCompanyProfile,
    },
    {
      id: "company_name",
      numeric: false,
      disablePadding: false,
      label: t("company_name"),
      minWidth: "220px",
    },
    {
      id: "phone",
      numeric: true,
      disablePadding: false,
      label: t("phone_number"),
      minWidth: "160px",
    },
    {
      id: "email",
      numeric: false,
      disablePadding: false,
      label: t("email"),
      type: "email",
      minWidth: "220px",
      visibleTo: ["Admin", "Staff"],
    },
  ];

  const [filterState, setFilterState] = useState({});
  // must match with db table col names
  const filterProps = [
    { key: "name", label: t("name"), type: "text", minWidth: "160px" },
  ];

  const tableProps = {
    headers: headers,
    dataLink: "/api/recruiters",
    filter: filterState,
  };

  const handleFilterChange = (value) => {
    setFilterState(value);
  };

  return (
    <div>
      <Box sx={{ width: "100%", height: "100px" }}>
        <Filter
          fields={filterProps}
          filterState={filterState}
          onFilterChange={handleFilterChange}
        />
      </Box>
      <Table tableProps={tableProps} />
    </div>
  );
};

export default Recruiter;

