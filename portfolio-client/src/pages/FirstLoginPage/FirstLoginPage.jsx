import React from 'react';
import { TextField, Button, Box, Typography, Divider } from '@mui/material';
import useStyles from './FirstLoginPage.module.css';
import logo from '/src/assets/logo.png';

const FirstLoginPage = () => {
  return (
    <Box className={useStyles.container}>
      <Box className={useStyles.logo}>
        <img src={logo} alt="Logo" />
        <Typography variant="h5">JDU Portfolio</Typography>
      </Box>
      <Box className={useStyles.formContainer}>
        <Typography variant="h6">登録</Typography>
        <div className={useStyles.firstDividerContainer}>
          <Divider className={useStyles.divider} />
        </div>
        <Box className={useStyles.avatarContainer}>
          <label htmlFor="avatar-upload" className={useStyles.fileInputLabel}>
            <Typography variant="body2" className={useStyles.uploadText}>アバター</Typography>
            <input type="file" id="avatar-upload" accept="image/*" className={useStyles.fileInput} />
          </label>
          <Box className={useStyles.avatarText}>
            <Typography variant="body2" className={useStyles.greyText}>
              写真のサイズは3×4で、<br />
              524kb以下である必要があります。
            </Typography>
          </Box>
        </Box>
        <Box className={useStyles.formFields}>
          <TextField
            label="名"
            variant="outlined"
            margin="normal"
            className={useStyles.textField}
          />
          <TextField
            label="姓"
            variant="outlined"
            margin="normal"
            className={useStyles.textField}
          />
          <TextField
            label="ID"
            variant="outlined"
            margin="normal"
            className={useStyles.textField}
            defaultValue="345276"
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            label="電話番号"
            variant="outlined"
            margin="normal"
            className={useStyles.textField}
          />
          <TextField
            label="会社名"
            variant="outlined"
            margin="normal"
            className={useStyles.textField}
          />
          <TextField
            label="メール"
            variant="outlined"
            margin="normal"
            className={useStyles.textField}
            defaultValue="info@gmail.com"
          />
        </Box>
        <div className={useStyles.dividerContainer}>
          <Divider className={useStyles.divider} />
        </div>
        <Box className={useStyles.buttonContainer}>
          <Button variant="outlined" className={useStyles.cancelButton}>
            キャンセル
          </Button>
          <Button variant="contained" color="primary" className={useStyles.saveButton}>
            保存
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default FirstLoginPage;
