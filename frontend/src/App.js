import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WorkModeProvider } from './context/WorkModeContext';
import { ModeProvider } from './context/ModeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './pages/Homepage';
import WhatWeOfferPage from './pages/WhatWeOfferPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UnifiedAuthPage from './pages/UnifiedAuthPage';
import CreateProfilePage from './pages/CreateProfilePage';
import DashboardPage from './pages/DashboardPage';
import DualDashboard from './pages/DualDashboard';
import SmartDashboard from './pages/SmartDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ProposalsPage from './pages/ProposalsPage';
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
import SmartAIMatchingPage from './pages/SmartAIMatchingPage';
import InstantDeploymentPage from './pages/InstantDeploymentPage';
import VerifiedNetworkPage from './pages/VerifiedNetworkPage';
import RealTimeAnalyticsPage from './pages/RealTimeAnalyticsPage';
import ProjectsServicePage from './pages/ProjectsServicePage';
import EmergencyGigsServicePage from './pages/EmergencyGigsServicePage';
import GigsNearMeServicePage from './pages/GigsNearMeServicePage';
import HireMethodChoicePage from './pages/HireMethodChoicePage';
import HireStartPage from './pages/HireStartPage';
import HirerOnboardingPage from './pages/HirerOnboardingPage';
import ManageJobsPage from './pages/ManageJobsPage';
import WorkerProfileDetailPage from './pages/WorkerProfileDetailPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import QuickHirePostPage from './pages/QuickHirePostPage';
import QuickHireTrackingPage from './pages/QuickHireTrackingPage';
import QuickHireWorkerDashboard from './pages/QuickHireWorkerDashboard';
import MySkillsPage from './pages/MySkillsPage';
import JobTypeSelectionPage from './pages/JobTypeSelectionPage';
import WorkerOnboardingPage from './pages/WorkerOnboardingPage';
import EmployerDashboard from './pages/EmployerDashboard';
import RoleTrackerDashboard from './components/RoleTrackerDashboard';
import UnifiedDashboard from './pages/UnifiedDashboard';
import MyGigsPage from './pages/MyGigsPage';
import FindGigsPage from './pages/FindGigsPage';
import MyProjectsPage from './pages/MyProjectsPage';
import TalentPage from './pages/TalentPage';
import WorkerDashboardPage from './pages/WorkerDashboardPage';
import AIMatchPage from './pages/AIMatchPage';
import GrowPage from './pages/GrowPage';
import WalletPage from './pages/WalletPage';
import SearchPage from './pages/SearchPage';
import SMSDashboardPage from './pages/SMSDashboardPage';
import VerificationPage from './pages/VerificationPage';
import JobsPage from './pages/JobsPage';
import CandidatesPage from './pages/CandidatesPage';
import InterviewsPage from './pages/InterviewsPage';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';
import DashboardRedirect from './components/DashboardRedirect';
import ModernRecruiterDashboard from './pages/ModernRecruiterDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ModeProvider>
        <WorkModeProvider>
          <div className="App">
            <BrowserRouter>
              <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/what-we-offer" element={<WhatWeOfferPage />} />
            <Route path="/auth" element={<UnifiedAuthPage />} />
            <Route path="/auth/login" element={<UnifiedAuthPage />} />
            <Route path="/auth/signup" element={<UnifiedAuthPage />} />
            
            {/* Informational Pages - Public */}
            <Route path="/discover-opportunities-info" element={<DiscoverOpportunitiesInfoPage />} />
            <Route path="/post-project-info" element={<PostProjectInfoPage />} />
            <Route path="/gigs-near-me-info" element={<GigsNearMeInfoPage />} />
            <Route path="/quickhire-info" element={<QuickHireInfoPage />} />
            <Route path="/opportunities-info" element={<OpportunitiesInfoPage />} />
            <Route path="/current-projects-info" element={<CurrentProjectsInfoPage />} />
            
            {/* Feature Pages - Public */}
            <Route path="/features/smart-ai-matching" element={<SmartAIMatchingPage />} />
            <Route path="/features/instant-deployment" element={<InstantDeploymentPage />} />
            <Route path="/features/verified-network" element={<VerifiedNetworkPage />} />
            <Route path="/features/real-time-analytics" element={<RealTimeAnalyticsPage />} />
            
            {/* Service Pages - Public */}
            <Route path="/services/projects" element={<ProjectsServicePage />} />
            <Route path="/services/emergency-gigs" element={<EmergencyGigsServicePage />} />
            <Route path="/services/gigs-near-me" element={<GigsNearMeServicePage />} />
            
            {/* Profile Creation - Requires Authentication */}
            <Route path="/profile/create" element={<CreateProfilePage />} />
            
            {/* Home Page - Redirects to appropriate dashboard based on role */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <DashboardRedirect />
                </ProtectedRoute>
              } 
            />
            
            {/* Recruiter Dashboard with Sidebar */}
            <Route 
              path="/recruiter-dashboard" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard Routes */}
            <Route 
              path="/dashboard-worker" 
              element={
                <ProtectedRoute>
                  <WorkerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard-employer" 
              element={
                <ProtectedRoute>
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <RecruiterDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Hire Flow */}
            <Route path="/hire/start" element={<HireStartPage />} />
            <Route 
              path="/hire/onboarding" 
              element={
                <ProtectedRoute>
                  <HirerOnboardingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-jobs" 
              element={
                <ProtectedRoute>
                  <ManageJobsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Worker Profile Detail */}
            <Route path="/worker-profile/:profileId" element={<WorkerProfileDetailPage />} />
            
            {/* Applications */}
            <Route 
              path="/my-applications" 
              element={
                <ProtectedRoute>
                  <MyApplicationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/job/:jobId/applications" 
              element={
                <ProtectedRoute>
                  <JobApplicationsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* My Skills */}
            <Route 
              path="/my-skills" 
              element={
                <ProtectedRoute>
                  <MySkillsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Worker Onboarding */}
            <Route 
              path="/worker/onboarding" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <WorkerOnboardingPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Role Tracker Dashboard for Multi-Hire Jobs */}
            <Route 
              path="/job/:jobId/role-tracker" 
              element={
                <ProtectedRoute>
                  <RoleTrackerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* QuickHire Routes */}
            <Route 
              path="/quickhire/post" 
              element={
                <ProtectedRoute>
                  <QuickHirePostPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quickhire/track/:gigId" 
              element={
                <ProtectedRoute>
                  <QuickHireTrackingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quickhire/worker" 
              element={
                <ProtectedRoute>
                  <QuickHireWorkerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quickhire/worker/:gigId" 
              element={
                <ProtectedRoute>
                  <QuickHireTrackingPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Job Type Selection */}
            <Route 
              path="/select-job-type" 
              element={
                <ProtectedRoute>
                  <JobTypeSelectionPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/hire-method-choice" 
              element={
                <ProtectedRoute>
                  <HireMethodChoicePage />
                </ProtectedRoute>
              } 
            />
            
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
              path="/proposals"
              element={
                <ProtectedRoute>
                  <ProposalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/find-workers"
              element={
                <ProtectedRoute>
                  <FindWorkersPage />
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
            
            {/* ========== DUAL-TRACK NAVIGATION ROUTES ========== */}
            
            {/* Unified Dashboard - Smart routing based on mode */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UnifiedDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Gig Work Routes */}
            <Route 
              path="/gig/dashboard" 
              element={
                <ProtectedRoute>
                  <WorkerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gig/post" 
              element={
                <ProtectedRoute>
                  <QuickHirePostPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gig/find" 
              element={
                <ProtectedRoute>
                  <GigsNearMePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Professional Work Routes */}
            <Route 
              path="/pro/dashboard" 
              element={
                <ProtectedRoute>
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pro/find" 
              element={
                <ProtectedRoute>
                  <OpportunitiesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pro/post" 
              element={
                <ProtectedRoute>
                  <PostProjectPage />
                </ProtectedRoute>
              } 
            />
            
            {/* My Engagements Routes */}
            <Route 
              path="/me/gigs" 
              element={
                <ProtectedRoute>
                  <MyGigsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/find-gigs" 
              element={
                <ProtectedRoute>
                  <FindGigsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/me/projects" 
              element={
                <ProtectedRoute>
                  <MyProjectsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Find Workers/Talent Page */}
            <Route 
              path="/talent" 
              element={
                <ProtectedRoute>
                  <TalentPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Epic Worker Dashboard */}
            <Route 
              path="/epic-worker-dashboard" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <WorkerDashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* My Work Routes */}
            <Route 
              path="/my-work/ai-match" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <AIMatchPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-work/grow" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <GrowPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-work/wallet" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <WalletPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Advanced Search Route */}
            <Route 
              path="/search" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <SearchPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Verification Route */}
            <Route 
              path="/verification" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <VerificationPage />
                </ProtectedRoute>
              } 
            />
            
            {/* SMS Dashboard Route */}
            <Route 
              path="/admin/sms-dashboard" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <SMSDashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Sidebar Navigation Routes */}
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <JobsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidates" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <CandidatesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interviews" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <InterviewsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requireProfile={false}>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* ========== END DUAL-TRACK ROUTES ========== */}
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </WorkModeProvider>
  </ModeProvider>
  </AuthProvider>
);
}

export default App;