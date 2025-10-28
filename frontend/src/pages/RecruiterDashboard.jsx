import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModeContext } from '../context/ModeContext';
import NavigationBar from '../components/NavigationBar';
import ModeToggle from '../components/ModeToggle';
import {
  Briefcase,
  Users,
  Eye,
  Clock,
  CheckCircle,
  FileText,
  Plus,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { currentMode, switchMode, isDualRole } = useModeContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    totalViews: 0,
    pendingReview: 0,
    accepted: 0,
    totalJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
  
  const handleModeChange = async (newMode) => {
    try {
      await switchMode(newMode);
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch mode:', error);
      alert('Failed to switch mode. Please try logging out and back in.');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's jobs
      const jobsResponse = await fetch(`${BACKEND_URL}/api/jobs/user/${user?.id || 'user123'}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (jobsResponse.ok) {
        const jobs = await jobsResponse.json();
        const activeJobs = jobs.filter(j => j.status === 'published').length;
        
        // Calculate stats
        let totalApplicants = 0;
        let totalViews = 0;
        let pendingReview = 0;
        let accepted = 0;

        for (const job of jobs) {
          totalViews += job.viewCount || 0;
          
          // Fetch applications for this job
          try {
            const appsResponse = await fetch(`${BACKEND_URL}/api/jobs/${job.id}/applications`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
              }
            });
            
            if (appsResponse.ok) {
              const apps = await appsResponse.json();
              totalApplicants += apps.length;
              pendingReview += apps.filter(a => a.status === 'pending').length;
              accepted += apps.filter(a => a.status === 'accepted').length;
            }
          } catch (error) {
            console.error('Error fetching applications:', error);
          }
        }

        setStats({
          activeJobs,
          totalApplicants,
          totalViews,
          pendingReview,
          accepted,
          totalJobs: jobs.length
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, trend, trendValue, bgColor, iconColor }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Toggle - Visible at top of dashboard */}
        {user && user.roles && user.roles.length > 1 && (
          <div className="mb-6 flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div>
              <p className="text-sm text-gray-600">You have access to both Employer and Talent modes</p>
              <p className="text-xs text-gray-500 mt-1">Switch between modes to access different features</p>
            </div>
            <ModeToggle 
              currentMode={currentMode || 'employer'}
              onModeChange={handleModeChange}
            />
          </div>
        )}
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Recruiter'} 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your job postings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Briefcase}
            label="Active Jobs"
            value={stats.activeJobs}
            trend="up"
            trendValue="12%"
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            icon={Users}
            label="Total Applicants"
            value={stats.totalApplicants}
            trend="up"
            trendValue="8%"
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={stats.totalViews}
            trend="down"
            trendValue="3%"
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={Clock}
            label="Pending Review"
            value={stats.pendingReview}
            bgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Accepted"
            value={stats.accepted}
            bgColor="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon={FileText}
            label="Total Jobs"
            value={stats.totalJobs}
            bgColor="bg-gray-100"
            iconColor="text-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
                <span className="text-sm text-gray-600">{recentApplications.length} total</span>
              </div>
              
              {recentApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{app.workerName}</p>
                        <p className="text-sm text-gray-600">{app.jobTitle}</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/post-project')}
                  className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  <Plus className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-semibold text-lg">Post New Job</p>
                    <p className="text-sm text-purple-100">Start hiring now</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/manage-jobs')}
                  className="flex items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all"
                >
                  <Briefcase className="h-6 w-6 text-purple-600" />
                  <div className="text-left">
                    <p className="font-semibold text-lg text-gray-900">Manage Jobs</p>
                    <p className="text-sm text-gray-600">View all postings</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Hiring Tips */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <h3 className="font-bold text-gray-900">Hiring Tips</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-500 text-lg">⭐</div>
                <p className="text-sm text-gray-700">
                  Jobs with detailed descriptions get 3x more applications
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-blue-500 text-lg">⏰</div>
                <p className="text-sm text-gray-700">
                  Respond to applicants within 24 hours for best results
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-500 text-lg">💰</div>
                <p className="text-sm text-gray-700">
                  Competitive rates attract top-tier talent faster
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
