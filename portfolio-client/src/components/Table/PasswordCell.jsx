import React, { useState } from 'react'
import { IconButton, OutlinedInput, InputAdornment } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import Edit from '@mui/icons-material/Edit'
import Save from '@mui/icons-material/Check'
import Cancel from '@mui/icons-material/Close'
import axios from '../../utils/axiosUtils'

const PasswordCell = ({ studentId }) => {
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(false)
  const [password, setPassword] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleShow = async () => {
    if (!show && !password) {
      setIsLoading(true)
      try {
        const res = await axios.get(`/api/admin/student-password/${studentId}`)
        setPassword(res.data.password)
      } catch (e) {
        setPassword('Ошибка')
      }
      setIsLoading(false)
    }
    setShow(!show)
  }

  const handleEdit = () => {
    setEditing(true)
    setInputValue("")
    setError("")
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!inputValue) return
    setIsLoading(true)
    setError("")
    setSuccess(false)
    try {
      await axios.patch(`/api/admin/reset-student-password/${studentId}`, { newPassword: inputValue })
      setPassword("••••••")
      setShow(false)
      setEditing(false)
      setInputValue("")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (e) {
      setError("Ошибка при изменении пароля")
    }
    setIsLoading(false)
  }

  const handleCancel = () => {
    setEditing(false)
    setInputValue("")
    setError("")
    setSuccess(false)
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <OutlinedInput
          size="small"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Новый пароль"
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleSave} disabled={isLoading || !inputValue}><Save /></IconButton>
              <IconButton onClick={handleCancel} disabled={isLoading}><Cancel /></IconButton>
            </InputAdornment>
          }
          disabled={isLoading}
        />
        {error && (
          <span style={{ color: 'red', marginLeft: 8 }}>{error}</span>
        )}
        {success && (
          <span style={{ color: 'green', marginLeft: 8 }}>Успешно</span>
        )}
      </div>
    )
  }

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span>{show ? (isLoading ? "..." : password) : "••••••"}</span>
      <IconButton onClick={handleShow} size="small" disabled={isLoading}><Visibility /></IconButton>
      <IconButton onClick={handleEdit} size="small" disabled={isLoading}><Edit /></IconButton>
      {success && (
        <span style={{ color: 'green', marginLeft: 8 }}>Успешно</span>
      )}
    </span>
  )
}

export default PasswordCell