import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, Calendar, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import NavigationBar from '../components/NavigationBar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, reviewed, accepted, rejected

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const workerId = user.id || user.email;
      const response = await fetch(`${BACKEND_URL}/api/workers/${workerId}/applications`);
      
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

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/applications/${applicationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw application');
      }

      toast.success('Application withdrawn successfully');
      fetchApplications(); // Refresh list
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast.error('Failed to withdraw application');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'reviewed':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track the status of your job applications</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: 'all', label: 'All', count: applications.length },
              { value: 'pending', label: 'Pending', count: applications.filter(a => a.status === 'pending').length },
              { value: 'reviewed', label: 'Reviewed', count: applications.filter(a => a.status === 'reviewed').length },
              { value: 'accepted', label: 'Accepted', count: applications.filter(a => a.status === 'accepted').length },
              { value: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length }
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

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                : `You don't have any ${filter} applications.`
              }
            </p>
            {filter === 'all' && (
              <a
                href="/opportunities"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Browse Jobs
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(application => (
              <div key={application.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {application.jobDetails?.title || 'Job Title'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(application.status)}`}>
                        {application.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                      {application.jobDetails?.category && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {application.jobDetails.category}
                        </span>
                      )}
                      {application.jobDetails?.budget && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${application.jobDetails.budget.min} - ${application.jobDetails.budget.max}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                  </div>
                </div>

                {/* Cover Letter Preview */}
                {application.coverLetter && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Cover Letter:</p>
                    <p className="text-sm text-gray-700 line-clamp-3">{application.coverLetter}</p>
                  </div>
                )}

                {/* Application Details */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-6 text-sm">
                    {application.proposedRate && (
                      <div>
                        <span className="text-gray-600">Proposed Rate:</span>
                        <span className="font-semibold text-gray-900 ml-2">${application.proposedRate}/hr</span>
                      </div>
                    )}
                    {application.availableStartDate && (
                      <div>
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {new Date(application.availableStartDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  {application.status === 'pending' && (
                    <button
                      onClick={() => handleWithdraw(application.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Withdraw
                    </button>
                  )}
                </div>

                {/* Hirer Notes (if any) */}
                {application.hirerNotes && (
                  <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Hirer's Note:</p>
                    <p className="text-sm text-gray-700">{application.hirerNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
