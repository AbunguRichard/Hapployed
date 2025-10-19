import React, { useState, useEffect } from 'react';
import { 
  Zap, MapPin, Award, TrendingUp, Users, Shield, Clock, Star,
  Target, Gift, Crown, Flame, CheckCircle, Brain, Calendar,
  DollarSign, ChevronRight, AlertCircle, Briefcase, TrendingDown,
  CloudRain, Sun, Wind, Package, Bell
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardNav from '../components/DashboardNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function WorkerDashboard() {
  const [availableNow, setAvailableNow] = useState(false);
  const [radius, setRadius] = useState(10);
  const [statusMessage, setStatusMessage] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [chainBonus, setChainBonus] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [availableSquads, setAvailableSquads] = useState([]);
  const [corporatePass, setCorporatePass] = useState(null);
  const [activeInsurance, setActiveInsurance] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({
    gigsCompleted: 12,
    rating: 4.9,
    earnings: 2450,
    points: 1250
  });

  const user = { id: 'test-user', name: 'John Doe', location: 'San Francisco, CA' }; // Replace with actual auth

  useEffect(() => {
    fetchWorkerData();
    fetchAIInsights();
    fetchForecast();
    fetchSquads();
    fetchCorporatePass();
  }, []);

  const fetchWorkerData = async () => {
    try {
      // Fetch status
      const statusRes = await fetch(`${BACKEND_URL}/api/worker/status/${user.id}`);
      const statusData = await statusRes.json();
      setAvailableNow(statusData.available_now || false);
      setRadius(statusData.radius_miles || 10);
      setStatusMessage(statusData.status_message || '');

      // Fetch achievements
      const achievementsRes = await fetch(`${BACKEND_URL}/api/worker/achievements/${user.id}`);
      const achievementsData = await achievementsRes.json();
      setAchievements(achievementsData.achievements || []);

      // Fetch chain bonus
      const chainRes = await fetch(`${BACKEND_URL}/api/worker/gig-chain/${user.id}`);
      const chainData = await chainRes.json();
      if (chainData.active_bonuses && chainData.active_bonuses.length > 0) {
        setChainBonus(chainData.active_bonuses[0]);
      }
    } catch (error) {
      console.error('Error fetching worker data:', error);
    }
  };

  const fetchAIInsights = async () => {
    try {
      // Mock gigs for AI suggestions
      const mockGigs = [
        { id: '1', title: 'Plumbing Emergency', category: 'Plumbing', budget: 150, location: 'Downtown' },
        { id: '2', title: 'Furniture Assembly', category: 'Handyman', budget: 80, location: 'Mission District' }
      ];

      const workerProfile = {
        skills: ['Plumbing', 'Handyman'],
        experience: '3 years',
        preferred_areas: ['Downtown', 'Mission District'],
        rating: 4.9,
        completed_gigs: 12,
        available_now: availableNow
      };

      const response = await fetch(`${BACKEND_URL}/api/ai-matching/suggest-gigs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: user.id,
          worker_profile: workerProfile,
          available_gigs: mockGigs
        })
      });

      const data = await response.json();
      if (data.success && data.suggestions?.top_recommendations) {
        setAiSuggestions(data.suggestions.top_recommendations);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  const fetchForecast = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-matching/forecast-demand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: user.location,
          category: 'Plumbing',
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      if (data.success && data.forecast) {
        setForecast(data.forecast);
      }
    } catch (error) {
      console.error('Error fetching forecast:', error);
    }
  };

  const fetchSquads = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/worker/squads/available`);
      const data = await response.json();
      setAvailableSquads(data.squads || []);
    } catch (error) {
      console.error('Error fetching squads:', error);
    }
  };

  const fetchCorporatePass = async () => {
    // Mock corporate pass data - in production, fetch from backend
    setCorporatePass({
      plan_type: 'Premium Plumbing Pass',
      credits_remaining: 3,
      credits_per_month: 5,
      priority_access: true
    });
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = !availableNow;
      const response = await fetch(`${BACKEND_URL}/api/worker/status/available`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          available_now: newStatus,
          radius_miles: radius,
          status_message: statusMessage,
          available_until: newStatus ? new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() : null
        })
      });

      const data = await response.json();
      if (data.success) {
        setAvailableNow(newStatus);
        toast.success(newStatus ? '🟢 You\'re now available for gigs!' : '⚫ Status updated to unavailable', {
          description: newStatus ? 'Recruiters can now see you\'re ready to work' : 'You won\'t appear in available workers'
        });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const updateRadius = async (newRadius) => {
    setRadius(newRadius);
    try {
      await fetch(`${BACKEND_URL}/api/worker/status/available`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          available_now: availableNow,
          radius_miles: newRadius,
          status_message: statusMessage
        })
      });
    } catch (error) {
      console.error('Error updating radius:', error);
    }
  };

  const activateGigInsurance = async (gigId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/worker/insurance/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gig_id: gigId,
          user_id: user.id,
          coverage_type: 'quality_guarantee',
          claim_window_hours: 24
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('🛡️ Gig Insurance Activated', {
          description: '24-hour quality guarantee protection'
        });
      }
    } catch (error) {
      toast.error('Failed to activate insurance');
    }
  };

  const joinSquad = async (squadId, role) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/worker/squad/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          squad_id: squadId,
          user_id: user.id,
          role: role
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('👥 Squad Application Submitted!', {
          description: 'Team leader will review your application'
        });
        fetchSquads(); // Refresh squads
      }
    } catch (error) {
      toast.error('Failed to join squad');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/20">
      <DashboardNav />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            Welcome back, {user.name}! 👋
            <Crown className="w-8 h-8 text-yellow-500" />
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to make money today? You're ranked #12 in your area 🔥
          </p>
        </div>

        {/* INNOVATION 1: Available Now Toggle - HERO FEATURE */}
        <div className="mb-8 p-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl text-white animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Zap className={`w-10 h-10 ${availableNow ? 'animate-pulse' : ''}`} />
                Available Now Status
              </h2>
              <p className="text-green-100">
                {availableNow 
                  ? '🟢 You\'re visible to recruiters looking for immediate help!' 
                  : '⚫ Turn on to start receiving instant gig offers'}
              </p>
            </div>
            
            <button
              onClick={toggleAvailability}
              className={`relative w-24 h-12 rounded-full transition-all duration-300 ${
                availableNow ? 'bg-white' : 'bg-white/30'
              }`}
            >
              <div className={`absolute top-1 left-1 w-10 h-10 rounded-full transition-all duration-300 ${
                availableNow 
                  ? 'translate-x-12 bg-green-500' 
                  : 'translate-x-0 bg-gray-400'
              } flex items-center justify-center`}>
                {availableNow ? <Zap className="w-6 h-6 text-white" /> : null}
              </div>
            </button>
          </div>

          {availableNow && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <label className="block text-sm font-semibold mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Work Radius: {radius} miles
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => updateRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs mt-1 text-green-100">
                  <span>1 mi</span>
                  <span>25 mi</span>
                  <span>50 mi</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Status Message (Optional)</label>
                <input
                  type="text"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="e.g., Heading to downtown for 2 hours"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 placeholder-white/50 text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-600">Gigs Completed</h3>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-4xl font-black text-foreground">{stats.gigsCompleted}</p>
            <p className="text-sm text-green-600 mt-2">+3 this week</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-600">Average Rating</h3>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-4xl font-black text-foreground">{stats.rating}</p>
            <p className="text-sm text-muted-foreground mt-2">From 12 reviews</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-600">Total Earnings</h3>
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-4xl font-black text-foreground">${stats.earnings}</p>
            <p className="text-sm text-blue-600 mt-2">+$450 this week</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg text-white hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Gamification Points</h3>
              <Star className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-4xl font-black">{stats.points}</p>
            <p className="text-sm text-purple-100 mt-2">Rank #12 in area</p>
          </div>
        </div>

        {/* INNOVATION 4: Gig Chain Bonus Alert */}
        {chainBonus && (
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl text-white animate-pulse-subtle">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Flame className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">🔥 Gig Chain Active!</h3>
                <p className="text-orange-100">
                  You have priority access to nearby gigs for the next 4 hours! Apply now for <strong>1.5x bonus pay</strong>.
                </p>
              </div>
              <button 
                onClick={() => window.location.href = '/gigs-near-me'}
                className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all flex-shrink-0"
              >
                View Priority Gigs
              </button>
            </div>
          </div>
        )}

        {/* INNOVATION 3: AI Smart Matching - AI Suggestions Panel */}
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">🤖 AI Smart Match Suggestions</h2>
              <p className="text-blue-100 text-sm">GPT-5 analyzed {aiSuggestions.length} gigs perfect for you</p>
            </div>
          </div>

          {aiSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiSuggestions.slice(0, 2).map((suggestion, idx) => (
                <div key={idx} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-yellow-300" />
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        suggestion.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'
                      }`}>
                        {suggestion.priority?.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium mb-2">Gig ID: {suggestion.gig_id}</p>
                  <p className="text-blue-100 text-sm">{suggestion.reason}</p>
                  <button className="mt-3 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-all w-full">
                    View Gig Details →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white/10 backdrop-blur-sm rounded-xl text-center">
              <Brain className="w-12 h-12 text-blue-200 mx-auto mb-3" />
              <p className="text-blue-100">Enable "Available Now" to receive AI-powered gig recommendations</p>
            </div>
          )}
        </div>

        {/* INNOVATION 7: Gig Forecasting Widget */}
        {forecast && (
          <div className="mb-8 p-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">📊 AI Demand Forecast</h2>
                <p className="text-teal-100 text-sm">Next 24 hours in {user.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-bold text-lg">Demand Level</span>
                </div>
                <p className={`text-3xl font-black ${
                  forecast.demand_level === 'high' || forecast.demand_level === 'very_high'
                    ? 'text-yellow-300'
                    : 'text-white'
                }`}>
                  {forecast.demand_level?.toUpperCase() || 'MEDIUM'}
                </p>
                <p className="text-xs text-teal-100 mt-1">Confidence: {Math.round((forecast.confidence || 0.75) * 100)}%</p>
              </div>

              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-bold text-lg">Recommended Rate</span>
                </div>
                <p className="text-2xl font-black">{forecast.recommended_rate || '$80-120/hr'}</p>
                <p className="text-xs text-teal-100 mt-1">Based on market conditions</p>
              </div>

              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-bold text-lg">Best Time Slots</span>
                </div>
                <div className="space-y-1">
                  {(forecast.best_time_slots || ['8am-12pm', '1pm-5pm']).map((slot, idx) => (
                    <div key={idx} className="text-sm bg-white/10 rounded px-2 py-1">
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {forecast.factors && forecast.factors.length > 0 && (
              <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Key Factors:
                </p>
                <ul className="space-y-1">
                  {forecast.factors.map((factor, idx) => (
                    <li key={idx} className="text-sm text-teal-100">• {factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* INNOVATION 2: Gig Gamification - Achievements */}
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-500" />
                Your Achievements
              </h2>
              <span className="text-sm text-muted-foreground">{achievements.length} earned</span>
            </div>

            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md text-white">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{achievement.title}</h3>
                        <p className="text-purple-100 text-xs">{achievement.description}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <Target className="w-3 h-3" />
                          <span>{achievement.progress}/{achievement.target} completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full py-2 text-center text-primary font-semibold hover:bg-gray-50 rounded-lg transition-all">
                  View All Achievements →
                </button>
              </div>
            ) : (
              <div className="p-8 bg-gray-50 rounded-xl text-center">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">No achievements yet</p>
                <p className="text-sm text-gray-500">Complete gigs to unlock badges and bonuses!</p>
              </div>
            )}
          </div>

          {/* INNOVATION 5: Gig Squad - Team Assembly */}
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                Gig Squads Available
              </h2>
              <span className="text-sm text-muted-foreground">{availableSquads.length} teams</span>
            </div>

            {availableSquads.length > 0 ? (
              <div className="space-y-3">
                {availableSquads.slice(0, 2).map((squad) => (
                  <div key={squad.squad_id} className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-foreground">Squad ID: {squad.squad_id.substring(0, 8)}</h3>
                        <p className="text-xs text-muted-foreground">Gig: {squad.gig_id}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        {squad.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Roles Needed:</p>
                      <div className="flex flex-wrap gap-1">
                        {squad.required_roles?.map((role, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {role.role} ({role.count})
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => joinSquad(squad.squad_id, squad.required_roles?.[0]?.role || 'worker')}
                      className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all text-sm"
                    >
                      Apply to Join Squad
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-gray-50 rounded-xl text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">No squads recruiting</p>
                <p className="text-sm text-gray-500">Team gigs will appear here when available</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* INNOVATION 6: Corporate Gig Pass */}
          <div className="p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">👑 Corporate Gig Pass</h2>
                <p className="text-yellow-100 text-sm">Premium subscription benefits</p>
              </div>
            </div>

            {corporatePass ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{corporatePass.plan_type}</span>
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-yellow-100">Credits Remaining</p>
                      <p className="text-2xl font-black">{corporatePass.credits_remaining}/{corporatePass.credits_per_month}</p>
                    </div>
                    <div>
                      <p className="text-xs text-yellow-100">Priority Access</p>
                      <p className="text-2xl font-black">{corporatePass.priority_access ? '✓' : '✗'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <p className="text-sm font-semibold mb-2">🎁 Benefits:</p>
                  <ul className="space-y-1 text-sm text-yellow-100">
                    <li>• Priority job matching</li>
                    <li>• Exclusive corporate gigs</li>
                    <li>• Higher pay rates</li>
                    <li>• Guaranteed hours</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white/10 backdrop-blur-sm rounded-xl text-center">
                <Crown className="w-12 h-12 text-yellow-200 mx-auto mb-3" />
                <p className="mb-3">Unlock premium corporate gigs</p>
                <button className="px-6 py-2 bg-white text-orange-600 rounded-lg font-bold hover:bg-yellow-50 transition-all">
                  Upgrade to Corporate Pass
                </button>
              </div>
            )}
          </div>

          {/* INNOVATION 8: Gig Insurance */}
          <div className="p-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">🛡️ Gig Insurance</h2>
                <p className="text-green-100 text-sm">Protection for your work</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <p className="font-bold mb-2">Coverage Options:</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                    <span className="text-sm">Quality Guarantee</span>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                    <span className="text-sm">Payment Protection</span>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <p className="text-sm font-semibold mb-2">🔒 What's Covered:</p>
                <ul className="space-y-1 text-sm text-green-100">
                  <li>• Dispute resolution support</li>
                  <li>• Payment guarantee (up to $500)</li>
                  <li>• 24-hour claim window</li>
                  <li>• Free for all gigs over $100</li>
                </ul>
              </div>

              <button 
                onClick={() => activateGigInsurance('demo-gig-123')}
                className="w-full py-3 bg-white text-green-600 rounded-xl font-bold hover:bg-green-50 transition-all"
              >
                Activate for Next Gig
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => window.location.href = '/gigs-near-me'}
            className="p-8 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg hover:shadow-2xl transition-all group text-left"
          >
            <Zap className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-white mb-2">Find Gigs</h3>
            <p className="text-white/80">Browse emergency gigs near you</p>
          </button>

          <button 
            onClick={() => window.location.href = '/opportunities'}
            className="p-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all group text-left"
          >
            <Target className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-white mb-2">Browse Projects</h3>
            <p className="text-white/80">Find longer-term opportunities</p>
          </button>

          <button 
            onClick={() => window.location.href = '/projects/new'}
            className="p-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg hover:shadow-2xl transition-all group text-left"
          >
            <Briefcase className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-white mb-2">Post a Gig</h3>
            <p className="text-white/80">Hire workers for your project</p>
          </button>
        </div>
      </div>
    </div>
  );
}
