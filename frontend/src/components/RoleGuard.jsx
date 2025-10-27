import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleSwitchPrompt from './RoleSwitchPrompt';

export default function RoleGuard({ children, requiredRole, requireProfileComplete = false }) {
  const { isAuthenticated, user, loading, hasRole, isProfileComplete } = useAuth();
  const location = useLocation();
  const [showRolePrompt, setShowRolePrompt] = useState(false);

  useEffect(() => {
    // Check if user needs to add the required role
    if (isAuthenticated && user && requiredRole && !hasRole(requiredRole)) {
      setShowRolePrompt(true);
    }
  }, [isAuthenticated, user, requiredRole, hasRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login with intent
  if (!isAuthenticated) {
    // Store the intended destination
    localStorage.setItem('redirect_after_auth', location.pathname);
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <>
        <RoleSwitchPrompt
          isOpen={showRolePrompt}
          onClose={() => setShowRolePrompt(false)}
          targetRole={requiredRole}
          intent={location.pathname}
          onSuccess={() => {
            setShowRolePrompt(false);
            // Continue to the page after adding role
          }}
        />
        {/* Show a message while waiting for role to be added */}
        {!showRolePrompt && (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md text-center p-8 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {requiredRole === 'worker' ? 'Worker' : 'Employer'} Profile Required
              </h2>
              <p className="text-gray-600 mb-6">
                You need a {requiredRole} profile to access this page.
              </p>
              <button
                onClick={() => setShowRolePrompt(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Add {requiredRole === 'worker' ? 'Worker' : 'Employer'} Profile
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Check if profile is complete (if required)
  if (requireProfileComplete && !isProfileComplete(requiredRole)) {
    return <Navigate to={`/profile/complete/${requiredRole}`} state={{ from: location }} replace />;
  }

  // All checks passed - render children
  return <>{children}</>;
}
