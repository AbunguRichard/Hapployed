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
  }, []);

  const mockOpportunities = [
    {
      id: 1,
      title: 'React Developer Needed',
      company: 'Tech Startup Inc.',
      location: 'Remote',
      type: 'Contract',
      pay: '$50-80/hr',
      description: 'Looking for an experienced React developer for a 3-month project.',
      matchScore: 95,
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      company: 'Creative Agency',
      location: 'San Francisco, CA',
      type: 'Full-time',
      pay: '$70k-90k/year',
      description: 'Join our creative team to design beautiful user experiences.',
      matchScore: 88,
    },
    {
      id: 3,
      title: 'Emergency Plumbing Help',
      company: 'HomeServices Pro',
      location: 'New York, NY',
      type: 'Emergency Gig',
      pay: '$100/job',
      description: 'Urgent: Pipe burst, need immediate assistance.',
      matchScore: 75,
    },
  ];

  const handleApply = (gigId) => {
    toast.success('Application sent successfully!', {
      description: 'We\'ll notify you when the client responds.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Overlay */}
      {showOnboarding && (
        <WelcomeOverlay 
          user={user} 
          onClose={() => setShowOnboarding(false)} 
        />
      )}

      <DashboardNav />

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="card mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-2">
                🎉 You're all set, {user?.fullName?.split(' ')[0] || 'there'}!
              </h2>
              <p className="text-muted-foreground mb-4">
                We found {mockOpportunities.length} opportunities matching your skills: <span className="font-semibold text-foreground">{user?.skills?.join(', ') || 'your skills'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.map((skill, index) => (
                  <span key={index} className="badge badge-purple">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Recommended for You</h3>
            <span className="text-sm text-muted-foreground">{mockOpportunities.length} opportunities</span>
          </div>
          
          {mockOpportunities.map(opp => (
            <div key={opp.id} className="card hover-lift group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {opp.title}
                    </h4>
                    {opp.matchScore >= 90 && (
                      <span className="badge badge-green flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {opp.matchScore}% Match
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {opp.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {opp.location}
                    </span>
                  </div>
                </div>
                <span className="badge badge-purple">{opp.type}</span>
              </div>
              
              <p className="text-foreground mb-4">{opp.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">{opp.pay}</span>
                <button 
                  onClick={() => handleApply(opp.id)}
                  className="btn-primary"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="btn-secondary">
            Load More Opportunities
          </button>
        </div>
      </main>
    </div>
  );
}