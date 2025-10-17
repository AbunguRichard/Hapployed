import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Zap, MapPin, User, Brain, Sparkles, 
  ChevronRight, TrendingUp, Award, DollarSign, Clock
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'Projects',
      description: 'Find remote & hybrid contracts',
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      link: '/opportunities',
      action: 'Browse Projects',
    },
    {
      title: 'Emergency',
      description: 'QuickHire and urgent needs near you',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      link: '/gigs-near-me?filter=emergency',
      action: 'View Requests',
    },
    {
      title: 'Gigs Near Me',
      description: 'Explore short jobs within your area',
      icon: MapPin,
      color: 'from-teal-500 to-teal-600',
      textColor: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      badge: '3',
      link: '/gigs-near-me',
      action: 'Find Local Gigs',
    },
  ];

  const opportunities = [
    {
      id: 1,
      title: 'React Developer',
      company: 'Tech Startup',
      type: 'Remote possible',
      pay: '$75/hr',
      distance: '5.2 mi',
      matchScore: 92,
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      company: 'Creative Agency',
      type: 'Full-time',
      pay: '$70k/year',
      distance: '3.1 mi',
      matchScore: 88,
    },
    {
      id: 3,
      title: 'Emergency Plumbing',
      company: 'HomeServices',
      type: 'URGENT',
      pay: '$50/hr',
      distance: '0.5 mi',
      matchScore: 95,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Nav */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <button onClick={() => navigate('/dashboard')} className="text-white font-medium">
                  Home
                </button>
                <button onClick={() => navigate('/dashboard')} className="text-purple-400 font-medium">
                  Dashboard
                </button>
                <button onClick={() => navigate('/opportunities')} className="text-slate-400 hover:text-white transition-colors">
                  Opportunities
                </button>
              </nav>
            </div>

            {/* User Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser" 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser" 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{user?.fullName?.split(' ')[0] || 'User'}!</span>
              </h1>
              <p className="text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Your AI-powered opportunity radar is live
              </p>
            </div>
          </div>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(card.link)}
                className="relative group cursor-pointer"
              >
                <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                  {/* Badge */}
                  {card.badge && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {card.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${card.textColor}`}>
                    <Icon className="w-5 h-5" />
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-sm mb-4">{card.description}</p>

                  {/* Action Button */}
                  <button className={`w-full px-4 py-3 ${card.bgColor} ${card.textColor} rounded-lg font-semibold hover:opacity-80 transition-all`}>
                    {card.action}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Behavioral Archetype */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                  <span>🧠</span> Behavioral Archetype
                </h3>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Meticulous Planner
                  </h2>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-4">Learn how to improve</p>

            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-semibold">
                planner
              </span>
              <p className="text-slate-400 text-sm">
                AI recommends trending skill: <span className="text-white font-semibold">project management</span>
              </p>
            </div>
          </div>

          {/* Oracle Insights */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm text-slate-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Oracle Insights
            </h3>
            <p className="text-slate-400 text-xs mb-6">AI opportunity predictions</p>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">1 Trust Score</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  50 <span className="text-2xl">%</span>
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-2">2 verified skills</p>
            </div>
          </div>
        </div>

        {/* Live Opportunity Feed */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Live Opportunity Feed</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Sort by:</span>
              <select className="bg-slate-700/50 text-white px-3 py-1 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Nearest</option>
                <option>Highest Pay</option>
                <option>Best Match</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                onClick={() => navigate('/gigs-near-me')}
                className="bg-slate-700/30 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {opp.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                      <span>{opp.company}</span>
                      <span>•</span>
                      <span>{opp.type}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-teal-400">{opp.pay}</span>
                      <span className="text-sm text-slate-400">{opp.distance} away</span>
                    </div>
                  </div>
                  {opp.matchScore && (
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {opp.matchScore}%
                      </div>
                      <div className="text-xs text-slate-400">match</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}