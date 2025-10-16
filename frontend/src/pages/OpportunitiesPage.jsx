import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, User, Mail } from 'lucide-react';

export default function OpportunitiesPage() {
  const { user } = useAuth();

  const mockOpportunities = [
    {
      id: 1,
      title: 'React Developer Needed',
      company: 'Tech Startup Inc.',
      location: 'Remote',
      type: 'Contract',
      pay: '$50-80/hr',
      description: 'Looking for an experienced React developer for a 3-month project.',
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      company: 'Creative Agency',
      location: 'San Francisco, CA',
      type: 'Full-time',
      pay: '$70k-90k/year',
      description: 'Join our creative team to design beautiful user experiences.',
    },
    {
      id: 3,
      title: 'Emergency Plumbing Help',
      company: 'HomeServices Pro',
      location: 'New York, NY',
      type: 'Emergency Gig',
      pay: '$100/job',
      description: 'Urgent: Pipe burst, need immediate assistance.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Discover Opportunities</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Welcome, {user?.fullName || 'User'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="card mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                🎉 Profile Complete!
              </h2>
              <p className="text-muted-foreground">
                You're all set! Browse opportunities tailored to your skills: {user?.skills?.join(', ') || 'your skills'}
              </p>
            </div>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-foreground">Recommended for You</h3>
          
          {mockOpportunities.map(opp => (
            <div key={opp.id} className="card hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-foreground mb-2">{opp.title}</h4>
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
                <button className="btn-primary">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}