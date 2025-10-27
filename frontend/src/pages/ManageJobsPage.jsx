import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, MapPin, Clock, DollarSign, Eye, Edit, Trash2, 
  CheckCircle, XCircle, Plus, Search, FileText, Users, 
  MoreVertical, Copy, Archive, Share2, TrendingUp, Calendar,
  Filter, Download, Star, MessageSquare, AlertCircle, BarChart2
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '../components/DashboardHeader';

export default function ManageJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, most-applicants, most-views
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [applicationStats, setApplicationStats] = useState({});
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserJobs();
    }
  }, [user]);

  const fetchUserJobs = async () => {
    try {
      setLoading(true);
      const userId = user.id || user.email;
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/user/${userId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data);
      
      // Fetch application stats for each job
      const stats = {};
      for (const job of data) {
        try {
          const statsResponse = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${job.id}/applications/stats`
          );
          if (statsResponse.ok) {
            stats[job.id] = await statsResponse.json();
          }
        } catch (error) {
          console.log(`Failed to fetch stats for job ${job.id}`, error);
        }
      }
      setApplicationStats(stats);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  // Job actions
  const handlePublish = async (jobId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${jobId}/publish`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) throw new Error('Failed to publish job');
      toast.success('Job published successfully!');
      fetchUserJobs();
    } catch (error) {
      toast.error('Failed to publish job');
    }
  };

  const handleClose = async (jobId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${jobId}/close`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) throw new Error('Failed to close job');
      toast.success('Job closed successfully!');
      fetchUserJobs();
    } catch (error) {
      toast.error('Failed to close job');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${jobId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete job');
      toast.success('Job deleted successfully!');
      fetchUserJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const handleDuplicate = async (job) => {
    navigate('/post-project', { state: { duplicateJob: job } });
  };

  // Bulk actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedJobs(sortedAndFilteredJobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleBulkClose = async () => {
    try {
      await Promise.all(selectedJobs.map(jobId => handleClose(jobId)));
      setSelectedJobs([]);
      toast.success(`${selectedJobs.length} jobs closed`);
    } catch (error) {
      toast.error('Failed to close jobs');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedJobs.length} jobs?`)) return;
    
    try {
      await Promise.all(selectedJobs.map(jobId => handleDelete(jobId)));
      setSelectedJobs([]);
      toast.success(`${selectedJobs.length} jobs deleted`);
    } catch (error) {
      toast.error('Failed to delete jobs');
    }
  };

  // Helper function to calculate days since posting
  const getDaysSincePosting = (createdAt) => {
    const posted = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Sorting function
  const sortJobs = (jobsToSort) => {
    const sorted = [...jobsToSort];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'most-applicants':
        return sorted.sort((a, b) => {
          const aApplicants = applicationStats[a.id]?.total || 0;
          const bApplicants = applicationStats[b.id]?.total || 0;
          return bApplicants - aApplicants;
        });
      case 'most-views':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      default:
        return sorted;
    }
  };

  // Filtering and search
  const filteredJobs = jobs.filter(job => {
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
    const matchesLocation = locationFilter === 'all' || job.location?.type === locationFilter;
    
    return matchesStatus && matchesSearch && matchesCategory && matchesLocation;
  });

  // Apply sorting
  const sortedAndFilteredJobs = sortJobs(filteredJobs);

  // Calculate status counts
  const statusCounts = {
    all: jobs.length,
    published: jobs.filter(j => j.status === 'published').length,
    draft: jobs.filter(j => j.status === 'draft').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  };

  // Calculate analytics
  const totalApplicants = Object.values(applicationStats).reduce((sum, stat) => sum + (stat.total || 0), 0);
  const avgApplicantsPerJob = jobs.length > 0 ? (totalApplicants / jobs.length).toFixed(1) : 0;

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      published: { color: 'bg-green-100 text-green-700 border-green-300', icon: '🟢', label: 'Published' },
      draft: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🟡', label: 'Draft' },
      closed: { color: 'bg-red-100 text-red-700 border-red-300', icon: '🔴', label: 'Closed' },
    };
    const { color, icon, label } = config[status] || config.draft;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${color}`}>
        <span>{icon}</span> {label}
      </span>
    );
  };

  // Job card component
  const JobCard = ({ job }) => {
    const stats = applicationStats[job.id] || { total: 0, pending: 0, accepted: 0, rejected: 0 };
    const [showMenu, setShowMenu] = useState(false);
    
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-lg p-6 transition-all duration-200">
        {/* Header: Title and Status */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-start gap-3 flex-1">
            <input
              type="checkbox"
              checked={selectedJobs.includes(job.id)}
              onChange={() => handleSelectJob(job.id)}
              className="mt-1.5 w-5 h-5 text-purple-600 rounded border-2 border-gray-300 focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 
                  className="text-xl font-bold text-gray-900 hover:text-purple-600 cursor-pointer transition-colors"
                  onClick={() => navigate(`/job/${job.id}/edit`)}
                >
                  {job.title}
                </h3>
                <StatusBadge status={job.status} />
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-2xl border-2 border-gray-200 py-2 z-10">
                <button 
                  onClick={() => { navigate(`/job/${job.id}/edit`); setShowMenu(false); }} 
                  className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Edit className="w-4 h-4 text-blue-600" /> 
                  <span>Edit Job Details</span>
                </button>
                <button 
                  onClick={() => { handleDuplicate(job); setShowMenu(false); }} 
                  className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Copy className="w-4 h-4 text-purple-600" /> 
                  <span>Duplicate Job</span>
                </button>
                <button 
                  onClick={() => { navigate(`/job/${job.id}/applications`); setShowMenu(false); }} 
                  className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Users className="w-4 h-4 text-green-600" /> 
                  <span>View Applicants</span>
                </button>
                <button 
                  onClick={() => { 
                    navigator.clipboard.writeText(window.location.origin + `/job/${job.id}`); 
                    toast.success('Job link copied to clipboard!'); 
                    setShowMenu(false); 
                  }} 
                  className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-cyan-600" /> 
                  <span>Copy Share Link</span>
                </button>
                <hr className="my-2 border-gray-200" />
                {job.status === 'draft' && (
                  <button 
                    onClick={() => { handlePublish(job.id); setShowMenu(false); }} 
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-green-50 flex items-center gap-3 text-green-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> 
                    <span>Publish Job</span>
                  </button>
                )}
                {job.status === 'published' && (
                  <button 
                    onClick={() => { handleClose(job.id); setShowMenu(false); }} 
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-orange-50 flex items-center gap-3 text-orange-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> 
                    <span>Close Job</span>
                  </button>
                )}
                <button 
                  onClick={() => { handleDelete(job.id); setShowMenu(false); }} 
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> 
                  <span>Delete Job</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Job Details */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
            <Briefcase className="w-4 h-4" />
            {job.category || 'General'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4" />
            {job.location?.type || 'Remote'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
            <DollarSign className="w-4 h-4" />
            ${job.budget?.amount?.toLocaleString() || 'Negotiable'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
            <FileText className="w-4 h-4" />
            {job.jobType === 'project' ? 'Project' : 'Gig'}
          </span>
        </div>
        
        {/* Post Date Info */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Posted {getDaysSincePosting(job.createdAt)}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {job.views || 0} views
          </span>
        </div>

        {/* Application Metrics or Closed Status */}
        {job.status === 'closed' ? (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-red-900 mb-1">Job Closed</h4>
                <p className="text-sm text-red-700">
                  This job is no longer accepting applications. 
                  {stats.total > 0 && ` Received ${stats.total} application${stats.total !== 1 ? 's' : ''} before closing.`}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Application Metrics
            </h4>
            <div className="grid grid-cols-4 gap-3">
              <div 
                className="text-center cursor-pointer hover:bg-white rounded-lg p-2 transition-colors"
                onClick={() => navigate(`/job/${job.id}/applications`)}
              >
                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.total}</div>
                <div className="text-xs font-medium text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">{job.saved || 0}</div>
                <div className="text-xs font-medium text-gray-600">Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{stats.pending}</div>
                <div className="text-xs font-medium text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.accepted}</div>
                <div className="text-xs font-medium text-gray-600">Accepted</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Buttons at Bottom */}
        <div className="flex items-center gap-2">
          {job.status !== 'closed' && (
            <button
              onClick={() => navigate(`/job/${job.id}/applications`)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <Users className="w-5 h-5" />
              View Applicants
              {stats.total > 0 && (
                <span className="ml-1 px-2.5 py-0.5 bg-white text-purple-600 text-xs font-bold rounded-full">
                  {stats.total}
                </span>
              )}
            </button>
          )}
          
          {job.status === 'closed' && (
            <button
              onClick={() => navigate(`/job/${job.id}/applications`)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
            >
              <Eye className="w-5 h-5" />
              View Past Applications
              {stats.total > 0 && (
                <span className="ml-1 text-sm text-gray-600">({stats.total})</span>
              )}
            </button>
          )}
          
          <button
            onClick={() => navigate(`/job/${job.id}/edit`)}
            className="px-4 py-3 bg-white border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 hover:text-purple-700 font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          
          {job.status === 'draft' && (
            <button
              onClick={() => handlePublish(job.id)}
              className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              Publish
            </button>
          )}
          
          {job.status === 'published' && (
            <button
              onClick={() => handleClose(job.id)}
              className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Close
            </button>
          )}
          
          {job.status === 'closed' && (
            <button
              onClick={() => handlePublish(job.id)}
              className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Reopen
            </button>
          )}
        </div>

        {/* Smart insights */}
        {stats.total > avgApplicantsPerJob * 2 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-purple-800">
              <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0 text-purple-600" />
              <span className="font-semibold">
                🚀 High performer! This job has <span className="text-purple-900">{(stats.total / avgApplicantsPerJob).toFixed(1)}x</span> more applicants than your average job.
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Jobs</h1>
              <p className="text-gray-600 mt-1">View and manage your job postings</p>
            </div>
            <button
              onClick={() => navigate('/post-project')}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Post New Job
            </button>
          </div>

          {/* Analytics Cards - Consolidated Dashboard Metrics */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Dashboard Overview</h3>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{jobs.length}</div>
                <div className="text-sm font-medium text-gray-600">Total Jobs</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{statusCounts.published}</div>
                <div className="text-sm font-medium text-gray-600">Active Jobs</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{totalApplicants}</div>
                <div className="text-sm font-medium text-gray-600">Total Applicants</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{avgApplicantsPerJob}</div>
                <div className="text-sm font-medium text-gray-600">Avg per Job</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'published', label: 'Published', count: statusCounts.published },
            { key: 'draft', label: 'Draft', count: statusCounts.draft },
            { key: 'closed', label: 'Closed', count: statusCounts.closed },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search job titles or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
            >
              <option value="all">All Categories</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="writing">Writing</option>
              <option value="sales">Sales</option>
            </select>

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-applicants">Most Applicants</option>
              <option value="most-views">Most Views</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedJobs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedJobs.length === sortedAndFilteredJobs.length && sortedAndFilteredJobs.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">
                  {selectedJobs.length} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkClose}
                  className="px-4 py-2 bg-orange-100 text-orange-700 font-semibold rounded-lg hover:bg-orange-200 transition-colors"
                >
                  Close Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your jobs...</p>
          </div>
        ) : sortedAndFilteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery || categoryFilter !== 'all' || locationFilter !== 'all' 
                ? 'No jobs match your filters'
                : '🚀 Ready to hire your next great candidate?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || categoryFilter !== 'all' || locationFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Post your first job to get started'}
            </p>
            <button
              onClick={() => navigate('/post-project')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
            >
              Post New Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAndFilteredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
