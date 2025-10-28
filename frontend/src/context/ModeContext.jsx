import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ModeContext = createContext(null);

export const useModeContext = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useModeContext must be used within ModeProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * ModeProvider - Manages user's current mode (Employer/Talent)
 * Handles mode switching, persistence, and pending actions
 */
export const ModeProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [currentMode, setCurrentMode] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize mode from user data
  useEffect(() => {
    if (!authLoading && user) {
      // Use currentMode from backend, or default to first role
      const initialMode = user.currentMode || user.roles?.[0] || 'worker';
      setCurrentMode(initialMode);
      setLoading(false);
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  /**
   * Switch mode and persist to backend
   */
  const switchMode = async (newMode) => {
    if (!user) {
      throw new Error('User must be authenticated to switch modes');
    }

    if (!user.roles.includes(newMode)) {
      throw new Error(`User does not have ${newMode} role`);
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/auth/mode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentMode: newMode })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to switch mode');
      }

      const data = await response.json();
      setCurrentMode(newMode);
      
      // Store in localStorage as backup
      localStorage.setItem('user_current_mode', newMode);
      
      return data;
    } catch (error) {
      console.error('Mode switch error:', error);
      throw error;
    }
  };

  /**
   * Save pending action when user needs to switch modes
   * @param {Object} action - { type: 'APPLY' | 'POST_JOB' | 'HIRE', payload: {} }
   */
  const savePendingAction = (action) => {
    setPendingAction(action);
    sessionStorage.setItem('pending_action', JSON.stringify(action));
  };

  /**
   * Get and clear pending action after mode switch
   */
  const consumePendingAction = () => {
    const action = pendingAction;
    setPendingAction(null);
    sessionStorage.removeItem('pending_action');
    return action;
  };

  /**
   * Check if user can perform action in current mode
   */
  const canPerformAction = (actionType) => {
    const employerActions = ['POST_JOB', 'HIRE', 'MANAGE_JOB', 'FUND_MILESTONE'];
    const workerActions = ['APPLY', 'ACCEPT_OFFER', 'TRACK_WORK'];
    
    if (currentMode === 'employer') {
      return employerActions.includes(actionType);
    } else if (currentMode === 'worker') {
      return workerActions.includes(actionType);
    }
    return false;
  };

  /**
   * Get required mode for an action
   */
  const getRequiredMode = (actionType) => {
    const employerActions = ['POST_JOB', 'HIRE', 'MANAGE_JOB', 'FUND_MILESTONE'];
    const workerActions = ['APPLY', 'ACCEPT_OFFER', 'TRACK_WORK'];
    
    if (employerActions.includes(actionType)) return 'employer';
    if (workerActions.includes(actionType)) return 'worker';
    return null;
  };

  /**
   * Check if user has both roles (can switch modes)
   */
  const isDualRole = user && user.roles && user.roles.length > 1;
  
  // Debug logging
  console.log('ModeContext Debug:', {
    user,
    roles: user?.roles,
    isDualRole,
    currentMode
  });

  const value = {
    currentMode,
    switchMode,
    pendingAction,
    savePendingAction,
    consumePendingAction,
    canPerformAction,
    getRequiredMode,
    isDualRole,
    loading,
    user
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
};
