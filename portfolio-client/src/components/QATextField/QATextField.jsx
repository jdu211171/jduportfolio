// src/components/QATextField.js

import React, { useState, useEffect } from "react";
import { TextField as MuiTextField, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./QATextField.module.css"; // Assuming you have some CSS for styling

const QATextField = ({
  category,
  question,
  keyName,
  editData,
  updateEditData,
  DeleteQA,
  aEdit = false,
  qEdit = false,
}) => {
  // Initialize editData with the value from props
  const [localEditData, setLocalEditData] = useState("");
  const [localEditQuestion, setLocalQuestion] = useState("");
  // Update localEditData when editData changes
  useEffect(() => {
    if (category == false) {
      setLocalEditData(editData[keyName]?.answer || "");
      setLocalQuestion(editData[keyName]?.question || "");
    } else {
      setLocalEditData(editData[category]?.[keyName]?.answer || "");
      setLocalQuestion(editData[category]?.[keyName]?.question || "");
    }
  }, [editData, category, keyName]);

  const handleChange = (e, fieldType) => {
    const updatedValue = e.target.value;

    if (category == false) {
      if (fieldType === "question") {
        // Update the question field
        setLocalQuestion(updatedValue); // Assuming you're using a state for the question (e.g., `setQuestion`)
      } else if (fieldType === "answer") {
        // Update the answer fields
        setLocalEditData(updatedValue); // Update the answer field (localEditData state)
      }
      updateEditData(keyName, updatedValue, fieldType);
    } else {
      if (fieldType === "question") {
        // Update the question field
        setLocalQuestion(updatedValue); // Assuming you're using a state for the question (e.g., `setQuestion`)
      } else if (fieldType === "answer") {
        // Update the answer fields
        setLocalEditData(updatedValue); // Update the answer field (localEditData state)
      }
      updateEditData(category, keyName, updatedValue, fieldType);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {aEdit ? (
          <Box display={"flex"}>
            <MuiTextField
              value={localEditQuestion}
              onChange={(e) => handleChange(e, "question")} // Pass 'question' as a type identifier
              variant="outlined"
              fullWidth
              multiline
            />
            {aEdit && (
              <IconButton
                aria-label="削除"
                onClick={() => DeleteQA(keyName)}
                sx={{
                  color: "red",
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ) : (
          <div>{localEditQuestion}</div>
        )}
      </div>
      <div className={styles.data}>
        {qEdit ? (
          <MuiTextField
            value={localEditData}
            onChange={(e) => handleChange(e, "answer")} // Pass 'answer' as a type identifier
            variant="outlined"
            fullWidth
            multiline
          />
        ) : (
          <>{!aEdit && <div>{localEditData}</div>}</>
        )}
      </div>
    </div>
  );
};

export default QATextField;
