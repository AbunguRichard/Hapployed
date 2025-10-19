import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Target, Zap, Shield, ArrowRight, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function DiscoverOpportunitiesInfoPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Matching',
      description: 'Our intelligent algorithm analyzes your skills, experience, and preferences to surface the best opportunities'
    },
    {
      icon: Target,
      title: 'Personalized Feed',
      description: 'Get a curated list of opportunities tailored specifically to your profile and career goals'
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Be the first to know when new opportunities matching your criteria become available'
    },
    {
      icon: Shield,
      title: 'Verified Opportunities',
      description: 'All listings are verified to ensure legitimacy and protect you from scams'
    }
  ];

  const opportunityTypes = [
    {
      type: 'Professional Projects',
      description: 'Long-term contracts with established businesses',
      icon: '💼'
    },
    {
      type: 'Emergency Gigs',
      description: 'Urgent, same-day work with immediate pay',
      icon: '🚨'
    },
    {
      type: 'Part-Time Roles',
      description: 'Flexible positions that fit your schedule',
      icon: '⏰'
    },
    {
      type: 'Remote Work',
      description: 'Work from anywhere in the world',
      icon: '🌍'
    },
    {
      type: 'Freelance Projects',
      description: 'One-off projects with clear deliverables',
      icon: '✨'
    },
    {
      type: 'Contract Positions',
      description: 'Fixed-term roles with defined scope',
      icon: '📋'
    }
  ];

  const benefits = [
    'Access thousands of opportunities in one place',
    'Smart filters to narrow down by location, pay, skills, and more',
    'Save favorites and track application status',
    'Get AI-powered recommendations based on your activity',
    'Direct messaging with hiring managers',
    'Portfolio showcase to highlight your best work'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0yMCA0MGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                AI-POWERED DISCOVERY
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Discover Opportunities
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Your personalized gateway to thousands of work opportunities. Our AI analyzes your profile and surfaces the perfect matches - from emergency gigs to professional contracts.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/opportunities')}
                  className="btn-primary text-lg flex items-center gap-2"
                >
                  Start Discovering
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/auth/signup')}
                  className="px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all font-semibold"
                >
                  Create Profile
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1618544976420-1f213fcf2052"
                alt="Discover opportunities"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">5,000+ Opportunities</div>
                    <div className="text-sm text-muted-foreground">Updated daily</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Smart Discovery Features</h2>
            <p className="text-xl text-muted-foreground">Advanced tools to find your perfect opportunity</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Opportunity Types Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">All Types of Opportunities</h2>
            <p className="text-xl text-muted-foreground">Find exactly what you're looking for</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunityTypes.map((opportunity, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer border border-border group"
              >
                <div className="text-4xl mb-3">{opportunity.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {opportunity.type}
                </h3>
                <p className="text-muted-foreground">{opportunity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1580983553600-c49a1d083f54"
                alt="AI matching technology"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Everything You Need to Succeed</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our platform gives you all the tools and insights to find and land your next opportunity faster.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <span className="text-foreground text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Start discovering in 3 simple steps</p>
          </div>
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Complete Your Profile',
                description: 'Tell us about your skills, experience, and what you\'re looking for'
              },
              {
                step: '2',
                title: 'Get AI Recommendations',
                description: 'Our smart algorithm instantly surfaces opportunities that match your profile'
              },
              {
                step: '3',
                title: 'Apply & Connect',
                description: 'One-click apply to opportunities and message directly with hiring managers'
              }
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-lg text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-cyan-500 to-blue-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Discover Your Next Opportunity?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals finding their perfect match every day
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="bg-white text-cyan-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            Get Started - It's Free
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
