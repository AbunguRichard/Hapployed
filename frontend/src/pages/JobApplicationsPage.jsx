import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, User, Mail, DollarSign, Calendar, FileText, 
  CheckCircle, XCircle, Clock, Eye, Star, Briefcase 
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '../components/DashboardHeader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function JobApplicationsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedApp, setExpandedApp] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchApplications();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/applications`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus, hirerNotes = '') => {
    try {
      setUpdating(applicationId);
      const response = await fetch(`${BACKEND_URL}/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          hirerNotes: hirerNotes || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      toast.success(`Application ${newStatus}!`);
      fetchApplications(); // Refresh list
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-300',
      accepted: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/manage-jobs')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Manage Jobs
          </button>
          
          {job && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.category}
                    </span>
                    {job.budget && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${job.budget.min} - ${job.budget.max}
                      </span>
                    )}
                    {job.views !== undefined && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {job.views} views
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards - Only show if there are applications */}
        {applications.length > 0 && (
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-4">
              <p className="text-sm text-yellow-800 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4">
              <p className="text-sm text-blue-800 mb-1">Reviewed</p>
              <p className="text-2xl font-bold text-blue-900">{stats.reviewed}</p>
            </div>
            <div className="bg-green-50 rounded-xl border-2 border-green-200 p-4">
              <p className="text-sm text-green-800 mb-1">Accepted</p>
              <p className="text-2xl font-bold text-green-900">{stats.accepted}</p>
            </div>
            <div className="bg-red-50 rounded-xl border-2 border-red-200 p-4">
              <p className="text-sm text-red-800 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
            </div>
          </div>
        )}

        {/* Filter Tabs - Only show if there are applications */}
        {applications.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { value: 'all', label: 'All', count: stats.total },
                { value: 'pending', label: 'Pending', count: stats.pending },
                { value: 'reviewed', label: 'Reviewed', count: stats.reviewed },
                { value: 'accepted', label: 'Accepted', count: stats.accepted },
                { value: 'rejected', label: 'Rejected', count: stats.rejected }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    filter === tab.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-200">
            {/* Empty State Icon */}
            <div className="text-7xl mb-6">📭</div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No applications yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filter === 'all' 
                ? "No one has applied to this job yet. Here are some ways to attract candidates:"
                : `No ${filter} applications for this job.`
              }
            </p>
            
            {/* Action Buttons */}
            {filter === 'all' && (
              <>
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  <button
                    onClick={() => navigate(`/job/${jobId}/edit`)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <span className="text-lg">✏️</span>
                    Edit Job Posting
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + `/job/${jobId}`);
                      toast.success('Job link copied! Share it on social media.');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all border-2 border-gray-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <span className="text-lg">📢</span>
                    Share on Social Media
                  </button>
                  <button
                    onClick={() => navigate('/manage-jobs')}
                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all border-2 border-gray-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <span className="text-lg">📊</span>
                    View All Jobs
                  </button>
                </div>

                {/* Tips Section */}
                <div className="max-w-md mx-auto text-left bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    Tips to get more applicants:
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <span>Add a detailed job description with clear requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <span>Include salary range (jobs with salary get <strong>3x more applicants</strong>)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <span>Share on LinkedIn and other job boards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <span>Use specific job titles that candidates search for</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(application => (
              <div key={application.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {application.workerName ? application.workerName.charAt(0).toUpperCase() : 'W'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {application.workerName || 'Worker'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {application.workerEmail}
                        </div>
                      </div>
                    </div>
                    
                    {/* Worker Profile Stats */}
                    {application.workerProfile && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 ml-14">
                        {application.workerProfile.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {application.workerProfile.rating}
                          </span>
                        )}
                        {application.workerProfile.completedJobs !== undefined && (
                          <span>{application.workerProfile.completedJobs} jobs completed</span>
                        )}
                        {application.workerProfile.hourlyRate && (
                          <span>${application.workerProfile.hourlyRate}/hr</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(application.status)}`}>
                    {application.status.toUpperCase()}
                  </span>
                </div>

                {/* Application Details */}
                <div className="space-y-4">
                  {/* Cover Letter */}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Cover Letter:</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                      {application.coverLetter}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {application.proposedRate && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">Proposed Rate:</span> ${application.proposedRate}/hr
                      </div>
                    )}
                    {application.availableStartDate && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span className="font-semibold">Available:</span> {new Date(application.availableStartDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  {application.workerProfile?.skills && application.workerProfile.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {application.workerProfile.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'reviewed')}
                          disabled={updating === application.id}
                          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Mark as Reviewed
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'accepted')}
                          disabled={updating === application.id}
                          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                          disabled={updating === application.id}
                          className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {application.status === 'reviewed' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'accepted')}
                          disabled={updating === application.id}
                          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                          disabled={updating === application.id}
                          className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {(application.status === 'accepted' || application.status === 'rejected') && (
                      <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-center">
                        Application {application.status}
                      </div>
                    )}
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
