import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, hasProfile, loading } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to={`/auth/login?next=${encodeURIComponent(currentPath)}`} replace />;
  }

  // Authenticated but no profile → redirect to create profile
  if (!hasProfile) {
    return <Navigate to={`/profile/create?next=${encodeURIComponent(currentPath)}`} replace />;
  }

  // Authenticated and has profile → allow access
  return children;
}