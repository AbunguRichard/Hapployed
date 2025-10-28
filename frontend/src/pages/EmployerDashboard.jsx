import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, Users, TrendingUp, DollarSign, Eye, CheckCircle,
  Clock, Plus, MessageSquare, Star, Calendar, Target, Zap,
  Award, TrendingDown, AlertCircle, FileText, MapPin, Search
} from 'lucide-react';
import { toast } from 'sonner';
import NavigationBar from '../components/NavigationBar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

// Card component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border-2 border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    pendingReview: 0,
    accepted: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userId = user.id || user.email;

      // Fetch user's jobs
      const jobsResponse = await fetch(`${BACKEND_URL}/api/jobs/user/${userId}`);
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
        
        // Calculate stats
        const totalViews = jobsData.reduce((sum, job) => sum + (job.views || 0), 0);
        const activeJobs = jobsData.filter(j => j.status === 'published').length;
        
        setStats(prev => ({
          ...prev,
          totalJobs: jobsData.length,
          activeJobs: activeJobs,
          totalViews: totalViews
        }));

        // Fetch applications for each job
        let allApplications = [];
        for (const job of jobsData.slice(0, 5)) { // Only fetch for first 5 jobs
          try {
            const appsResponse = await fetch(`${BACKEND_URL}/api/jobs/${job.id}/applications`);
            if (appsResponse.ok) {
              const appsData = await appsResponse.json();
              allApplications = [...allApplications, ...appsData.map(app => ({ ...app, jobTitle: job.title }))];
            }
          } catch (error) {
            console.log(`Failed to fetch applications for job ${job.id}`);
          }
        }

        // Sort by date and take recent 10
        allApplications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setRecentApplications(allApplications.slice(0, 10));

        // Calculate application stats
        const totalApplicants = allApplications.length;
        const pendingReview = allApplications.filter(a => a.status === 'pending').length;
        const accepted = allApplications.filter(a => a.status === 'accepted').length;

        setStats(prev => ({
          ...prev,
          totalApplicants,
          pendingReview,
          accepted
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const StatCard = ({ icon: Icon, label, value, change, color = 'purple' }) => (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-600">{label}</div>
    </Card>
  );

  const JobCard = ({ job }) => (
    <Card className="p-4 hover:border-purple-300 transition-all cursor-pointer" onClick={() => navigate(`/job/${job.id}/applications`)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{job.title}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location?.type || 'Remote'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {job.views || 0} views
            </span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          job.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {job.status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1 text-purple-600 font-semibold">
          <Users className="w-4 h-4" />
          {job.applicants || 0} applicants
        </span>
        <span className="text-gray-500">{getTimeAgo(job.createdAt)}</span>
      </div>
    </Card>
  );

  const ApplicationCard = ({ application }) => (
    <div className="flex items-center gap-4 p-3 border-2 border-gray-100 rounded-xl hover:border-purple-200 transition-all">
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-sm">
          {application.workerProfile?.name?.charAt(0) || 'A'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="font-semibold text-gray-900 text-sm truncate">
          {application.workerProfile?.name || 'Anonymous'}
        </h5>
        <p className="text-xs text-gray-600 truncate">{application.jobTitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          application.status === 'accepted' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {application.status}
        </span>
        <span className="text-xs text-gray-500">{getTimeAgo(application.appliedAt)}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Hirer'} 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your job postings</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard 
                  icon={Briefcase} 
                  label="Active Jobs" 
                  value={stats.activeJobs}
                  change={12}
                  color="purple"
                />
                <StatCard 
                  icon={Users} 
                  label="Total Applicants" 
                  value={stats.totalApplicants}
                  change={8}
                  color="blue"
                />
                <StatCard 
                  icon={Eye} 
                  label="Total Views" 
                  value={stats.totalViews}
                  change={-3}
                  color="green"
                />
                <StatCard 
                  icon={Clock} 
                  label="Pending Review" 
                  value={stats.pendingReview}
                  color="orange"
                />
                <StatCard 
                  icon={CheckCircle} 
                  label="Accepted" 
                  value={stats.accepted}
                  color="emerald"
                />
                <StatCard 
                  icon={FileText} 
                  label="Total Jobs" 
                  value={stats.totalJobs}
                  color="indigo"
                />
              </div>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/post-project')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:brightness-110 transition-all shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Post New Job</div>
                      <div className="text-xs opacity-90">Start hiring now</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/manage-jobs')}
                    className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all"
                  >
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Manage Jobs</div>
                      <div className="text-xs text-gray-600">View all postings</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/find-workers')}
                    className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all"
                  >
                    <Search className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Find Workers</div>
                      <div className="text-xs text-gray-600">Browse talent</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/messages')}
                    className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all"
                  >
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Messages</div>
                      <div className="text-xs text-gray-600">Chat with talent</div>
                    </div>
                  </button>
                </div>
              </Card>

              {/* Recent Jobs */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Active Job Postings</h3>
                  <button 
                    onClick={() => navigate('/manage-jobs')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                  >
                    View All →
                  </button>
                </div>
                {jobs.filter(j => j.status === 'published').length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No active jobs yet</p>
                    <button
                      onClick={() => navigate('/post-project')}
                      className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.filter(j => j.status === 'published').slice(0, 5).map(job => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </Card>

              {/* Performance Insights */}
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Insights</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Your jobs get <strong>2.3x more views</strong> than average
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <strong>78% response rate</strong> - Great job engaging with candidates!
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        You're in the <strong>top 10%</strong> of hirers on Hapployed
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-6">
              
              {/* Pending Review */}
              {stats.pendingReview > 0 && (
                <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <div>
                      <h3 className="font-bold text-gray-900">Action Required</h3>
                      <p className="text-sm text-gray-600">
                        {stats.pendingReview} applications need review
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/manage-jobs')}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Review Now
                  </button>
                </Card>
              )}

              {/* Recent Applications */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
                  <span className="text-xs text-gray-500">{recentApplications.length} total</span>
                </div>
                {recentApplications.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No applications yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {recentApplications.map((app, idx) => (
                      <ApplicationCard key={idx} application={app} />
                    ))}
                  </div>
                )}
              </Card>

              {/* Tips & Resources */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3">💡 Hiring Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Jobs with detailed descriptions get 3x more applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Respond to applicants within 24 hours for best results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Competitive rates attract top-tier talent faster</span>
                  </li>
                </ul>
              </Card>

              {/* Upgrade CTA */}
              <Card className="p-6 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <Award className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
                <p className="text-sm opacity-90 mb-4">
                  Get priority listing, advanced analytics, and unlimited job posts
                </p>
                <button className="w-full py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                  Learn More
                </button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
