// src/components/TextField.js

import React from "react";
import { TextField as MuiTextField } from "@mui/material";
import styles from "./TextField.module.css"; // Assuming you have some CSS for styling

const TextField = ({
  title,
  data,
  editData,
  editMode,
  updateEditData,
  keyName,
  parentKey,
}) => {
  const handleChange = (e) => {
    updateEditData(keyName, e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.data}>
        {editMode ? (
          <MuiTextField
            value={
              (parentKey
                ? editData[parentKey]?.[keyName]
                : editData[keyName]) || ""
            }
            onChange={handleChange}
            variant="filled"
            fullWidth
            multiline
          />
        ) : (
          <div>{data ? data : "未入力"}</div>
        )}
      </div>
    </div>
  );
};

export default TextField;

