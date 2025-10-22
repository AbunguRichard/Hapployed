import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useUserRoles = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (authUser) {
        // Get full user data including roles from backend or local storage
        const userData = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name || authUser.email?.split('@')[0],
          roles: {
            isHirer: authUser.roles?.isHirer || false,
            isWorker: authUser.roles?.isWorker || false,
            hirerOnboardingComplete: authUser.roles?.hirerOnboardingComplete || false,
            workerOnboardingComplete: authUser.roles?.workerOnboardingComplete || false,
            lastActiveRole: authUser.roles?.lastActiveRole || null
          },
          isGuest: false
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [authUser]);

  const updateUserRole = async (role, completed = false) => {
    const updatedUser = {
      ...user,
      roles: {
        ...user.roles,
        [role]: true,
        [`${role}OnboardingComplete`]: completed,
        lastActiveRole: role === 'isHirer' ? 'hirer' : 'worker'
      }
    };
    
    setUser(updatedUser);
    
    // Save to backend
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${user.id}/roles`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          completed
        })
      });
      
      if (!response.ok) {
        console.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const createGuestSession = () => {
    const guestUser = {
      id: `guest_${Date.now()}`,
      email: null,
      name: 'Guest',
      roles: {
        isHirer: false,
        isWorker: false,
        hirerOnboardingComplete: false,
        workerOnboardingComplete: false,
        lastActiveRole: null
      },
      isGuest: true,
      guestAccess: {
        accessExpiry: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        limitedActions: true
      }
    };
    
    setUser(guestUser);
    sessionStorage.setItem('guestUser', JSON.stringify(guestUser));
  };

  return {
    user,
    loading,
    updateUserRole,
    createGuestSession,
    isHirer: user?.roles?.isHirer,
    isWorker: user?.roles?.isWorker,
    hirerOnboardingComplete: user?.roles?.hirerOnboardingComplete,
    workerOnboardingComplete: user?.roles?.workerOnboardingComplete,
    isGuest: user?.isGuest || false
  };
};
