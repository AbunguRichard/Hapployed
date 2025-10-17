import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, Sparkles, CheckCircle, Trophy, TrendingUp, DollarSign, Clock, Globe, Zap } from 'lucide-react';
import WelcomeOverlay from '../components/WelcomeOverlay';
import DashboardNav from '../components/DashboardNav';
import { toast } from 'sonner';
import OpportunityCard from '../components/OpportunityCard';

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Check if this is the first time after profile creation
    const shouldShowOnboarding = localStorage.getItem('showOnboarding') === 'true';
    const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
    
    if (shouldShowOnboarding && !onboardingCompleted) {
      // Small delay for smooth transition
      setTimeout(() => {
        setShowOnboarding(true);
        localStorage.removeItem('showOnboarding');
      }, 500);
    }

    // Trigger confetti after page load
    setTimeout(() => setShowConfetti(true), 300);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const mockOpportunities = [
    {
      id: 1,
      title: 'React Developer Needed',
      company: 'Tech Startup Inc.',
      location: 'Remote',
      type: 'Contract',
      category: 'tech',
      pay: '$50-80/hr',
      description: 'Looking for an experienced React developer for a 3-month project.',
      matchScore: 95,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Tech Startup Inc',
      verified: true,
      socialProof: '3 Hapployed users hired here',
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      company: 'Creative Agency',
      location: 'San Francisco, CA',
      type: 'Full-time',
      category: 'design',
      pay: '$70k-90k/year',
      description: 'Join our creative team to design beautiful user experiences.',
      matchScore: 88,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Creative Agency',
      verified: true,
      socialProof: '5 Hapployed users hired here',
    },
    {
      id: 3,
      title: 'Emergency Plumbing Help',
      company: 'HomeServices Pro',
      location: 'New York, NY',
      type: 'Emergency Gig',
      category: 'labor',
      pay: '$100/job',
      description: 'Urgent: Pipe burst, need immediate assistance.',
      matchScore: 75,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=HomeServices Pro',
      verified: false,
      socialProof: null,
    },
  ];

  const sortedOpportunities = [...mockOpportunities].sort((a, b) => {
    if (sortBy === 'match') return b.matchScore - a.matchScore;
    if (sortBy === 'pay') {
      const payA = parseInt(a.pay.replace(/[^0-9]/g, ''));
      const payB = parseInt(b.pay.replace(/[^0-9]/g, ''));
      return payB - payA;
    }
    return 0;
  });

  const handleApply = (gigId) => {
    toast.success('Application sent successfully!', {
      description: 'We\'ll notify you when the client responds.',
    });
  };

  const sortOptions = [
    { id: 'match', icon: Sparkles, label: 'Sort by Match %' },
    { id: 'pay', icon: DollarSign, label: 'Sort by Pay' },
    { id: 'time', icon: Clock, label: 'Short-term gigs first' },
    { id: 'remote', icon: Globe, label: 'Remote only' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Animated Background Gradient Blobs */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-br from-primary to-accent rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
      {/* Welcome Overlay */}
      {showOnboarding && (
        <WelcomeOverlay 
          user={user} 
          onClose={() => setShowOnboarding(false)} 
        />
      )}

      <DashboardNav />

      {/* Main Content */}
      <main className="relative container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Personalized Hero Banner */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent p-1 animate-pulse-slow">
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4">
            🎉 Hey {user?.fullName?.split(' ')[0] || 'there'}, your next big opportunity is waiting.
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            AI found <span className="font-bold text-foreground">{mockOpportunities.length} perfect matches</span> for your skills today.
          </p>

          {/* Skills Badge Section with Pulse Animation */}
          <div className="inline-flex items-start gap-4 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-primary/20 shadow-xl relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 relative z-10">
              <Sparkles className="w-6 h-6 text-primary animate-spin-slow" />
            </div>
            <div className="flex-1 text-left relative z-10">
              <p className="text-sm text-muted-foreground mb-2">
                We found {mockOpportunities.length} opportunities matching your skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {(user?.skills || ['React']).map((skill, index) => (
                  <span key={index} className="badge badge-purple animate-bounce-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Filter Shortcuts */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${
                  sortBy === option.id
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                    : 'bg-white/80 text-foreground hover:bg-white border border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-foreground">Recommended for You</h3>
          <span className="text-sm text-muted-foreground">{mockOpportunities.length} opportunities</span>
        </div>

        {/* Opportunities Grid */}
        <div className="space-y-8 max-w-5xl mx-auto">
          {sortedOpportunities.map((opp, index) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onApply={handleApply}
              index={index}
            />
          ))}
        </div>

        {/* Gamification Footer */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-orange-500" />
            <p className="text-lg font-bold text-foreground">
              🔥 You're in the top 10% of React developers near you!
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            💼 Apply to 2 more gigs to unlock 'Active Talent' badge.
          </p>
        </div>

        {/* End-of-Feed Message */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-border">
            <Zap className="w-6 h-6 text-primary animate-pulse" />
            <div>
              <p className="text-foreground font-medium">No more results? Our AI is finding new matches for you right now...</p>
              <div className="mt-2 h-1 w-48 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent animate-loading-bar" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}