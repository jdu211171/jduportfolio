import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import styles from "./SkillSelector.module.css";
import skills from "../../utils/skills";

import { useLanguage } from "../../contexts/LanguageContext";
import translations from "../../locales/translations"; // Импортируем переводы

const SkillSelector = ({
  title,
  data,
  editData,
  editMode,
  headers,
  updateEditData,
  keyName,
  showAutocomplete,
  showHeaders,
}) => {
  const [jsonData, setJsonData] = useState(data[keyName]);
  const [editJsonData, setEditJsonData] = useState(editData[keyName]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("初級");

  const { language } = useLanguage(); // Получение текущего языка из контекста
  
  
  const t = (key) => translations[language][key] || key; // Функция перевода
  useEffect(() => {
    setJsonData(data[keyName]);
    setEditJsonData(editData[keyName]);
  }, [data]);
  const handleAddSkill = () => {
    if (selectedSkill && selectedLevel) {
      // Check if the selected skill already exists in any level
      let skillExists = false;
      Object.keys(editJsonData).forEach((level) => {
        if (
          editJsonData[level].some((skill) => skill.name === selectedSkill.name)
        ) {
          skillExists = true;
          // Optional: Notify or handle duplicate skill case here
          alert(
            `Skill "${selectedSkill.name}" is already added for level "${level}"`
          );
        }
      });

      // If skill exists, return without adding
      if (skillExists) {
        return;
      }

      // Skill does not exist, proceed to add it
      const updatedSkills = {
        ...editJsonData,
        [selectedLevel]: [
          ...(editJsonData[selectedLevel] || []),
          {
            name: selectedSkill.name,
            color: selectedSkill.color,
          },
        ],
      };
      setEditJsonData(updatedSkills);
      updateEditData(keyName, updatedSkills);
    }
  };

  const handleDeleteSkill = (skillToDelete, level) => {
    const updatedSkills = {
      ...editJsonData,
      [level]: editJsonData[level].filter(
        (skill) => skill.name !== skillToDelete.name
      ),
    };
    setEditJsonData(updatedSkills);
    updateEditData(keyName, updatedSkills);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.description}>
        {showHeaders &&
          Object.entries(headers).map(([level, description]) => (
            <div key={level}>
              <span style={{ fontWeight: 800 }}>{t("levels")[level]}</span>: {description}
            </div>
          ))}
      </div>
      <hr />
      {editMode && (
        <Box display="flex" alignItems="center" mb={2} mt={2}>
          {showAutocomplete ? (
            <Autocomplete
              options={skills}
              getOptionLabel={(option) => option.name}
              onChange={(event, newValue) => setSelectedSkill(newValue)}
              sx={{ width: 160 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Skill"
                  variant="outlined"
                />
              )}
            />
          ) : (
            <TextField
              onChange={(event) =>
                setSelectedSkill({ name: event.target.value })
              }
              label="Skill"
              variant="outlined"
              sx={{ width: 120 }}
            />
          )}
          <FormControl variant="outlined" size="small" sx={{ ml: 2 }}>
            <InputLabel>Level</InputLabel>
            <Select
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
              label="Level"
              sx={{ width: 120 }}
            >
              {Object.keys(headers).map((key) => (
                <MenuItem key={key} value={key}>
                  {t("levels")[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton onClick={handleAddSkill} color="primary" sx={{ ml: 2 }}>
            <AddIcon />
          </IconButton>
        </Box>
      )}
      <div className={styles.data}>
        <table>
          <tbody>
            {Object.entries(editMode ? editJsonData : jsonData).map(
              ([level, skills]) => (
                <tr key={level}>
                  <td style={{ textAlign: "right" }}>{t("levels")[level]}:</td>
                  <td>
                    {skills.map((skill, index) => (
                      <Chip
                        key={level + index}
                        label={
                          skill.name + "\n" + (skill.date ? skill.date : "")
                        }
                        variant="outlined"
                        style={
                          skill.date
                            ? {
                                borderColor: skill.color,
                                color: skill.color,
                                margin: "0 4px 4px 0",
                                backgroundColor: skill.color + "16",
                                padding: "8px 4px",
                                height: "auto",
                              }
                            : {
                                borderColor: skill.color,
                                color: skill.color,
                                margin: "0 4px 4px 0",
                                backgroundColor: skill.color + "16",
                              }
                        }
                        sx={{
                          "& .MuiChip-label": {
                            display: "block",
                            whiteSpace: "pre-wrap",
                          },
                        }}
                        onDelete={
                          editMode
                            ? () => handleDeleteSkill(skill, level)
                            : undefined
                        }
                      />
                    ))}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SkillSelector;
