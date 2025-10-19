import React, { useState, useEffect } from 'react';
import { 
  Zap, MapPin, Award, TrendingUp, Users, Shield, Clock, Star,
  Target, Gift, Crown, Flame, CheckCircle
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
  const [stats, setStats] = useState({
    gigsCompleted: 0,
    rating: 0,
    earnings: 0
  });

  const user = { id: 'test-user', name: 'John Doe' }; // Replace with actual auth

  useEffect(() => {
    fetchWorkerData();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to make money today?
          </p>
        </div>

        {/* Available Now Toggle - HERO FEATURE */}
        <div className="mb-8 p-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl text-white">
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
              {/* Radius Selector */}
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

              {/* Status Message */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-600">Gigs Completed</h3>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-4xl font-black text-foreground">{stats.gigsCompleted}</p>
            <p className="text-sm text-green-600 mt-2">+3 this week</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-600">Average Rating</h3>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-4xl font-black text-foreground">{stats.rating || '5.0'}</p>
            <p className="text-sm text-muted-foreground mt-2">From 12 reviews</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-600">Total Earnings</h3>
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-4xl font-black text-foreground">${stats.earnings}</p>
            <p className="text-sm text-blue-600 mt-2">+$450 this week</p>
          </div>
        </div>

        {/* Gig Chain Bonus Alert */}
        {chainBonus && (
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl text-white animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Flame className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">🔥 Gig Chain Active!</h3>
                <p className="text-orange-100">
                  You have priority access to nearby gigs for the next 4 hours! Apply now for 1.5x bonus.
                </p>
              </div>
              <button className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all">
                View Priority Gigs
              </button>
            </div>
          </div>
        )}

        {/* Achievements Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-500" />
              Your Achievements
            </h2>
            <span className="text-sm text-muted-foreground">{achievements.length} earned</span>
          </div>

          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg text-white">
                  <div className="text-5xl mb-3">{achievement.icon}</div>
                  <h3 className="text-xl font-bold mb-1">{achievement.title}</h3>
                  <p className="text-purple-100 text-sm mb-3">{achievement.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Target className="w-4 h-4" />
                    <span>{achievement.progress}/{achievement.target} completed</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-gray-100 rounded-2xl text-center">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">No achievements yet</p>
              <p className="text-sm text-gray-500">Complete gigs to unlock badges and bonuses!</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => window.location.href = '/gigs-near-me'}
            className="p-8 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg hover:shadow-2xl transition-all group text-left"
          >
            <Zap className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-white mb-2">Find Gigs</h3>
            <p className="text-white/80">Browse available gigs near you</p>
          </button>

          <button 
            onClick={() => window.location.href = '/opportunities'}
            className="p-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all group text-left"
          >
            <Target className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-white mb-2">Browse Projects</h3>
            <p className="text-white/80">Find longer-term opportunities</p>
          </button>
        </div>
      </div>
    </div>
  );
}
