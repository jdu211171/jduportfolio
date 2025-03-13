import React, { useEffect } from "react";
import { Avatar, Chip } from "@mui/material";
import style from "./UserAvatar.module.css"; // Adjust the path to your CSS module

const UserAvatar = ({ photo, name, studentId }) => {
  return (
    <div className={style.avatarContainer}>
      <Avatar sx={{ width: 48, height: 48 }} alt={name} src={photo} />{" "}
      {/*gets photo as param*/}
      <div className={style.nameIdContainer}>
        <div>{name}</div>
        {studentId ? (
          <Chip
            label={studentId}
            color="success"
            variant="outlined"
            size="small"
            sx={{ width: "100px" }}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default UserAvatar;
