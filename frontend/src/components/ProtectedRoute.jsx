import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireProfile = true }) {
  const { isAuthenticated, user, loading, hasRole, isProfileComplete } = useAuth();
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

  // Check if user has a complete profile for their primary role
  const userHasCompleteProfile = () => {
    if (!user || !user.roles || user.roles.length === 0) return false;
    
    // Check if any of their roles has a complete profile
    if (user.roles.includes('worker') && user.worker_profile?.profileComplete) {
      return true;
    }
    if (user.roles.includes('employer') && user.employer_profile?.profileComplete) {
      return true;
    }
    return false;
  };

  // Authenticated but no complete profile → redirect to create profile (only if profile is required)
  if (requireProfile && !userHasCompleteProfile()) {
    return <Navigate to={`/profile/create?next=${encodeURIComponent(currentPath)}`} replace />;
  }

  // Authenticated (and has profile if required) → allow access
  return children;
}