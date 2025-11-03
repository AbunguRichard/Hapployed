import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import { ArrowLeft, Star, Filter, Search, TrendingUp, TrendingDown } from 'lucide-react';

export default function InterviewerRatingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRecruiter = user?.currentMode === 'employer';
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleReturn = () => {
    if (isRecruiter) {
      navigate('/recruiter-dashboard');
    } else {
      navigate('/epic-worker-dashboard');
    }
  };

  // Mock data - in production, this would come from API
  const interviewers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Senior Technical Recruiter',
      totalInterviews: 145,
      rating: 4.8,
      trend: 'up',
      recentFeedback: 'Professional, thorough, and respectful',
      skills: ['Technical', 'Communication', 'Time Management']
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'HR Manager',
      totalInterviews: 98,
      rating: 4.5,
      trend: 'up',
      recentFeedback: 'Great at asking relevant questions',
      skills: ['Behavioral', 'Cultural Fit', 'Structured']
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Team Lead',
      totalInterviews: 67,
      rating: 4.2,
      trend: 'down',
      recentFeedback: 'Knowledgeable but could improve time management',
      skills: ['Technical', 'Problem Solving']
    }
  ];

  const filteredInterviewers = interviewers.filter(interviewer => {
    const matchesSearch = interviewer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterBy === 'all' || 
      (filterBy === 'high' && interviewer.rating >= 4.5) ||
      (filterBy === 'medium' && interviewer.rating >= 4.0 && interviewer.rating < 4.5) ||
      (filterBy === 'low' && interviewer.rating < 4.0);
    return matchesSearch && matchesFilter;
  });

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
            <Star className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Interviewer Ratings</h1>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total Interviewers" value="3" icon="👥" />
          <StatCard title="Average Rating" value="4.5" icon="⭐" />
          <StatCard title="Total Interviews" value="310" icon="📊" />
          <StatCard title="This Month" value="47" icon="📅" />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search interviewers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <FilterButton label="All" active={filterBy === 'all'} onClick={() => setFilterBy('all')} />
              <FilterButton label="High (4.5+)" active={filterBy === 'high'} onClick={() => setFilterBy('high')} />
              <FilterButton label="Medium (4.0-4.5)" active={filterBy === 'medium'} onClick={() => setFilterBy('medium')} />
              <FilterButton label="Low (<4.0)" active={filterBy === 'low'} onClick={() => setFilterBy('low')} />
            </div>
          </div>
        </div>

        {/* Interviewers List */}
        <div className="space-y-4">
          {filteredInterviewers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No interviewers found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredInterviewers.map((interviewer) => (
              <InterviewerCard key={interviewer.id} interviewer={interviewer} />
            ))
          )}
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

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active 
          ? 'bg-purple-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function InterviewerCard({ interviewer }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600">
            {interviewer.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{interviewer.name}</h3>
            <p className="text-gray-600 mb-2">{interviewer.role}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.floor(interviewer.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">{interviewer.rating}</span>
              {interviewer.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{interviewer.totalInterviews}</div>
          <div className="text-sm text-gray-600">Interviews</div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2"><strong>Recent Feedback:</strong></p>
        <p className="text-gray-700 italic">"{interviewer.recentFeedback}"</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {interviewer.skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}