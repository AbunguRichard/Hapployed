import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useModeContext } from '../context/ModeContext';
import { Navigate } from 'react-router-dom';
import RecruiterDashboard from './RecruiterDashboard';
import DualDashboard from './DualDashboard';

/**
 * SmartDashboard - Role-based dynamic dashboard routing
 * 
 * This component uses currentMode from ModeContext to render the appropriate dashboard:
 * - Employer mode → RecruiterDashboard (job stats, applications, hiring tips)
 * - Worker mode → DualDashboard (Gig Mode / Project Mode)
 */
export default function SmartDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { currentMode, loading: modeLoading } = useModeContext();

  // Show loading state while checking auth or mode
  if (authLoading || modeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Render dashboard based on current mode
  if (currentMode === 'employer') {
    return <RecruiterDashboard />;
  }
  
  // Default to worker dashboard (DualDashboard)
  return <DualDashboard />;
}
