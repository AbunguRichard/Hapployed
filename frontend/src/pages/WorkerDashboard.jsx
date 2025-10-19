import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, MapPin, Award, TrendingUp, Users, Shield, Clock, Star,
  Target, Gift, Crown, Flame, CheckCircle, Brain, Calendar,
  DollarSign, ChevronRight, AlertCircle, Briefcase, TrendingDown,
  CloudRain, Sun, Wind, Package, Bell, Sparkles, Activity, Radio
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardNav from '../components/DashboardNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

// Card component with glassmorphic design
const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

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
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [stats, setStats] = useState({
    gigsCompleted: 12,
    rating: 4.9,
    earnings: 2450,
    points: 1250,
    active: 4,
    completed: 21,
    trust: 82
  });

  const user = { id: 'test-user', name: 'John Doe', location: 'San Francisco, CA' };

  // Spotlight data for auto-rotating talent/gig suggestions
  const spotlight = useMemo(() => [
    { name: 'Kitchen Remodel Project', role: 'Premium Gig', score: 95 },
    { name: 'Emergency Plumbing Squad', role: 'Team Opportunity', score: 88 },
    { name: 'Corporate Pass Available', role: 'Subscription Offer', score: 92 }
  ], []);

  // Notifications data
  const notifications = useMemo(() => [
    { id: 1, icon: Sparkles, text: "You've been shortlisted for 'Logo Revamp'" },
    { id: 2, icon: Zap, text: '3 new QuickHire requests within 5 mi' },
    { id: 3, icon: DollarSign, text: 'Client paid invoice #1043 — $420' }
  ], []);

  // Auto-rotate spotlight every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % spotlight.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [spotlight.length]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* DEBUG MARKER - REMOVE AFTER VERIFICATION */}
      <div className="bg-green-500 text-white text-center py-2 font-bold">
        ✅ NEW FUTURISTIC DASHBOARD LOADED - Version 2.0
      </div>
      <DashboardNav />
      
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Left Column (2/3 width) */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Welcome Section with AI Orb */}
            <Card className="relative overflow-hidden p-8">
              <div className="absolute right-8 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 opacity-80 blur-3xl"></div>
              
              <div className="relative z-10">
                <h1 className="text-4xl font-bold text-white">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">{user.name}</span> 👋
                </h1>
                <p className="mt-2 text-lg text-white/70">
                  Your AI radar located 3 fresh opportunities tailored to you today.
                </p>
                
                <div className="mt-6 flex flex-wrap gap-3">
                  <button 
                    onClick={toggleAvailability}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
                  >
                    <Radio className={`h-4 w-4 ${availableNow ? 'text-green-400 animate-pulse' : 'text-white/60'}`} />
                    {availableNow ? 'Live Radar' : 'Go Live'}
                  </button>
                  <button className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all">
                    <Activity className="h-4 w-4" />
                    Growth Pulse
                  </button>
                  <button className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all">
                    <Bell className="h-4 w-4" />
                    Smart Alerts
                  </button>
                </div>
              </div>
            </Card>

            {/* Available Now Toggle - Collapsible */}
            {availableNow && (
              <Card className="p-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-400" />
                  You're Live & Available
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Work Radius: {radius} miles
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={radius}
                      onChange={(e) => updateRadius(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                    <div className="flex justify-between text-xs mt-1 text-white/50">
                      <span>1 mi</span>
                      <span>25 mi</span>
                      <span>50 mi</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Status Message (Optional)</label>
                    <input
                      type="text"
                      value={statusMessage}
                      onChange={(e) => setStatusMessage(e.target.value)}
                      placeholder="e.g., Heading to downtown for 2 hours"
                      className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 placeholder-white/40 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* AI Smart Suggestions */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Smart Suggestions</h3>
                <button className="text-sm text-white/60 hover:text-white transition-colors">Refresh</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiSuggestions.length > 0 ? (
                  aiSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <Card key={idx} className="p-4 hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-start gap-2 mb-2">
                        <Target className="h-5 w-5 text-violet-400 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-sm font-semibold text-white">{suggestion.gig_id}</p>
                          <p className="text-xs text-white/60 mt-1">{suggestion.reason}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <>
                    <Card className="p-4 hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-start gap-2">
                        <Target className="h-5 w-5 text-violet-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white">3 nearby gigs match your skills</p>
                          <p className="text-xs text-white/60 mt-1">House repair • 2 miles • $45/hr</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-start gap-2">
                        <Briefcase className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white">Project invite: Hybrid QA Analyst</p>
                          <p className="text-xs text-white/60 mt-1">Remote + DC • $60/hr</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white">Demand up 14% for Electricians</p>
                          <p className="text-xs text-white/60 mt-1">Boost profile for priority rank</p>
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </div>

            {/* Gig Chain Bonus Alert */}
            {chainBonus && (
              <Card className="p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 animate-pulse-subtle">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">🔥 Gig Chain Active!</h3>
                    <p className="text-white/80 text-sm">
                      You have priority access to nearby gigs for the next 4 hours! Apply now for <strong>1.5x bonus pay</strong>.
                    </p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/gigs-near-me'}
                    className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all flex-shrink-0"
                  >
                    View Gigs
                  </button>
                </div>
              </Card>
            )}

            {/* Gigs Heat Map */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  Gigs Heat Map
                </h3>
                <button className="flex items-center gap-1 text-sm text-white/60 hover:text-white">
                  <Radio className="h-4 w-4" />
                  Voice Mode
                </button>
              </div>
              
              <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 via-teal-900/30 to-cyan-900/30 backdrop-blur-sm flex items-center justify-center">
                <p className="text-white/60 text-sm">Heatmap preview</p>
              </div>
              
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-white/60 mb-1">Radius: {radius} mi</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Say or type: show electrician gigs near me"
                    className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 placeholder-white/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button className="px-6 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all">
                  Search
                </button>
              </div>
            </Card>

            {/* Gig Squad & Corporate Pass */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gig Squad */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Gig Squads
                </h3>
                
                {availableSquads.length > 0 ? (
                  <div className="space-y-3">
                    {availableSquads.slice(0, 2).map((squad) => (
                      <div key={squad.squad_id} className="p-3 border border-white/10 rounded-xl hover:border-blue-500/50 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-white">Squad #{squad.squad_id.substring(0, 8)}</p>
                            <p className="text-xs text-white/50">Gig: {squad.gig_id}</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                            {squad.status}
                          </span>
                        </div>
                        <button 
                          onClick={() => joinSquad(squad.squad_id, squad.required_roles?.[0]?.role || 'worker')}
                          className="w-full py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-semibold hover:bg-blue-500/30 transition-all"
                        >
                          Apply to Join
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">No squads recruiting right now</p>
                )}
              </Card>

              {/* Corporate Pass */}
              <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  Corporate Pass
                </h3>
                
                {corporatePass ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-sm font-semibold text-white">{corporatePass.plan_type}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-white/60">Credits</p>
                          <p className="text-lg font-bold text-white">{corporatePass.credits_remaining}/{corporatePass.credits_per_month}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60">Priority</p>
                          <p className="text-lg font-bold text-white">{corporatePass.priority_access ? '✓' : '✗'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:brightness-110 transition-all">
                    Upgrade to Premium
                  </button>
                )}
              </Card>
            </div>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-6">
            
            {/* Role Quick Actions */}
            <Card className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Role</h3>
                <button className="text-white/60 hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 mb-4">
                Talent
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => window.location.href = '/opportunities'}
                  className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-left hover:brightness-110 transition-all"
                >
                  <Briefcase className="h-5 w-5 mb-1" />
                  <p className="text-sm font-semibold">Projects</p>
                  <p className="text-xs text-white/70">Browse hybrid & remote</p>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/gigs-near-me'}
                  className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-left hover:brightness-110 transition-all"
                >
                  <Flame className="h-5 w-5 mb-1" />
                  <p className="text-sm font-semibold">Emergency</p>
                  <p className="text-xs text-white/70">QuickHire near you</p>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/gigs-near-me'}
                  className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-left hover:brightness-110 transition-all"
                >
                  <MapPin className="h-5 w-5 mb-1" />
                  <p className="text-sm font-semibold">Gigs Near Me</p>
                  <p className="text-xs text-white/70">Explore local jobs</p>
                </button>
              </div>
            </Card>

            {/* Earnings Pulse */}
            <Card className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Earnings Pulse</h3>
                <span className="text-sm text-emerald-400 font-semibold">+$510 this week</span>
              </div>
              
              <div className="relative h-32 mb-4">
                <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="earningsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,80 L 50,60 L 100,70 L 150,40 L 200,50 L 250,30 L 300,20"
                    fill="none"
                    stroke="url(#earningsGradient)"
                    strokeWidth="3"
                  />
                  <path
                    d="M 0,80 L 50,60 L 100,70 L 150,40 L 200,50 L 250,30 L 300,20 L 300,100 L 0,100 Z"
                    fill="url(#earningsGradient)"
                    opacity="0.1"
                  />
                </svg>
                <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-white/50">
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Active</p>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-white">{stats.completed}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Trust</p>
                  <p className="text-2xl font-bold text-white">{stats.trust}%</p>
                </div>
              </div>
            </Card>

            {/* Talent Spotlight (Auto-rotating) */}
            <Card className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Talent Spotlight</h3>
                <span className="text-xs text-white/60">Auto-rotating</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">Suggested for you:</p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-white">{spotlight[spotlightIndex].name}</p>
                    <p className="text-sm text-white/70">{spotlight[spotlightIndex].role}</p>
                  </div>
                  <span className="rounded-full bg-violet-500/20 px-3 py-1 text-sm font-semibold text-violet-300">
                    {spotlight[spotlightIndex].score}% match
                  </span>
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <button className="text-xs text-white/60 hover:text-white transition-colors">Mark all read</button>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition-all">
                      <Icon className="h-4 w-4 text-violet-300 flex-shrink-0" />
                      <p className="text-sm text-white">{n.text}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Weekly Goal */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white">Weekly Goal</h3>
              <p className="mt-1 text-sm text-white/70">You're 80% toward your target of 10 tasks.</p>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[80%] bg-gradient-to-r from-violet-500 to-emerald-400 animate-pulse-slow"></div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:brightness-110 transition-all">
                  Boost Profile
                </button>
                <button className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 transition-all">
                  Learn Skill
                </button>
              </div>
            </Card>

            {/* Gig Insurance */}
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                Gig Insurance
              </h3>
              
              <div className="space-y-3">
                <div className="text-sm text-white/70">
                  <p className="mb-2">🛡️ Protection coverage:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Quality guarantee (24hr claim)</li>
                    <li>• Payment protection (up to $500)</li>
                    <li>• Dispute resolution support</li>
                  </ul>
                </div>
                
                <button 
                  onClick={() => activateGigInsurance('demo-gig-123')}
                  className="w-full py-2 bg-green-500/20 text-green-300 rounded-xl text-sm font-semibold hover:bg-green-500/30 transition-all"
                >
                  Activate for Next Gig
                </button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 pb-10 text-center text-xs text-white/50">
        Made with <span className="text-fuchsia-300">AI</span> • © Hapployed
      </footer>
    </div>
  );
}
