import React, { createContext, useContext, useEffect, useState } from 'react';

const WorkModeContext = createContext(null);

export const WorkModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Load saved mode from localStorage, default to 'gig'
    const saved = localStorage.getItem('workMode');
    return saved || 'gig';
  });

  useEffect(() => {
    // Persist mode changes to localStorage
    localStorage.setItem('workMode', mode);
  }, [mode]);

  const value = {
    mode,
    setMode,
    isGigMode: mode === 'gig',
    isProMode: mode === 'pro'
  };

  return (
    <WorkModeContext.Provider value={value}>
      {children}
    </WorkModeContext.Provider>
  );
};

export const useWorkMode = () => {
  const context = useContext(WorkModeContext);
  if (!context) {
    throw new Error('useWorkMode must be used within WorkModeProvider');
  }
  return context;
};
