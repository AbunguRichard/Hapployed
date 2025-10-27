import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkMode } from '../context/WorkModeContext';
import { useAuth } from '../context/AuthContext';
import WorkerDashboard from './WorkerDashboard';
import EmployerDashboard from './EmployerDashboard';

export default function UnifiedDashboard() {
  const { mode } = useWorkMode();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Smart routing based on user's last activity or role
    if (!mode) {
      // If no mode is set, redirect based on user role
      if (user?.roles?.includes('worker')) {
        navigate('/gig/dashboard');
      } else if (user?.roles?.includes('employer')) {
        navigate('/pro/dashboard');
      }
    }
  }, [mode, user, navigate]);

  // Render appropriate dashboard based on mode
  if (mode === 'gig') {
    return <WorkerDashboard />;
  }

  if (mode === 'pro') {
    return <EmployerDashboard />;
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Mode</h2>
        <p className="text-gray-600 mb-6">Select whether you want to work on Gigs or Professional Projects</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/gig/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:brightness-110 transition-all"
          >
            ⚡ Start with Gigs
          </button>
          <button
            onClick={() => navigate('/pro/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:brightness-110 transition-all"
          >
            💼 Start with Projects
          </button>
        </div>
      </div>
    </div>
  );
}
