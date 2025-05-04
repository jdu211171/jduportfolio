import React, { createContext, useState, useEffect } from 'react'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null)
  const [userId, setUserId] = useState(null)
  const [activeUser, setActiveUser] = useState(null)
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'ja')

  const fetchAndSetUser = () => {
    const userRole = sessionStorage.getItem('role')
    const loginUser = sessionStorage.getItem('loginUser')
    const userId = loginUser ? JSON.parse(loginUser).id : null
    const user = JSON.parse(loginUser)
    setActiveUser(user)
    setRole(userRole)
    setUserId(userId)
    return user
  }

  useEffect(() => {
    fetchAndSetUser()
  }, [])

  const updateUser = () => {
    return fetchAndSetUser()
  }

  const changeLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <UserContext.Provider
      value={{ role, userId, activeUser, updateUser, language, changeLanguage }}
    >
      {children}
    </UserContext.Provider>
  )
}
