import React, { useState } from "react";
import {
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Button,
  FormLabel,
  FormGroup,
  Box,
  Grid,
  ButtonGroup,
  IconButton,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useLanguage } from "../../contexts/LanguageContext"; // Import the language context
import translations from "../../locales/translations"; // Import translations
import style from "./Filter.module.css";

const Filter = ({ fields, filterState, onFilterChange }) => {
  const { language } = useLanguage(); // Get the current language
  const t = (key) => translations[language][key] || key; // Translation function

  const [open, setOpen] = useState(false);
  const [collapse, setCollapse] = useState(false);
  const [localFilterState, setLocalFilterState] = useState(filterState);

  const handleChange = (key, value) => {
    setLocalFilterState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const renderField = (field, index) => {
    const width = field.minWidth || "160px";

    switch (field.type) {
      case "radio":
        return (
          <FormControl
            key={field.key + index}
            component="fieldset"
            sx={{ m: 1 }}
            style={{ width }}
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              value={localFilterState[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
            >
              {field.options.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option + (field.unit ? field.unit : "")}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case "checkbox":
        return (
          <FormControl
            key={field.key + index}
            component="fieldset"
            sx={{ m: 1 }}
            style={{ width }}
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            <FormGroup>
              {field.options.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={(localFilterState[field.key] || []).includes(
                        option
                      )}
                      onChange={(e) => {
                        const newValue = (
                          localFilterState[field.key] || []
                        ).includes(option)
                          ? (localFilterState[field.key] || []).filter(
                              (item) => item !== option
                            )
                          : [...(localFilterState[field.key] || []), option];
                        handleChange(field.key, newValue);
                      }}
                    />
                  }
                  label={option + (field.unit ? field.unit : "")}
                />
              ))}
            </FormGroup>
          </FormControl>
        );
      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilterState); // Update filterState with localFilterState
    handleClick();
  };

  const handleClear = () => {
    // Reset local filter state to initial state (or empty state)
    const clearedFilterState = fields.reduce((acc, field) => {
      if (field.type === "checkbox") {
        acc[field.key] = []; // Reset checkbox arrays to empty
      } else {
        acc[field.key] = ""; // Reset other fields to empty strings
      }
      return acc;
    }, {});

    setLocalFilterState(clearedFilterState); // Update local state
    onFilterChange(clearedFilterState); // Notify parent component with cleared filters
  };

  const handleClick = (onSearch = false) => {
    if (!open && onSearch) {
      setOpen(true);
      setCollapse(true);
    } else {
      setCollapse(false);
      setTimeout(() => {
        setOpen(false);
      }, 300);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      className={open ? style.open : style.closed}
      id="filter"
    >
      <Grid
        container
        spacing={1}
        className={style.filterBar}
        justifyContent="space-between"
      >
        <Grid item xs={2}>
          <ButtonGroup fullWidth>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{
                fontSize: {
                  xs: "0.75rem", // Small screen
                  sm: "1rem", // Medium and larger screens
                },
                padding: {
                  xs: "0px 0px", // Small screen
                  sm: "0px 0px", // Medium and larger screens
                },
              }}
            >
              {t("search")} {/* Translation for 検索 */}
            </Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={10} sx={{ p: 1 }}>
          <FormControl fullWidth>
            <TextField
              className={style.textfield}
              label={t("name_search")}
              value={localFilterState.search || ""}
              onChange={(e) => handleChange("search", e.target.value)}
            />
          </FormControl>
        </Grid>
      </Grid>
      <Grid item xs={12} style={{ position: "relative" }}>
        <div className={style.clear} onClick={handleClear}>
          {t("reset")} {/* Translation for 戻る */}
        </div>
        <div className={style.filterButtonContainer}>
          {fields.length > 1 && (
            <IconButton onClick={handleClick} className={style.filterButton}>
              {open ? (
                <ExpandLessIcon fontSize="large" />
              ) : (
                <ExpandMoreIcon fontSize="large" />
              )}
            </IconButton>
          )}
        </div>
      </Grid>
      <Collapse in={collapse} timeout={300}>
        <Grid my={1} container spacing={1} className={style.filterFields}>
          {fields.map((field, index) => renderField(field, index))}
        </Grid>
      </Collapse>
    </Box>
  );
};

export default Filter;
