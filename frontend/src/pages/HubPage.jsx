import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import { ArrowLeft, Layers, TrendingUp, Users, Briefcase, MessageSquare, Bell, Calendar, FileText, BarChart3 } from 'lucide-react';

export default function HubPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRecruiter = user?.currentMode === 'employer';

  const handleReturn = () => {
    if (isRecruiter) {
      navigate('/recruiter-dashboard');
    } else {
      navigate('/epic-worker-dashboard');
    }
  };

  // Mock data for hub sections
  const quickStats = [
    { label: 'Active Projects', value: '8', change: '+2', icon: Briefcase, color: 'purple' },
    { label: 'Team Members', value: '24', change: '+5', icon: Users, color: 'blue' },
    { label: 'Pending Tasks', value: '12', change: '-3', icon: FileText, color: 'orange' },
    { label: 'This Week', value: '156h', change: '+12h', icon: Calendar, color: 'green' }
  ];

  const recentActivity = [
    { id: 1, user: 'Sarah J.', action: 'completed task', target: 'UX Design Review', time: '5 min ago', type: 'success' },
    { id: 2, user: 'Michael C.', action: 'uploaded document', target: 'Project Brief.pdf', time: '15 min ago', type: 'info' },
    { id: 3, user: 'Emily R.', action: 'commented on', target: 'Homepage Redesign', time: '1 hour ago', type: 'comment' },
    { id: 4, user: 'David L.', action: 'scheduled meeting', target: 'Client Review', time: '2 hours ago', type: 'calendar' }
  ];

  const hubModules = [
    {
      id: 1,
      name: 'Project Management',
      description: 'Organize and track all your projects in one place',
      icon: Briefcase,
      status: 'Active',
      users: 24
    },
    {
      id: 2,
      name: 'Communication Center',
      description: 'Centralized messaging and collaboration',
      icon: MessageSquare,
      status: 'Active',
      users: 24
    },
    {
      id: 3,
      name: 'Analytics Dashboard',
      description: 'Real-time insights and performance metrics',
      icon: BarChart3,
      status: 'Beta',
      users: 12
    },
    {
      id: 4,
      name: 'Notification Center',
      description: 'Stay updated with smart notifications',
      icon: Bell,
      status: 'Active',
      users: 24
    }
  ];

  return (
    <div style={{ backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Return Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleReturn}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Organization Hub</h1>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to Your Organization Hub</h2>
          <p className="text-purple-100 mb-4">
            Your central command center for managing teams, projects, and workflows all in one place.
          </p>
          <button className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            Get Started Tour
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {quickStats.map((stat, index) => (
            <QuickStatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <QuickActionButton icon={<Briefcase className="w-5 h-5" />} label="Create Project" />
              <QuickActionButton icon={<Users className="w-5 h-5" />} label="Invite Team Member" />
              <QuickActionButton icon={<Calendar className="w-5 h-5" />} label="Schedule Meeting" />
              <QuickActionButton icon={<FileText className="w-5 h-5" />} label="New Document" />
              <QuickActionButton icon={<MessageSquare className="w-5 h-5" />} label="Start Discussion" />
            </div>
          </div>
        </div>

        {/* Hub Modules */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Hub Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hubModules.map((module) => (
              <HubModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStatCard({ stat }) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600'
  };

  const Icon = stat.icon;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-green-600 flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          {stat.change}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
      <p className="text-gray-600 text-sm">{stat.label}</p>
    </div>
  );
}

function ActivityItem({ activity }) {
  const typeColors = {
    success: 'bg-green-100 text-green-600',
    info: 'bg-blue-100 text-blue-600',
    comment: 'bg-purple-100 text-purple-600',
    calendar: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[activity.type]}`}>
        {activity.user.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-semibold">{activity.user}</span>
          {' '}{activity.action}{' '}
          <span className="font-medium text-purple-600">{activity.target}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
      <div className="text-purple-600">{icon}</div>
      <span className="font-medium text-gray-900">{label}</span>
    </button>
  );
}

function HubModuleCard({ module }) {
  const Icon = module.icon;

  return (
    <div className="p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Icon className="w-6 h-6 text-purple-600" />
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          module.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {module.status}
        </span>
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{module.name}</h4>
      <p className="text-gray-600 text-sm mb-4">{module.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{module.users} users</span>
        <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
          Open Module →
        </button>
      </div>
    </div>
  );
}