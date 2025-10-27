import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, TrendingUp, CheckCircle, Clock, XCircle, 
  Star, MapPin, DollarSign, Briefcase, Eye, AlertCircle,
  ChevronDown, ChevronUp, Filter, Download
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '../components/DashboardHeader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function RoleTrackerDashboard() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (jobId) {
      fetchJobAndApplications();
    }
  }, [jobId]);

  const fetchJobAndApplications = async () => {
    try {
      setLoading(true);
      
      // Fetch job details
      const jobResponse = await fetch(`${BACKEND_URL}/api/jobs/${jobId}`);
      if (!jobResponse.ok) {
        throw new Error('Failed to fetch job details');
      }
      const jobData = await jobResponse.json();
      setJob(jobData);

      // Fetch applications
      const appsResponse = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/applications`);
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load role tracker data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to group applications by role
  const getApplicationsByRole = () => {
    if (!job || !job.roles) return {};
    
    const roleMap = {};
    job.roles.forEach(role => {
      roleMap[role.roleId] = {
        ...role,
        applications: applications.filter(app => app.roleId === role.roleId)
      };
    });
    
    return roleMap;
  };

  // Calculate role statistics
  const getRoleStats = (role, apps) => {
    return {
      total: apps.length,
      pending: apps.filter(a => a.status === 'pending').length,
      reviewed: apps.filter(a => a.status === 'reviewed').length,
      accepted: apps.filter(a => a.status === 'accepted').length,
      rejected: apps.filter(a => a.status === 'rejected').length,
      hired: role.hired || 0,
      needed: role.numberOfPeople || 1
    };
  };

  // Handle status update
  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/applications/${applicationId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) throw new Error('Failed to update status');
      
      toast.success(`Application ${newStatus}`);
      fetchJobAndApplications(); // Refresh data
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const rolesByStatus = getApplicationsByRole();
  const filteredRoles = Object.entries(rolesByStatus).filter(([roleId, roleData]) => {
    if (filterRole !== 'all' && roleId !== filterRole) return false;
    return true;
  });

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Pending' },
      reviewed: { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Reviewed' },
      accepted: { color: 'bg-green-100 text-green-700 border-green-300', label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-700 border-red-300', label: 'Rejected' },
    };
    const { color, label } = config[status] || config.pending;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${color}`}>
        {label}
      </span>
    );
  };

  // Progress bar component
  const ProgressBar = ({ current, total, label }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    const isComplete = current >= total;
    
    return (
      <div>
        <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
          <span>{label}</span>
          <span>{current} / {total}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' : 'bg-purple-600'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  // Role card component
  const RoleCard = ({ roleId, roleData }) => {
    const stats = getRoleStats(roleData, roleData.applications);
    const isExpanded = expandedRole === roleId;
    const hiringProgress = (stats.hired / stats.needed) * 100;
    const isFullyHired = stats.hired >= stats.needed;

    return (
      <div className={`bg-white rounded-xl border-2 transition-all ${
        isFullyHired ? 'border-green-300 bg-green-50' : 'border-gray-200'
      } shadow-sm hover:shadow-lg p-6`}>
        
        {/* Role Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{roleData.roleName}</h3>
              {isFullyHired && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Fully Hired
                </span>
              )}
            </div>
            
            {/* Role Details */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Need {roleData.numberOfPeople} {roleData.numberOfPeople > 1 ? 'people' : 'person'}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                ${roleData.payPerPerson}/hr
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {roleData.experienceLevel}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {roleData.workLocation}
              </span>
            </div>

            {/* Skills */}
            {roleData.requiredSkills && roleData.requiredSkills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {roleData.requiredSkills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setExpandedRole(isExpanded ? null : roleId)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Applications</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{stats.reviewed}</div>
            <div className="text-xs text-gray-600">Reviewed</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-xs text-gray-600">Accepted</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Hiring Progress */}
        <ProgressBar 
          current={stats.hired} 
          total={stats.needed} 
          label="Hiring Progress"
        />

        {/* Expanded Applications List */}
        {isExpanded && roleData.applications.length > 0 && (
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Applications for {roleData.roleName}</h4>
            <div className="space-y-3">
              {roleData.applications
                .filter(app => filterStatus === 'all' || app.status === filterStatus)
                .map(app => (
                <div key={app.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {app.workerProfile?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{app.workerProfile?.name || 'Anonymous'}</h5>
                    <p className="text-sm text-gray-600">{app.workerProfile?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                      {app.proposedRate && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs font-medium text-green-600">
                            ${app.proposedRate}/hr
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} />
                    
                    {app.status === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'reviewed')}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'accepted')}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                    
                    {app.status === 'reviewed' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'accepted')}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isExpanded && roleData.applications.length === 0 && (
          <div className="mt-6 pt-6 border-t-2 border-gray-200 text-center py-6">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No applications yet for this role</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading role tracker...</p>
        </div>
      </div>
    );
  }

  if (!job || !job.roles || job.roles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              This job doesn't use multi-role hiring
            </h3>
            <p className="text-gray-600 mb-6">
              Only jobs with multiple roles can use the Role Tracker Dashboard
            </p>
            <button
              onClick={() => navigate('/manage-jobs')}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Manage Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalApplications = applications.length;
  const totalRoles = job.roles.length;
  const totalPositions = job.roles.reduce((sum, role) => sum + (role.numberOfPeople || 1), 0);
  const totalHired = job.roles.reduce((sum, role) => sum + (role.hired || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/manage-jobs')}
            className="text-purple-600 hover:text-purple-700 font-semibold mb-4 inline-flex items-center gap-2"
          >
            ← Back to Manage Jobs
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
          <p className="text-gray-600">Multi-Role Hiring Tracker</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">{totalRoles}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Roles</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{totalPositions}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Positions Needed</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-gray-900">{totalApplications}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Applications</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-green-300 p-6 shadow-sm bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">{totalHired}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Hired</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Overall Hiring Progress</h3>
          <ProgressBar 
            current={totalHired} 
            total={totalPositions} 
            label={`${totalHired} of ${totalPositions} positions filled`}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
          >
            <option value="all">All Roles</option>
            {job.roles.map(role => (
              <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Role Cards */}
        <div className="space-y-6">
          {filteredRoles.map(([roleId, roleData]) => (
            <RoleCard key={roleId} roleId={roleId} roleData={roleData} />
          ))}
        </div>
      </div>
    </div>
  );
}
