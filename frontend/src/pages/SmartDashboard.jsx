import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import RecruiterDashboard from './RecruiterDashboard';
import DualDashboard from './DualDashboard';

/**
 * SmartDashboard - Role-based dynamic dashboard routing
 * 
 * This component detects the user's role and renders the appropriate dashboard:
 * - Recruiter/Employer → RecruiterDashboard (job stats, applications, hiring tips)
 * - Talent/Worker → DualDashboard (Gig Mode / Project Mode)
 */
export default function SmartDashboard() {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
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

  // Detect user role from user object
  // Possible role fields: user.role, user.userType, user.roles array
  const isRecruiter = 
    user.role === 'Recruiter' || 
    user.role === 'Employer' ||
    user.userType === 'Recruiter' ||
    user.userType === 'Employer' ||
    (user.roles && (user.roles.includes('Recruiter') || user.roles.includes('Employer')));

  const isWorker = 
    user.role === 'Worker' || 
    user.role === 'Talent' ||
    user.userType === 'Worker' ||
    user.userType === 'Talent' ||
    (user.roles && (user.roles.includes('Worker') || user.roles.includes('Talent')));

  // Check localStorage for last active mode (role persistence)
  const lastMode = localStorage.getItem('user_active_mode');
  
  if (lastMode === 'recruiter' || (!lastMode && isRecruiter)) {
    return <RecruiterDashboard />;
  }
  
  if (lastMode === 'worker' || (!lastMode && isWorker)) {
    return <DualDashboard />;
  }

  // Default: If no clear role, check if user has posted jobs (they're likely a recruiter)
  // Or if they have applications (they're likely a worker)
  // For now, default to DualDashboard for new users
  return <DualDashboard />;
}
