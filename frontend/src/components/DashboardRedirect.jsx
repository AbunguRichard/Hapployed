import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Determine which dashboard to show based on currentMode or primary role
  const currentMode = user?.currentMode || (user?.roles?.[0] === 'employer' ? 'employer' : 'worker');
  
  if (currentMode === 'employer') {
    return <Navigate to="/recruiter-dashboard" replace />;
  } else {
    return <Navigate to="/epic-worker-dashboard" replace />;
  }
}
