import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './pages/Homepage';
import WhatWeOfferPage from './pages/WhatWeOfferPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CreateProfilePage from './pages/CreateProfilePage';
import DashboardPage from './pages/DashboardPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import PostProjectPage from './pages/PostProjectPage';
import GigsNearMePage from './pages/GigsNearMePage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/what-we-offer" element={<WhatWeOfferPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            
            {/* Profile Creation - Requires Authentication */}
            <Route path="/profile/create" element={<CreateProfilePage />} />
            
            {/* Protected Routes - Require Auth + Profile */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunities"
              element={
                <ProtectedRoute>
                  <OpportunitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gigs-near-me"
              element={
                <ProtectedRoute>
                  <GigsNearMePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/new"
              element={
                <ProtectedRoute>
                  <PostProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/:section?"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;