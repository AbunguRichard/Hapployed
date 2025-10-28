import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkMode } from '../context/WorkModeContext';
import { useAuth } from '../context/AuthContext';
import WorkerDashboard from './WorkerDashboard';
import EmployerDashboard from './EmployerDashboard';
import NavigationBar from '../components/NavigationBar';

export default function UnifiedDashboard() {
  const { mode, setMode } = useWorkMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if mode is provided in query params
    const queryMode = searchParams.get('mode');
    
    if (queryMode === 'gig' || queryMode === 'pro') {
      // Update mode from query param
      setMode(queryMode);
    } else if (!mode) {
      // If no mode is set and no query param, redirect based on user role
      if (user?.roles?.includes('worker')) {
        navigate('/gig/dashboard');
      } else if (user?.roles?.includes('employer')) {
        navigate('/pro/dashboard');
      } else {
        // Default to gig mode
        setMode('gig');
        navigate('/gig/dashboard');
      }
    }
  }, [searchParams, mode, user, navigate, setMode]);

  // Render appropriate dashboard based on mode
  if (mode === 'gig') {
    return (
      <>
        <NavigationBar />
        <WorkerDashboard />
      </>
    );
  }

  if (mode === 'pro') {
    return (
      <>
        <NavigationBar />
        <EmployerDashboard />
      </>
    );
  }

  // Default fallback - show mode selection
  return (
    <>
      <NavigationBar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Mode</h2>
          <p className="text-gray-600 mb-6">Select whether you want to work on Gigs or Professional Projects</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/gig/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:brightness-110 transition-all shadow-lg"
            >
              ⚡ Start with Gigs
            </button>
            <button
              onClick={() => navigate('/pro/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:brightness-110 transition-all shadow-lg"
            >
              💼 Start with Projects
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
