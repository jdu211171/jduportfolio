import React from 'react'
import { TextField as MuiTextField } from '@mui/material'
import styles from './LinkBox.module.css'
const TextField = ({ title, data, editData, editMode, updateEditData, keyName }) => {
  const handleChange = (e) => {
    updateEditData(keyName, e.target.value)
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.data}>
        {editMode ? (
          <MuiTextField
            value={editData[keyName] || ''}
            onChange={handleChange}
            variant="filled"
            fullWidth
            multiline
          />
        ) : (
          <div>{data}</div>
        )}
      </div>
    </div>
  )
}

export default TextField
