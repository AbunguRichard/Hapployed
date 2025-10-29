import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, Inbox, Zap, CheckCircle, 
  MessageSquare, DollarSign, Star, Wrench, Settings,
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
    { id: 'resources', name: 'Resources', icon: Wrench },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const renderHome = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back, {user?.name || 'Worker'}! 👋</h1>
        <p className="text-purple-100">Your command center for managing all your gigs</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      )}

      {!loading && (
        <>
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
              <button 
                onClick={() => setActiveSection('feed')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Browse Jobs
              </button>
              <button 
                onClick={() => navigate('/my-applications')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                View Applications
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Today's Schedule */}
          {todaySchedule.length > 0 && (
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
          )}

          {/* Recommended Jobs */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">🎯 Recommended Jobs (AI-powered matches)</h2>
            {recommendedJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No recommended jobs at the moment</p>
                <button 
                  onClick={() => setActiveSection('feed')}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Browse All Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedJobs.slice(0, 3).map((job) => (
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
            )}
          </div>
        </>
      )}
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
      
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      )}

      {!loading && activeGigs.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">No Active Gigs</h3>
          <p className="text-gray-600 mb-4">You don't have any active gigs at the moment</p>
          <button 
            onClick={() => setActiveSection('feed')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Browse Available Jobs
          </button>
        </div>
      )}
      
      {!loading && activeGigs.map((gig) => (
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

          {gig.milestones && gig.milestones.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-4">🎯 Milestones:</h3>
              <div className="space-y-3">
                {gig.milestones.map((milestone, idx) => (
                  <div key={idx} className={`flex items-center gap-4 p-4 rounded-lg ${
                    milestone.completed ? 'bg-green-50 border border-green-200' : 
                    milestone.due_date ? 'bg-orange-50 border border-orange-200' : 
                    'bg-gray-50 border border-gray-200'
                  }`}>
                    <span className="text-2xl">
                      {milestone.completed ? '✓' : milestone.due_date ? '➤' : '○'}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold">{milestone.name}</div>
                      {milestone.due_date && (
                        <div className="text-sm text-orange-600">Due: {milestone.due_date}</div>
                      )}
                    </div>
                    <div className="font-bold text-green-600">${milestone.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
      
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Available</div>
              <div className="text-3xl font-bold text-green-600 mb-3">${earnings.available.toFixed(2)}</div>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                Withdraw
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Pending</div>
              <div className="text-3xl font-bold text-orange-600">${earnings.pending.toFixed(2)}</div>
              <div className="text-sm text-gray-600 mt-2">In review</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">This Month</div>
              <div className="text-3xl font-bold text-purple-600">${earnings.thisMonth.toFixed(2)}</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Total Earned</div>
              <div className="text-3xl font-bold text-gray-900">${earnings.totalEarned.toFixed(2)}</div>
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
                <p>Earnings chart will be displayed here</p>
                <p className="text-sm mt-2">(Weekly/Monthly/Yearly view)</p>
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
        </>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">⭐ My Profile & Reputation</h1>
      
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Reputation Score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">🌟 Reputation Score</h2>
                <div className="text-5xl font-bold text-purple-600">{reputation.score > 0 ? reputation.score.toFixed(1) : 'N/A'}/5</div>
                {reputation.score === 0 && (
                  <p className="text-sm text-gray-600 mt-2">Complete gigs to build your reputation</p>
                )}
              </div>
              <Star className="w-24 h-24 text-yellow-400 fill-current" />
            </div>
            
            {reputation.score > 0 && (
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
            )}
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
        </>
      )}
    </div>
  );

  const renderApplications = () => {
    const [activeTab, setActiveTab] = useState('submitted');
    
    const applications = {
      drafts: [
        { id: 1, title: 'Social Media Manager', savedAt: '2 hours ago', completion: 75 }
      ],
      submitted: [
        { id: 1, job: 'Website Redesign', client: 'TechCorp', status: 'Viewed', appliedAt: '2 days ago', budget: '$500' },
        { id: 2, job: 'Logo Design', client: 'StartupXYZ', status: 'Shortlisted', appliedAt: '1 day ago', budget: '$200' }
      ],
      interviews: [
        { id: 1, job: 'Mobile App Development', client: 'FinTech Inc', date: 'Tomorrow, 3:00 PM', type: 'Video Call' }
      ],
      offers: [
        { id: 1, job: 'Data Entry Project', client: 'DataCo', amount: '$150', deadline: '3 days', expiresIn: '24 hours' }
      ]
    };

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">📥 My Applications</h1>
        
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {['drafts', 'submitted', 'interviews', 'offers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-semibold capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab} ({applications[tab].length})
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Drafts Tab */}
            {activeTab === 'drafts' && (
              <div className="space-y-4">
                {applications.drafts.map((draft) => (
                  <div key={draft.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{draft.title}</h3>
                      <span className="text-sm text-gray-600">Saved {draft.savedAt}</span>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Application Completion</span>
                        <span className="font-semibold">{draft.completion}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600" style={{width: `${draft.completion}%`}}></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Continue Application
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Delete Draft
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submitted Tab */}
            {activeTab === 'submitted' && (
              <div className="space-y-4">
                {applications.submitted.map((app) => (
                  <div key={app.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{app.job}</h3>
                        <p className="text-gray-600">Client: {app.client}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        app.status === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                        app.status === 'Viewed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>💰 {app.budget}</span>
                      <span>📅 Applied {app.appliedAt}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        View Application
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Withdraw
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Interviews Tab */}
            {activeTab === 'interviews' && (
              <div className="space-y-4">
                {applications.interviews.map((interview) => (
                  <div key={interview.id} className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{interview.job}</h3>
                        <p className="text-gray-600">Client: {interview.client}</p>
                      </div>
                      <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm font-semibold">
                        {interview.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700 font-semibold mb-3">
                      <Calendar className="w-5 h-5" />
                      <span>{interview.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                        Join Meeting
                      </button>
                      <button className="px-4 py-2 border border-orange-300 rounded-lg hover:bg-orange-100">
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Offers Tab */}
            {activeTab === 'offers' && (
              <div className="space-y-4">
                {applications.offers.map((offer) => (
                  <div key={offer.id} className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{offer.job}</h3>
                        <p className="text-gray-600">Client: {offer.client}</p>
                      </div>
                      <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-semibold">
                        Expires in {offer.expiresIn}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <span className="font-bold text-green-700 text-lg">💰 {offer.amount}</span>
                      <span className="text-gray-600">⏱️ Deadline: {offer.deadline}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                        Accept Offer
                      </button>
                      <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                        Negotiate
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCompletedWork = () => {
    const completedJobs = [
      { id: 1, title: 'E-commerce Website', client: 'ShopCo', completedDate: '1 week ago', earned: '$800', rating: 5, review: 'Excellent work! Very professional.' },
      { id: 2, title: 'Logo Design', client: 'StartupXYZ', completedDate: '2 weeks ago', earned: '$200', rating: 5, review: 'Great designer, highly recommend!' },
      { id: 3, title: 'Data Entry', client: 'DataCorp', completedDate: '3 weeks ago', earned: '$150', rating: 4, review: 'Good work, delivered on time.' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">✅ Completed Work</h1>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Earned</div>
            <div className="text-2xl font-bold text-green-600">$1,150</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {completedJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-xl mb-1">{job.title}</h3>
                  <p className="text-gray-600">Client: {job.client}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{job.earned}</div>
                  <div className="text-sm text-gray-600">{job.completedDate}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < job.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 font-semibold">{job.rating}/5</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 italic">"{job.review}"</p>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  View Details
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Request Testimonial
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Work Again
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    const messages = [
      { id: 1, from: 'TechCorp Inc', subject: 'Project Update Needed', preview: 'Hi, can you provide an update on the website redesign?', time: '10 min ago', unread: true, priority: true },
      { id: 2, from: 'System', subject: 'New Job Match: Senior Developer', preview: 'We found a job that matches your skills...', time: '1 hour ago', unread: true, priority: false },
      { id: 3, from: 'StartupXYZ', subject: 'Payment Released', preview: 'Your payment of $200 has been released...', time: '2 hours ago', unread: false, priority: false },
      { id: 4, from: 'DataCorp', subject: 'Review Posted', preview: 'Client has posted a review for your completed work...', time: '1 day ago', unread: false, priority: false }
    ];

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">💬 Messages</h1>

        {/* Quick Templates */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold mb-4">📝 Quick Templates</h3>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
              Application Message
            </button>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
              Status Update
            </button>
            <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
              Payment Reminder
            </button>
            <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200">
              Availability Notice
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Compose
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-4 hover:bg-gray-50 cursor-pointer ${msg.unread ? 'bg-purple-50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-purple-700">{msg.from[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${msg.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                          {msg.from}
                        </span>
                        {msg.priority && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                            PRIORITY
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{msg.time}</span>
                    </div>
                    <div className={`font-medium mb-1 ${msg.unread ? 'text-gray-900' : 'text-gray-600'}`}>
                      {msg.subject}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {msg.preview}
                    </div>
                  </div>
                  {msg.unread && (
                    <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderResources = () => {
    const resources = [
      { title: 'Time Tracking Guide', category: 'Tutorial', icon: '📚' },
      { title: 'Writing Better Proposals', category: 'Guide', icon: '✍️' },
      { title: 'Tax Documentation for Freelancers', category: 'Legal', icon: '📄' },
      { title: 'Communication Best Practices', category: 'Tips', icon: '💡' }
    ];

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">🛠️ Resources</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">{resource.icon}</div>
              <h3 className="font-bold text-lg mb-2">{resource.title}</h3>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {resource.category}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold mb-4">🎓 Skill Development</h3>
          <p className="text-gray-600 mb-4">Recommended courses based on your profile:</p>
          <div className="space-y-3">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="font-semibold mb-1">Advanced React Patterns</div>
              <div className="text-sm text-gray-600">Increase your hourly rate by 20%</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">⚙️ Settings</h1>

        {/* Profile Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-4">👤 Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input 
                type="text" 
                defaultValue={user?.name || ''} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
              <input 
                type="number" 
                defaultValue="50" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-4">🔔 Notification Settings</h3>
          <div className="space-y-3">
            {['New job matches', 'Application updates', 'Messages', 'Payment notifications'].map((item) => (
              <label key={item} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-purple-600 rounded" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-4">📅 Availability</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600">
                <option>Available for work</option>
                <option>Partially available</option>
                <option>Not available</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600">
                <option>Full-time (40+ hrs/week)</option>
                <option>Part-time (20-40 hrs/week)</option>
                <option>As needed (less than 20 hrs/week)</option>
              </select>
            </div>
          </div>
        </div>

        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">
          Save All Settings
        </button>
      </div>
    );
  };

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
          {activeSection === 'applications' && renderApplications()}
          {activeSection === 'active' && renderActiveGigs()}
          {activeSection === 'completed' && renderCompletedWork()}
          {activeSection === 'messages' && renderMessages()}
          {activeSection === 'earnings' && renderEarnings()}
          {activeSection === 'profile' && renderProfile()}
          {activeSection === 'resources' && renderResources()}
          {activeSection === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
}
    </div>
  );
}
