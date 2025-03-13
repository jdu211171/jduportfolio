// src/components/RoleField.js

import React, { useState } from "react";
import { TextField as MuiTextField, IconButton } from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import styles from "./RoleField.module.css"; // Assuming you have some CSS for styling

const RoleField = ({ data, editData, editMode, updateEditData, keyName }) => {
  const [roleText, setRoleText] = useState("");
  const handleRoleTextChange = (e) => {
    setRoleText(e.target.value);
  };

  const handleDelete = (index) => {
    const updatedData = editData[keyName].filter((_, i) => i !== index);
    updateEditData(keyName, updatedData);
  };

  const handleAddRole = () => {
    if (roleText.trim() !== "") {
      const updatedData = [...editData[keyName], roleText];
      updateEditData(keyName, updatedData);
      setRoleText(""); // Clear the input field after adding
    }
  };

  const items = editMode ? editData[keyName] : data;

  return (
    <div className={styles.container}>
      <div className={styles.data}>
        {editMode && (
          <div className={styles.inputButton}>
            <MuiTextField
              value={roleText}
              label="役割を追加"
              onChange={handleRoleTextChange}
              fullWidth
              inputProps={{
                style: {
                  height: "15px",
                },
              }}
            />
            <IconButton onClick={handleAddRole} color="primary" sx={{ ml: 2 }}>
              <Add />
            </IconButton>
          </div>
        )}
        <div>
          <ul className={styles.list}>
            {items.map((role, index) => (
              <li className={styles.listItem} key={"role" + index}>
                {role}
                {editMode && (
                  <Close
                    fontSize="small"
                    className={styles.icon}
                    onClick={() => handleDelete(index)}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoleField;
