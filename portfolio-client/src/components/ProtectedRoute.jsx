// src/components/ProtectedRoute.js
import React from "react";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = Cookies.get("token");
  const userRole = Cookies.get("userType"); // Assuming userType is set during login

  if (!token) {
    // Redirect to login if no token
    return <Navigate to="/login" />;
  } else if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to unauthorized page if user role is not allowed
    return <Navigate to="/unauthorized" />;
  } else {
    // Render children if authenticated and role is allowed
    return children;
  }
};

export default ProtectedRoute;
