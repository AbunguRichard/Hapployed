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
import FindWorkersPage from './pages/FindWorkersPage';
import GigsNearMePage from './pages/GigsNearMePage';
import SettingsPage from './pages/SettingsPage';
import WorkerDashboard from './pages/WorkerDashboard';
import EmergencyGigsPage from './pages/EmergencyGigsPage';
import FindWorkPage from './pages/FindWorkPage';
import ApplicationFlowPage from './pages/ApplicationFlowPage';
import GigsNearMeInfoPage from './pages/GigsNearMeInfoPage';
import CurrentProjectsInfoPage from './pages/CurrentProjectsInfoPage';
import QuickHireInfoPage from './pages/QuickHireInfoPage';
import DiscoverOpportunitiesInfoPage from './pages/DiscoverOpportunitiesInfoPage';
import PostProjectInfoPage from './pages/PostProjectInfoPage';
import OpportunitiesInfoPage from './pages/OpportunitiesInfoPage';
import MyJobsPage from './pages/MyJobsPage';
import MessagesPage from './pages/MessagesPage';
import BillingPage from './pages/BillingPage';
import ProfilePage from './pages/ProfilePage';
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
            
            {/* Informational Pages - Public */}
            <Route path="/discover-opportunities-info" element={<DiscoverOpportunitiesInfoPage />} />
            <Route path="/post-project-info" element={<PostProjectInfoPage />} />
            <Route path="/gigs-near-me-info" element={<GigsNearMeInfoPage />} />
            <Route path="/quickhire-info" element={<QuickHireInfoPage />} />
            <Route path="/opportunities-info" element={<OpportunitiesInfoPage />} />
            <Route path="/current-projects-info" element={<CurrentProjectsInfoPage />} />
            
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
              path="/post-project"
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
            <Route
              path="/worker-dashboard"
              element={
                <ProtectedRoute>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/emergency-gigs"
              element={
                <ProtectedRoute>
                  <EmergencyGigsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/find-work"
              element={
                <ProtectedRoute>
                  <FindWorkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply/:id"
              element={
                <ProtectedRoute>
                  <ApplicationFlowPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-jobs"
              element={
                <ProtectedRoute>
                  <MyJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
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