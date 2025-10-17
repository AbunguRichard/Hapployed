import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Zap, MapPin, Brain, Sparkles, 
  ChevronRight, TrendingUp, Award
} from 'lucide-react';
import DashboardNav from '../components/DashboardNav';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'Projects',
      description: 'Find remote & hybrid contracts',
      icon: Briefcase,
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      link: '/opportunities',
      action: 'Browse Projects',
    },
    {
      title: 'Emergency',
      description: 'QuickHire and urgent needs near you',
      icon: Zap,
      gradient: 'from-orange-500 to-red-600',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600',
      link: '/gigs-near-me?filter=emergency',
      action: 'View Requests',
    },
    {
      title: 'Gigs Near Me',
      description: 'Explore short jobs within your area',
      icon: MapPin,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-purple-200">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`}
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Welcome back, <span className="gradient-text">{user?.fullName?.split(' ')[0] || 'User'}!</span>
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
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
                <div className="card hover-lift border-2 border-border hover:border-primary/30 transition-all duration-300">
                  {/* Badge */}
                  {card.badge && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {card.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${card.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold mb-2 ${card.iconColor}`}>
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-6">{card.description}</p>

                  {/* Action Button */}
                  <button className={`w-full px-4 py-3 bg-gradient-to-r ${card.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all`}>
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
          <div className="card border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <span>🧠</span> Behavioral Archetype
                </h3>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold gradient-text">
                    Meticulous Planner
                  </h2>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4">Learn how to improve</p>

            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
                planner
              </span>
              <p className="text-muted-foreground text-sm">
                AI recommends trending skill: <span className="text-foreground font-semibold">project management</span>
              </p>
            </div>
          </div>

          {/* Oracle Insights */}
          <div className="card border-2 border-accent/30 bg-gradient-to-br from-emerald-50 to-white">
            <h3 className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Oracle Insights
            </h3>
            <p className="text-muted-foreground text-xs mb-6">AI opportunity predictions</p>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Trust Score</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-6xl font-bold gradient-text">
                  50<span className="text-3xl">%</span>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-accent/30 flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-accent" />
                </div>
              </div>
              <p className="text-muted-foreground text-xs mt-2">2 verified skills</p>
            </div>
          </div>
        </div>

        {/* Live Opportunity Feed */}
        <div className="card border-2 border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-foreground">Your Live Opportunity Feed</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort by:</span>
              <select className="px-4 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
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
                className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-border hover:border-primary rounded-2xl p-6 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {opp.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{opp.company}</span>
                      <span>•</span>
                      <span>{opp.type}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-accent">{opp.pay}</span>
                      <span className="text-sm text-muted-foreground">{opp.distance} away</span>
                    </div>
                  </div>
                  {opp.matchScore && (
                    <div className="text-right">
                      <div className="text-3xl font-bold gradient-text">
                        {opp.matchScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">match</div>
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