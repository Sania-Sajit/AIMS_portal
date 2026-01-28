import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, role,email} = useAuth();
  const { logout } = useAuth();
  console.log(role);
  console.log(email)
  if (!token || (allowedRoles.length && !allowedRoles.includes(role))) {
    // Redirect to login if the user is not authenticated
    logout();
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
