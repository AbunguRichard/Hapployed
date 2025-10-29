import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, Inbox, Zap, CheckCircle, 
  MessageSquare, DollarSign, Star, Tool, Settings,
  Search, MapPin, Clock, Tag, Calendar, TrendingUp,
  Filter, Play, Pause, FileText, Award, Target
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function WorkerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [jobFilters, setJobFilters] = useState({
    search: '',
    location: 'any',
    budget: 'any',
    duration: 'any',
    category: 'any'
  });

  // State for real data
  const [stats, setStats] = useState({
    availableJobs: 0,
    activeGigs: 0,
    pendingApplications: 0,
    weeklyEarnings: 0
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [activeGigs, setActiveGigs] = useState([]);
  const [earnings, setEarnings] = useState({
    available: 0,
    pending: 0,
    thisMonth: 0,
    totalEarned: 0
  });
  const [reputation, setReputation] = useState({
    score: 0,
    reliability: 0,
    communication: 0,
    quality: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data
  useEffect(() => {
    if (user?.email) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userId = user?.email || 'demo-user';

      // Fetch all data in parallel
      const [
        statsRes,
        scheduleRes,
        jobsRes,
        gigsRes,
        earningsRes,
        reputationRes,
        achievementsRes
      ] = await Promise.all([
        fetch(`${BACKEND_URL}/api/worker-dashboard/stats/${userId}`),
        fetch(`${BACKEND_URL}/api/worker-dashboard/schedule/${userId}`),
        fetch(`${BACKEND_URL}/api/worker-dashboard/recommended-jobs/${userId}`),
        fetch(`${BACKEND_URL}/api/worker-dashboard/active-gigs/${userId}`),
        fetch(`${BACKEND_URL}/api/worker-dashboard/earnings/${userId}`),
        fetch(`${BACKEND_URL}/api/worker-dashboard/reputation/${userId}`),
        fetch(`${BACKEND_URL}/api/worker-dashboard/achievements/${userId}`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        setTodaySchedule(scheduleData);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setRecommendedJobs(jobsData);
      }

      if (gigsRes.ok) {
        const gigsData = await gigsRes.json();
        setActiveGigs(gigsData);
      }

      if (earningsRes.ok) {
        const earningsData = await earningsRes.json();
        setEarnings(earningsData);
      }

      if (reputationRes.ok) {
        const reputationData = await reputationRes.json();
        setReputation(reputationData);
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData.length > 0 ? achievementsData : [
          { name: 'Getting Started', icon: '🎯', description: 'Complete your first gig to unlock achievements' }
        ]);
      } else {
        // Set default achievement if no data
        setAchievements([
          { name: 'Getting Started', icon: '🎯', description: 'Complete your first gig to unlock achievements' }
        ]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'home', name: 'Dashboard Home', icon: LayoutDashboard },
    { id: 'feed', name: 'Job Feed', icon: Briefcase },
    { id: 'applications', name: 'My Applications', icon: Inbox },
    { id: 'active', name: 'Active Gigs', icon: Zap },
    { id: 'completed', name: 'Completed Work', icon: CheckCircle },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'earnings', name: 'My Earnings', icon: DollarSign },
    { id: 'profile', name: 'Profile & Reputation', icon: Star },
    { id: 'resources', name: 'Resources', icon: Tool },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const renderHome = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back, {user?.name || 'Worker'}! 👋</h1>
        <p className="text-purple-100">Your command center for managing all your gigs</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Available Jobs</span>
            <Briefcase className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.availableJobs}</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Active Gigs</span>
            <Zap className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.activeGigs}</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Pending Applications</span>
            <Inbox className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.pendingApplications}</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Weekly Earnings</span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">${stats.weeklyEarnings}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">🚀 Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            Apply to Quick Matches
          </button>
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Set Availability
          </button>
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Update Profile
          </button>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">📅 Today's Schedule</h2>
        <div className="space-y-3">
          {todaySchedule.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 font-semibold min-w-[100px]">
                <Clock className="w-4 h-4" />
                {item.time}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-600">{item.duration}</div>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                Start
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">🎯 Recommended Jobs (AI-powered matches)</h2>
        <div className="space-y-4">
          {recommendedJobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              {job.priority && (
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold mb-3">
                  ⚡ QUICK HIRE
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900 mb-2">📌 {job.title}</h3>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                <span className="font-semibold text-green-600">💵 ${job.rate}/hr</span>
                <span>⏱️ {job.duration} hours</span>
                <span>🏠 {job.location}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">⭐ {job.clientRating}/5 ({job.clientReviews} reviews)</span>
                  <span className="font-semibold text-purple-600">🎯 {job.matchScore}% Match</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                    Quick Apply
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderJobFeed = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">💼 Job Feed - Opportunity Engine</h1>
      
      {/* Smart Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Smart Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="🔍 Search by skills, keywords..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            value={jobFilters.search}
            onChange={(e) => setJobFilters({...jobFilters, search: e.target.value})}
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600">
            <option>📍 Location (Any)</option>
            <option>On-site</option>
            <option>Remote</option>
            <option>Hybrid</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600">
            <option>💰 Budget range</option>
            <option>$0-$50</option>
            <option>$50-$100</option>
            <option>$100-$500</option>
            <option>$500+</option>
          </select>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {recommendedJobs.map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            {job.priority && (
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold mb-3">
                ⚡ QUICK HIRE [Priority Badge]
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-3">📌 {job.title}</h3>
            <div className="flex flex-wrap gap-4 text-sm mb-3">
              <span className="font-semibold text-green-600">💵 ${job.rate}/hr</span>
              <span>⏱️ {job.duration} hours</span>
              <span>🏠 {job.location}</span>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-600">🛠️ Required: </span>
              {job.skills.map((skill, idx) => (
                <span key={idx} className="text-sm font-medium text-gray-700">{skill}{idx < job.skills.length - 1 ? ', ' : ''}</span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm">
                <span>⭐ Client Rating: {job.clientRating}/5 ({job.clientReviews} reviews)</span>
                <span className="font-semibold text-purple-600">🎯 {job.matchScore}% Match to your skills</span>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                  Quick Apply
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Save
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveGigs = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">⚡ Active Gigs Hub</h1>
      
      {activeGigs.map((gig) => (
        <div key={gig.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{gig.title}</h2>
              <p className="text-gray-600">Client: {gig.client} ⭐{gig.clientRating}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                📋 Project Brief
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                💬 Messages
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                📁 Files
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                ⏱️ Time Tracker
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold mb-4">🎯 Milestones:</h3>
            <div className="space-y-3">
              {gig.milestones.map((milestone, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-4 rounded-lg ${
                  milestone.completed ? 'bg-green-50 border border-green-200' : 
                  milestone.dueDate ? 'bg-orange-50 border border-orange-200' : 
                  'bg-gray-50 border border-gray-200'
                }`}>
                  <span className="text-2xl">
                    {milestone.completed ? '✓' : milestone.dueDate ? '➤' : '○'}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold">{milestone.name}</div>
                    {milestone.dueDate && (
                      <div className="text-sm text-orange-600">Due: {milestone.dueDate}</div>
                    )}
                  </div>
                  <div className="font-bold text-green-600">${milestone.amount}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
              Submit Work
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
              Request Payment
            </button>
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              Ask Question
            </button>
            <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              Extend Deadline
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">💰 My Earnings - Financial Command</h1>
      
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Available</div>
          <div className="text-3xl font-bold text-green-600 mb-3">${earnings.available}</div>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
            Withdraw
          </button>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Pending</div>
          <div className="text-3xl font-bold text-orange-600">${earnings.pending}</div>
          <div className="text-sm text-gray-600 mt-2">3 jobs</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">This Month</div>
          <div className="text-3xl font-bold text-purple-600">${earnings.thisMonth}</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Earned</div>
          <div className="text-3xl font-bold text-gray-900">${earnings.totalEarned}</div>
        </div>
      </div>

      {/* Earnings Analytics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          📊 Earnings Analytics
        </h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
            <p>Charts would go here (Weekly/Monthly/Yearly view)</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-bold mb-4">💳 Payment Methods</h3>
        <div className="flex gap-4">
          <div className="flex-1 p-4 border-2 border-green-500 rounded-lg bg-green-50">
            <div className="font-semibold">PayPal ✓</div>
            <div className="text-sm text-gray-600">Primary method</div>
          </div>
          <div className="flex-1 p-4 border border-gray-300 rounded-lg">
            <div className="font-semibold">Bank Transfer</div>
            <div className="text-sm text-gray-600">Add account</div>
          </div>
          <div className="flex-1 p-4 border border-gray-300 rounded-lg">
            <div className="font-semibold">Crypto</div>
            <div className="text-sm text-gray-600">Add wallet</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">⭐ My Profile & Reputation</h1>
      
      {/* Reputation Score */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">🌟 Reputation Score</h2>
            <div className="text-5xl font-bold text-purple-600">{reputation.score}/5</div>
          </div>
          <Star className="w-24 h-24 text-yellow-400 fill-current" />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Reliability</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{width: `${reputation.reliability}%`}}></div>
              </div>
              <span className="font-bold">{reputation.reliability}%</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Communication</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{width: `${reputation.communication}%`}}></div>
              </div>
              <span className="font-bold">{reputation.communication}%</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Quality</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{width: `${reputation.quality}%`}}></div>
              </div>
              <span className="font-bold">{reputation.quality}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          🏆 Achievements
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <div className="font-bold mb-1">{achievement.name}</div>
              <div className="text-sm text-gray-600">{achievement.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-purple-600">Worker Dashboard</h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeSection === item.id
                    ? 'bg-purple-100 text-purple-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Back to Main Dashboard
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {activeSection === 'home' && renderHome()}
          {activeSection === 'feed' && renderJobFeed()}
          {activeSection === 'active' && renderActiveGigs()}
          {activeSection === 'earnings' && renderEarnings()}
          {activeSection === 'profile' && renderProfile()}
          {!['home', 'feed', 'active', 'earnings', 'profile'].includes(activeSection) && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p className="text-gray-600">This section is under construction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
