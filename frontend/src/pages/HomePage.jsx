import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Users,
  Eye,
  UserCheck,
  TrendingUp
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function HomePage() {
  const { user, switchMode, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [talentStats, setTalentStats] = useState(null);
  const [recruiterStats, setRecruiterStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Determine current mode from user data
  const currentMode = user?.currentMode || (user?.roles?.[0] === 'employer' ? 'employer' : 'worker');
  const isTalentMode = currentMode === 'worker';
  const isRecruiterMode = currentMode === 'employer';

  // Check if user has both roles
  const hasBothRoles = user?.roles?.includes('worker') && user?.roles?.includes('employer');

  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user?.id, currentMode]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('access_token');
      
      // Fetch talent stats
      if (user?.roles?.includes('worker')) {
        const talentResponse = await fetch(`${BACKEND_URL}/api/worker-dashboard/stats/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (talentResponse.ok) {
          const data = await talentResponse.json();
          setTalentStats(data);
        }
      }

      // Fetch recruiter stats (jobs and applications)
      if (user?.roles?.includes('employer')) {
        const jobsResponse = await fetch(`${BACKEND_URL}/api/jobs/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (jobsResponse.ok) {
          const jobs = await jobsResponse.json();
          const activeJobs = jobs.filter(j => j.status === 'published').length;
          const totalJobs = jobs.length;
          
          // Calculate application stats
          let totalApplicants = 0;
          let pendingReview = 0;
          let acceptedCandidates = 0;
          
          for (const job of jobs) {
            if (job.applicationCount) {
              totalApplicants += job.applicationCount;
            }
          }
          
          setRecruiterStats({
            activeJobs,
            totalApplicants,
            pendingReview,
            acceptedCandidates,
            totalJobs
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSwitchMode = async () => {
    try {
      setSwitching(true);
      const newMode = isTalentMode ? 'employer' : 'worker';
      await switchMode(newMode);
      
      // Refresh stats after mode switch
      await fetchStats();
    } catch (error) {
      console.error('Failed to switch mode:', error);
      alert('Failed to switch mode. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome Back, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          
          {/* Persona Switcher */}
          {hasBothRoles && (
            <div className="flex flex-col items-center gap-4 mt-6">
              <p className="text-xl text-gray-700">You are currently in:</p>
              
              <div className="flex items-center gap-4 bg-white rounded-full shadow-lg p-2">
                {/* Talent Mode Button */}
                <button
                  onClick={() => !isTalentMode && handleSwitchMode()}
                  disabled={switching || isTalentMode}
                  className={`px-8 py-3 rounded-full font-semibold text-lg transition-all ${
                    isTalentMode
                      ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Talent Mode
                </button>

                {/* Recruiter Mode Button */}
                <button
                  onClick={() => !isRecruiterMode && handleSwitchMode()}
                  disabled={switching || isRecruiterMode}
                  className={`px-8 py-3 rounded-full font-semibold text-lg transition-all ${
                    isRecruiterMode
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Switch to Recruiter
                </button>
              </div>
              
              {switching && (
                <p className="text-sm text-gray-600 animate-pulse">Switching mode...</p>
              )}
            </div>
          )}

          {/* Single role indicator */}
          {!hasBothRoles && (
            <p className="text-lg text-gray-600 mt-4">
              You are in {isTalentMode ? 'Talent' : 'Recruiter'} Mode
            </p>
          )}
        </div>

        {/* Dashboard Content based on Mode */}
        <div className="mt-12">
          {isTalentMode ? (
            /* Talent Dashboard */
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Dashboard</h2>
              
              {loadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
                      <div className="h-12 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Proposals Submitted */}
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {talentStats?.pending_applications || 0}
                    </h3>
                    <p className="text-gray-600 font-medium">Proposals Submitted</p>
                  </div>

                  {/* Active Gigs */}
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Briefcase className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {talentStats?.active_gigs || 0}
                    </h3>
                    <p className="text-gray-600 font-medium">Active Gigs</p>
                  </div>

                  {/* Gigs Completed */}
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">0</h3>
                    <p className="text-gray-600 font-medium">Gigs Completed</p>
                  </div>

                  {/* Earnings */}
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-emerald-100 rounded-lg">
                        <DollarSign className="w-8 h-8 text-emerald-600" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      ${talentStats?.weekly_earnings?.toFixed(2) || '0.00'}
                    </h3>
                    <p className="text-gray-600 font-medium">Earnings</p>
                  </div>
                </div>
              )}

              {/* Additional Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Active Projects */}
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">0</h3>
                  <p className="text-gray-600 font-medium">Active Projects</p>
                </div>

                {/* Another stat placeholder */}
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {talentStats?.available_jobs || 0}
                  </h3>
                  <p className="text-gray-600 font-medium">Available Jobs</p>
                </div>
              </div>
            </div>
          ) : (
            /* Recruiter Dashboard */
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recruiter Dashboard</h2>
              
              {loadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
                      <div className="h-12 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Active Jobs */}
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Briefcase className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {recruiterStats?.activeJobs || 0}
                    </h3>
                    <p className="text-gray-600 font-medium">Active Jobs</p>
                  </div>

                  {/* Total Applicants */}
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Users className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {recruiterStats?.totalApplicants || 0}
                    </h3>
                    <p className="text-gray-600 font-medium">Total Applicants</p>
                  </div>

                  {/* Pending Review */}
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Clock className="w-8 h-8 text-yellow-600" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {recruiterStats?.pendingReview || 0}
                    </h3>
                    <p className="text-gray-600 font-medium">Pending Review</p>
                  </div>

                  {/* Accepted */}
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-emerald-100 rounded-lg">
                        <UserCheck className="w-8 h-8 text-emerald-600" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {recruiterStats?.acceptedCandidates || 0}
                    </h3>
                    <p className="text-gray-600 font-medium">Accepted</p>
                  </div>
                </div>
              )}

              {/* Total Jobs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Eye className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {recruiterStats?.totalJobs || 0}
                  </h3>
                  <p className="text-gray-600 font-medium">Total Jobs</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer message */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Powered by Hapployed - Redefining work
          </p>
        </div>
      </div>
    </div>
  );
}
