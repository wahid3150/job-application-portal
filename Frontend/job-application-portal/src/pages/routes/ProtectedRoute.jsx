import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role - redirect to their appropriate dashboard
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to user's correct dashboard based on their role
    if (user?.role === "employer") {
      return <Navigate to="/employer-dashboard" replace />;
    } else if (user?.role === "jobseeker") {
      return <Navigate to="/jobseeker-dashboard" replace />;
    }
    // If role doesn't match and user role is unknown, redirect to home
    return <Navigate to="/" replace />;
  }

  // Render the protected component
  return <Outlet />;
};

export default ProtectedRoute;
