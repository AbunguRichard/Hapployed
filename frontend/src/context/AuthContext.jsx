import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  const setAuthToken = (token) => {
    localStorage.setItem('access_token', token);
  };

  const removeAuthToken = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const checkAuthStatus = async () => {
    try {
      const token = getAuthToken();
      const guestMode = localStorage.getItem('is_guest') === 'true';
      
      setIsGuest(guestMode);
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      // Fetch current user info
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          removeAuthToken();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        removeAuthToken();
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      setAuthToken(data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setUser(data.user);
      setIsAuthenticated(true);
      setIsGuest(false);
      localStorage.removeItem('is_guest');
      
      // Alias anonymous events to user
      await aliasAnonymousUser(data.user.id);
      
      // Handle intent-based redirect
      const intent = localStorage.getItem('user_intent');
      return { user: data.user, intent };
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email, password, name, role) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name, role }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Signup failed');
      }

      const data = await response.json();
      setAuthToken(data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setUser(data.user);
      setIsAuthenticated(true);
      setIsGuest(false);
      localStorage.removeItem('is_guest');
      
      // Alias anonymous events to user
      await aliasAnonymousUser(data.user.id);
      
      // Handle intent-based redirect
      const intent = localStorage.getItem('user_intent');
      return { user: data.user, intent };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
      setIsAuthenticated(false);
      setUser(null);
      setIsGuest(false);
      localStorage.removeItem('is_guest');
      localStorage.removeItem('user_intent');
    }
  };

  const addSecondaryRole = async (role) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BACKEND_URL}/api/auth/add-role`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add role');
      }

      const data = await response.json();
      // Refresh user data
      await checkAuthStatus();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (profileType, profileData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BACKEND_URL}/api/auth/profile/${profileType}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update profile');
      }

      // Refresh user data
      await checkAuthStatus();
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const aliasAnonymousUser = async (userId) => {
    try {
      const anonymousId = localStorage.getItem('anonymous_id');
      if (anonymousId) {
        await fetch(`${BACKEND_URL}/api/analytics/alias`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            anonymous_id: anonymousId,
            user_id: userId
          })
        });
        localStorage.removeItem('anonymous_id');
      }
    } catch (error) {
      console.error('Failed to alias user:', error);
    }
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const isProfileComplete = (role) => {
    if (role === 'worker') {
      return user?.worker_profile?.profileComplete || false;
    } else if (role === 'employer') {
      return user?.employer_profile?.profileComplete || false;
    }
    return false;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    isGuest,
    login,
    signup,
    logout,
    checkAuthStatus,
    addSecondaryRole,
    updateProfile,
    hasRole,
    isProfileComplete,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;