import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock API service (replace with real API calls)
const api = {
  login: async (email, password) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const token = 'mock_jwt_token_' + Date.now();
    localStorage.setItem('authToken', token);
    return { token, user: { email } };
  },
  
  signup: async (email, password) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const token = 'mock_jwt_token_' + Date.now();
    localStorage.setItem('authToken', token);
    return { token, user: { email } };
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
  },
  
  checkAuth: () => {
    return !!localStorage.getItem('authToken');
  },
  
  getUserSummary: async () => {
    // Mock API call to check if profile exists
    await new Promise(resolve => setTimeout(resolve, 300));
    const profile = localStorage.getItem('userProfile');
    return {
      hasProfile: !!profile,
      user: profile ? JSON.parse(profile) : null,
    };
  },
  
  createProfile: async (profileData) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    return { success: true, profile: profileData };
  },
};

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = api.checkAuth();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const { hasProfile: profileExists, user: userData } = await api.getUserSummary();
        setHasProfile(profileExists);
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { user: userData } = await api.login(email, password);
    setIsAuthenticated(true);
    setUser(userData);
    
    // Check profile status after login
    const { hasProfile: profileExists, user: fullUserData } = await api.getUserSummary();
    setHasProfile(profileExists);
    setUser(fullUserData || userData);
  };

  const signup = async (email, password) => {
    const { user: userData } = await api.signup(email, password);
    setIsAuthenticated(true);
    setUser(userData);
    setHasProfile(false); // New users don't have profile yet
  };

  const logout = () => {
    api.logout();
    setIsAuthenticated(false);
    setHasProfile(false);
    setUser(null);
  };

  const createProfile = async (profileData) => {
    const { profile } = await api.createProfile(profileData);
    setHasProfile(true);
    setUser(profile);
  };

  const value = {
    isAuthenticated,
    hasProfile,
    user,
    loading,
    login,
    signup,
    logout,
    createProfile,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;