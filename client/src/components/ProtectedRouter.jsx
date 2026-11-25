import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
   const token = localStorage.getItem('token');

   // If a token exists, render the nested route component. Otherwise, redirect to auth.
   return token ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;