import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, Clock, DollarSign, Eye, Edit, Trash2, CheckCircle, XCircle, Plus, Search, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '../components/DashboardHeader';

export default function ManageJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft, closed
  const [searchQuery, setSearchQuery] = useState('');
  const [applicationStats, setApplicationStats] = useState({});

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

  const handlePublish = async (jobId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${jobId}/publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to publish job');
      }

      toast.success('Job published successfully!');
      fetchUserJobs(); // Refresh the list
    } catch (error) {
      console.error('Error publishing job:', error);
      toast.error('Failed to publish job');
    }
  };

  const handleClose = async (jobId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${jobId}/close`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to close job');
      }

      toast.success('Job closed successfully');
      fetchUserJobs();
    } catch (error) {
      console.error('Error closing job:', error);
      toast.error('Failed to close job');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${jobId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      toast.success('Job deleted successfully');
      fetchUserJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const jobStats = {
    total: jobs.length,
    published: jobs.filter((j) => j.status === 'published').length,
    draft: jobs.filter((j) => j.status === 'draft').length,
    closed: jobs.filter((j) => j.status === 'closed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manage Jobs</h1>
            <p className="text-gray-300">View and manage your job postings</p>
          </div>
          <button
            onClick={() => navigate('/post-project')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Jobs</p>
                <p className="text-3xl font-bold text-white">{jobStats.total}</p>
              </div>
              <Briefcase className="w-10 h-10 text-cyan-400" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Published</p>
                <p className="text-3xl font-bold text-green-400">{jobStats.published}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Drafts</p>
                <p className="text-3xl font-bold text-yellow-400">{jobStats.draft}</p>
              </div>
              <Edit className="w-10 h-10 text-yellow-400" />
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Closed</p>
                <p className="text-3xl font-bold text-gray-400">{jobStats.closed}</p>
              </div>
              <XCircle className="w-10 h-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'published', 'draft', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filter === status
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Loading your jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Get started by posting your first job'}
            </p>
            <button
              onClick={() => navigate('/post-project')}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-semibold transition-all"
            >
              Post a Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">{job.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {job.jobType}
                      </span>
                    </div>
                    {job.category && (
                      <p className="text-cyan-400 text-sm mb-2">{job.category}</p>
                    )}
                    <p className="text-gray-300 mb-3 line-clamp-2">{job.description}</p>

                    {/* Job Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      {job.budget && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            ${job.budget.amount} {job.budget.type}
                          </span>
                        </div>
                      )}
                      {job.timeline && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{job.timeline}</span>
                        </div>
                      )}
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location.type}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{job.views} views</span>
                      </div>
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.skills.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-xs">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {job.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(job.id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Publish
                      </button>
                    )}
                    {job.status === 'published' && (
                      <button
                        onClick={() => handleClose(job.id)}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/job/${job.id}`)}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
