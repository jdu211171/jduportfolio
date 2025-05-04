import React from 'react'
import Cookies from 'js-cookie'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = Cookies.get('token')
  const userRole = Cookies.get('userType')

  if (!token) {
    return <Navigate to="/login" />
  } else if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />
  } else {
    return children
  }
}

export default ProtectedRoute
