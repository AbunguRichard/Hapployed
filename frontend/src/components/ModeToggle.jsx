import React, { useState } from 'react';
import { Briefcase, User } from 'lucide-react';

/**
 * ModeToggle - Context switch control for dual-role users
 * Shows: Employer | Talent toggle in the header
 * Persists mode selection and updates via API
 */
export default function ModeToggle({ currentMode, onModeChange, className = '' }) {
  const [switching, setSwitching] = useState(false);

  const handleToggle = async (newMode) => {
    if (newMode === currentMode || switching) return;
    
    setSwitching(true);
    try {
      await onModeChange(newMode);
    } catch (error) {
      console.error('Mode switch failed:', error);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className={`inline-flex items-center bg-white border-2 border-gray-300 rounded-full p-1 ${className}`}>
      <button
        onClick={() => handleToggle('employer')}
        disabled={switching}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
          currentMode === 'employer'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100'
        } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Briefcase className="h-4 w-4" />
        <span>Employer</span>
      </button>
      <button
        onClick={() => handleToggle('worker')}
        disabled={switching}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
          currentMode === 'worker'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100'
        } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <User className="h-4 w-4" />
        <span>Talent</span>
      </button>
    </div>
  );
}
