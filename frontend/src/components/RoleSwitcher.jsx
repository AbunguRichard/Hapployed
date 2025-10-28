import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Wrench } from 'lucide-react';

/**
 * RoleSwitcher - Allows users to toggle between Recruiter and Worker modes
 * This persists their preference in localStorage
 */
export default function RoleSwitcher({ currentMode, className = '' }) {
  const navigate = useNavigate();

  const switchToRecruiter = () => {
    localStorage.setItem('user_active_mode', 'recruiter');
    navigate('/dashboard-recruiter');
    window.location.reload(); // Force refresh to update navigation
  };

  const switchToWorker = () => {
    localStorage.setItem('user_active_mode', 'worker');
    navigate('/dashboard-talent');
    window.location.reload(); // Force refresh to update navigation
  };

  return (
    <div className={`flex items-center gap-2 bg-white border border-gray-200 rounded-full p-1 ${className}`}>
      <button
        onClick={switchToWorker}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
          currentMode === 'worker'
            ? 'bg-purple-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Wrench className="h-4 w-4" />
        <span className="font-medium">Talent</span>
      </button>
      <button
        onClick={switchToRecruiter}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
          currentMode === 'recruiter'
            ? 'bg-purple-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Briefcase className="h-4 w-4" />
        <span className="font-medium">Recruiter</span>
      </button>
    </div>
  );
}
