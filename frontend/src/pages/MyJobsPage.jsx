import React, { useState } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import { ClipboardList, Send, Briefcase, Clock, DollarSign, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState('applications');

  const tabs = [
    { id: 'applications', label: 'Applications', icon: Send },
    { id: 'active', label: 'Active Work', icon: Briefcase },
    { id: 'offers', label: 'Offers', icon: Clock },
    { id: 'history', label: 'History', icon: ClipboardList }
  ];

  // Mock data for demonstration
  const applications = [
    {
      id: 1,
      title: 'Full Stack Developer for E-commerce',
      type: 'Project',
      appliedDate: '2025-01-15',
      status: 'Viewed',
      client: 'TechCorp Inc.',
      budget: '$5,000'
    },
    {
      id: 2,
      title: 'Emergency WordPress Fix',
      type: 'Gig',
      appliedDate: '2025-01-14',
      status: 'Submitted',
      client: 'John Smith',
      budget: '$150'
    }
  ];

  const activeWork = [
    {
      id: 1,
      title: 'Mobile App Development',
      client: 'StartupXYZ',
      progress: 65,
      deadline: '2025-02-28',
      earnings: '$3,250'
    }
  ];

  const offers = [
    {
      id: 1,
      title: 'React Developer Position',
      client: 'Digital Agency Co.',
      budget: '$4,500',
      receivedDate: '2025-01-16',
      expiresIn: '2 days'
    }
  ];

  const history = [
    {
      id: 1,
      title: 'Website Redesign Project',
      client: 'Fashion Brand LLC',
      completedDate: '2024-12-20',
      earnings: '$2,800',
      rating: 5
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Submitted': { color: 'bg-blue-100 text-blue-800', icon: Send },
      'Viewed': { color: 'bg-purple-100 text-purple-800', icon: Eye },
      'Hired': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig['Submitted'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const renderApplications = () => (
    <div className="space-y-4">
      {applications.map((app) => (
        <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{app.title}</h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{app.type}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Client: {app.client}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                <span>Budget: {app.budget}</span>
              </div>
            </div>
            <div>
              {getStatusBadge(app.status)}
            </div>
          </div>
        </div>
      ))}
      {applications.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Send className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No applications yet</p>
        </div>
      )}
    </div>
  );

  const renderActiveWork = () => (
    <div className="space-y-4">
      {activeWork.map((work) => (
        <div key={work.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{work.title}</h3>
              <p className="text-sm text-gray-600 mb-3">Client: {work.client}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Deadline: {new Date(work.deadline).toLocaleDateString()}</span>
                <span>Earnings: {work.earnings}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{work.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${work.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
      {activeWork.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No active work at the moment</p>
        </div>
      )}
    </div>
  );

  const renderOffers = () => (
    <div className="space-y-4">
      {offers.map((offer) => (
        <div key={offer.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-medium text-purple-600">Expires in {offer.expiresIn}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{offer.title}</h3>
              <p className="text-sm text-gray-600 mb-3">From: {offer.client}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Received: {new Date(offer.receivedDate).toLocaleDateString()}</span>
                <span className="font-semibold text-green-600">Budget: {offer.budget}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium">
              Accept Offer
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Decline
            </button>
          </div>
        </div>
      ))}
      {offers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No pending offers</p>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      {history.map((job) => (
        <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Client: {job.client}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Completed: {new Date(job.completedDate).toLocaleDateString()}</span>
                <span className="font-semibold text-green-600">Earned: {job.earnings}</span>
                <div className="flex items-center gap-1">
                  {[...Array(job.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {history.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No completed jobs yet</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'applications':
        return renderApplications();
      case 'active':
        return renderActiveWork();
      case 'offers':
        return renderOffers();
      case 'history':
        return renderHistory();
      default:
        return renderApplications();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
          <p className="text-gray-600">Manage your applications, active work, and job history</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
