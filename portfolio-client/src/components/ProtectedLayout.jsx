// src/components/ProtectedLayout.js

import React from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const ProtectedLayout = ({allowedRoles}) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Outlet />
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
