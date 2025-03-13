import React, { useState } from "react";

import { Box } from "@mui/material";

import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";
import { useLanguage } from "../../contexts/LanguageContext"; // Import language context
import translations from "../../locales/translations"; // Import translations

const Staff = () => {
  const { language } = useLanguage(); // Get current language from context
  const t = (key) => translations[language][key] || key; // Translation function

  const headers = [
    {
      id: "first_name",
      numeric: false,
      disablePadding: false,
      label: t("staff"), // Translation for "職員"
      type: "avatar",
      minWidth: "220px",
    },
    {
      id: "email",
      numeric: false,
      disablePadding: false,
      label: t("email"), // Translation for "メール"
      type: "email",
      minWidth: "160px",
    },
    {
      id: "department",
      numeric: false,
      disablePadding: false,
      label: t("department"), // Translation for "部署"
      minWidth: "160px",
    },
    {
      id: "position",
      numeric: false,
      disablePadding: false,
      label: t("position"), // Translation for "役職"
      minWidth: "160px",
    },
    {
      id: "phone",
      numeric: true,
      disablePadding: false,
      label: t("phone_number"), // Translation for "電話番号"
      minWidth: "200px",
    },
  ];

  const [filterState, setFilterState] = useState({});
  // must match with db table col names
  const filterProps = [
    { key: "name", label: t("name"), type: "text", minWidth: "160px" }, // Translation for "名前"
  ];

  const tableProps = {
    headers: headers,
    dataLink: "/api/staff",
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

export default Staff;
