import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import { ArrowLeft, UserCog, Plus, Edit, Trash2, Shield, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

export default function AccountsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRecruiter = user?.currentMode === 'employer';
  const [activeTab, setActiveTab] = useState('team');

  const handleReturn = () => {
    if (isRecruiter) {
      navigate('/recruiter-dashboard');
    } else {
      navigate('/epic-worker-dashboard');
    }
  };

  // Mock data - in production, this would come from API
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      role: 'Admin',
      department: 'HR',
      status: 'Active',
      joinedDate: '2023-01-15'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@company.com',
      role: 'Manager',
      department: 'Engineering',
      status: 'Active',
      joinedDate: '2023-03-20'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.r@company.com',
      role: 'Member',
      department: 'Design',
      status: 'Active',
      joinedDate: '2023-06-10'
    }
  ];

  const organizations = [
    {
      id: 1,
      name: 'TechCorp Inc.',
      industry: 'Technology',
      size: '50-200 employees',
      location: 'San Francisco, CA',
      role: 'Owner'
    }
  ];

  return (
    <div style={{ backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Return Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleReturn}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-3">
              <UserCog className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Accounts Management</h1>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="font-medium">Invite Team Member</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total Users" value="3" icon="👥" />
          <StatCard title="Active" value="3" icon="✅" />
          <StatCard title="Pending Invites" value="2" icon="📧" />
          <StatCard title="Organizations" value="1" icon="🏢" />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <TabButton label="Team Members" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
              <TabButton label="Organizations" active={activeTab === 'org'} onClick={() => setActiveTab('org')} />
              <TabButton label="Permissions" active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')} />
              <TabButton label="Activity Log" active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'team' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
                  <div className="flex gap-2">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                      <option>All Roles</option>
                      <option>Admin</option>
                      <option>Manager</option>
                      <option>Member</option>
                    </select>
                  </div>
                </div>
                {teamMembers.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
            )}

            {activeTab === 'org' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Organizations</h2>
                {organizations.map((org) => (
                  <OrganizationCard key={org.id} org={org} />
                ))}
              </div>
            )}

            {activeTab === 'permissions' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Role Permissions</h2>
                <PermissionsTable />
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Activity Log</h3>
                <p className="text-gray-600">Recent account activities and changes will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`py-4 border-b-2 font-medium transition-colors ${
        active
          ? 'border-purple-600 text-purple-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

function TeamMemberCard({ member }) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-lg font-bold text-purple-600">
          {member.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{member.name}</p>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {member.email}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {member.department}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          member.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
          member.role === 'Manager' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {member.role}
        </span>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          {member.status}
        </span>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
  );
}

function OrganizationCard({ org }) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{org.name}</h3>
          <div className="space-y-2 text-gray-600">
            <p className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {org.industry}
            </p>
            <p className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              {org.size}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {org.location}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          {org.role}
        </span>
      </div>
      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
        Manage Organization
      </button>
    </div>
  );
}

function PermissionsTable() {
  const permissions = [
    { feature: 'View Dashboard', admin: true, manager: true, member: true },
    { feature: 'Post Jobs', admin: true, manager: true, member: false },
    { feature: 'Manage Candidates', admin: true, manager: true, member: false },
    { feature: 'Schedule Interviews', admin: true, manager: true, member: true },
    { feature: 'Manage Billing', admin: true, manager: false, member: false },
    { feature: 'Invite Users', admin: true, manager: false, member: false },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Feature</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Admin</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Manager</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Member</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {permissions.map((perm, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{perm.feature}</td>
              <td className="px-6 py-4 text-center">
                {perm.admin ? <span className="text-green-600 text-xl">✓</span> : <span className="text-red-600 text-xl">✗</span>}
              </td>
              <td className="px-6 py-4 text-center">
                {perm.manager ? <span className="text-green-600 text-xl">✓</span> : <span className="text-red-600 text-xl">✗</span>}
              </td>
              <td className="px-6 py-4 text-center">
                {perm.member ? <span className="text-green-600 text-xl">✓</span> : <span className="text-red-600 text-xl">✗</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}