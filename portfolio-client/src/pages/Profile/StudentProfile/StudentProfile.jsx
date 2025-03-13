import React, { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  Outlet,
  NavLink,
} from "react-router-dom";
import axios from "../../../utils/axiosUtils";
import { Box, Typography, IconButton, Chip, Avatar, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import styles from "./StudentProfile.module.css";
import translations from "../../../locales/translations";
import { useContext } from "react";
import { UserContext } from "../../../contexts/UserContext"; // Добавьте эту строку

const StudentProfile = ({ userId = 0 }) => {
  const { studentId } = useParams();
  const { language } = useContext(UserContext); // Получаем текущий язык
  const t = translations[language] || translations.en; // Выбираем переводы на основе языка
  let id;
  if (userId != 0) {
    id = userId;
  } else {
    id = studentId;
  }
  const role = sessionStorage.getItem("role");

  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`/api/students/${id}`);
        setStudent(response.data);
      } catch (error) {
        showAlert("Error fetching student data", "error");
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  const handleBackClick = () => {
    const isRootPath = location.pathname.endsWith("/top");
    if (isRootPath) {
      if (location.pathname.startsWith("/checkprofile")) {
        navigate("/checkprofile");
      } else {
        navigate("/student");
      }
    } else {
      navigate(-1);
    }
  };

  const calculateAge = (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Grid container>
        <Grid></Grid>
      </Grid>

      <Box className={styles.topControlButtons}>
        <Box
          display="flex"
          alignItems="center"
          sx={{
            border: 1,
            borderRadius: 1,
            borderColor: "grey.300",
            flexGrow: 1,
          }}
        >
          <IconButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </IconButton>
          | {t.back}
        </Box>
        <Box id="saveButton"></Box>
      </Box>
      <Box className={styles.container}>
        <Box className={styles.avatarContainer}>
          <Avatar
            src={student.photo}
            alt={student.first_name}
            sx={{ width: 130, height: 130 }}
          />
        </Box>
        <Box className={styles.infoContainer}>
          <Box className={styles.nameEmailContainer}>
            <Box>
              <Typography
                variant="h4"
                component="div"
                className={styles.mainTitle}
              >
                {student.first_name} {student.last_name}
              </Typography>
            </Box>
            {["Admin", "Staff", "Student"].includes(role) && (
              <Box>
                <a href={`mailto:${student.email}`} className={styles.email}>
                  <EmailIcon className={styles.emailIcon} />
                  {student.email}
                </a>
                <Box className={styles.statusChipContainer}>
                  <Chip
                    label={`${t.published}`}
                    variant="outlined"
                    color={student.visibility ? "secondary" : "default"}
                    sx={{
                      fontSize: "12px",
                      padding: "2px 6px",
                      height: "auto",
                      lineHeight: 1,
                      width: "80px",
                    }}
                  />
                  <Chip
                    label={`${t.private}`}
                    variant="outlined"
                    color={!student.visibility ? "error" : "default"}
                    sx={{
                      fontSize: "12px",
                      padding: "2px 6px",
                      height: "auto",
                      lineHeight: 1,
                      width: "80px",
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
          <Box className={styles.chipContainer}>
            <Chip
              label={`${t.student_id}: ${student.student_id}`}
              variant="outlined"
              sx={{
                fontSize: "12px",
                padding: "2px 6px",
                height: "auto",
                lineHeight: 1,
                width: "160px",
              }}
            />
            <Chip
              label={`${t.age}: ${calculateAge(student.date_of_birth)}`}
              variant="outlined"
              sx={{
                fontSize: "12px",
                padding: "2px 6px",
                height: "auto",
                lineHeight: 1,
                width: "160px",
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box className={styles.navbar}>
        <NavLink
          to={`top`}
          state={{ userId: userId }}
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          {t.top}
        </NavLink>
        {/* <NavLink
          to={`qa`}
          state={{ userId: userId }}
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          {t.qa}
        </NavLink> */}
        <NavLink
          to={`stats`}
          state={{ userId: userId }}
          className={({ isActive }) => (isActive ? styles.active : "")}
          style={{ minWidth: "130px" }}
        >
          {t.stats}
        </NavLink>
      </Box>
      <Outlet />
    </Box>
  );
};

export default StudentProfile;

