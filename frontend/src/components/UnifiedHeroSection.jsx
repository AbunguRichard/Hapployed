import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UnifiedHeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const heroButtons = [
    {
      id: 'gigs-near-me',
      title: 'Gigs Near Me',
      description: '🚨 Find emergency work opportunities in your area',
      icon: MapPin,
      gradient: 'from-red-500 to-orange-500',
      path: '/gigs-near-me-info',
      badge: 'URGENT',
      badgeColor: 'bg-red-600'
    },
    {
      id: 'current-projects',
      title: 'Current Projects',
      description: '📅 Browse professional project-based opportunities',
      icon: Briefcase,
      gradient: 'from-blue-500 to-cyan-500',
      path: '/current-projects-info',
      badge: 'FLEXIBLE',
      badgeColor: 'bg-blue-600'
    },
    {
      id: 'quickhire',
      title: 'QuickHire',
      description: '⚡ Fast hiring for urgent business needs',
      icon: Zap,
      gradient: 'from-purple-500 to-pink-500',
      path: '/quickhire-info',
      badge: 'FAST',
      badgeColor: 'bg-purple-600'
    }
  ];

  return (
    <section className="relative min-h-[600px] flex items-center justify-center py-20 px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-purple-500/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0yMCA0MGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Hero Text */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            Your Unified {isAuthenticated ? 'Command' : 'Work'} Center
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            {isAuthenticated 
              ? 'Manage everything from one place - emergency gigs, professional projects, and instant hiring'
              : 'Connect with opportunities that match your skills, schedule, and location'
            }
          </p>
        </div>

        {/* Three Descriptive Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {heroButtons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.id}
                onClick={() => navigate(button.path)}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border text-left"
              >
                {/* Badge */}
                <div className={`absolute top-4 right-4 ${button.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {button.badge}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${button.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {button.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {button.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-6 flex items-center text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">Ready to get started?</p>
            <button
              onClick={() => navigate('/auth/signup')}
              className="btn-primary text-lg px-8 py-4"
            >
              Join Hapployed Today
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
