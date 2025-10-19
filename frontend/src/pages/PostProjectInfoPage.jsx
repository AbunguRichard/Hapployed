import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Clock, DollarSign, ArrowRight, CheckCircle, Star, Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PostProjectInfoPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: 'Access Top Talent',
      description: 'Connect with 50,000+ verified professionals across all industries and skill levels'
    },
    {
      icon: Clock,
      title: 'Fast Hiring',
      description: 'Post in minutes and start receiving applications within hours'
    },
    {
      icon: DollarSign,
      title: 'Budget Friendly',
      description: 'Set your own rates and only pay for the work you need'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Protected payments, verified workers, and dispute resolution support'
    }
  ];

  const projectTypes = [
    {
      type: 'Regular Projects',
      description: 'Long-term professional work with clear milestones',
      timeline: '1 week - 6 months',
      ideal: 'Complex projects requiring specialized expertise'
    },
    {
      type: 'Emergency / QuickHire',
      description: 'Urgent same-day work when you need help immediately',
      timeline: 'Today - 48 hours',
      ideal: 'Urgent repairs, event staffing, immediate coverage'
    }
  ];

  const postingProcess = [
    'Describe your project or emergency need',
    'Set your budget and timeline',
    'Review applications from qualified workers',
    'Hire the perfect match',
    'Track progress and pay upon completion'
  ];

  const benefits = [
    'AI-powered matching connects you with ideal candidates',
    'View detailed profiles with ratings, reviews, and portfolios',
    'Built-in messaging for seamless communication',
    'Escrow payment protection for your peace of mind',
    'Get work quality guarantees and insurance options',
    'Access to both emergency workers and long-term professionals'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0yMCA0MGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-6">
                <Briefcase className="w-4 h-4" />
                FOR BUSINESSES & CLIENTS
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Post a Project
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Find the perfect talent for any job. From emergency same-day help to long-term professional projects - post once and get qualified applications fast.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/post-project')}
                  className="btn-primary text-lg flex items-center gap-2"
                >
                  Post Your Project
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/auth/signup')}
                  className="px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all font-semibold"
                >
                  Create Account
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1606248896999-387b3a9f621c"
                alt="Post a project"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">98% Success Rate</div>
                    <div className="text-sm text-muted-foreground">Projects completed on time</div>
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
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Post on Hapployed?</h2>
            <p className="text-xl text-muted-foreground">Everything you need to hire with confidence</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
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

      {/* Project Types Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Two Ways to Hire</h2>
            <p className="text-xl text-muted-foreground">Choose the posting type that fits your needs</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {projectTypes.map((project, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all border border-border"
              >
                <h3 className="text-2xl font-bold text-foreground mb-3">{project.type}</h3>
                <p className="text-muted-foreground mb-4">{project.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Timeline:</span> {project.timeline}
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold">Ideal for:</span> {project.ideal}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">From posting to completion in 5 easy steps</p>
          </div>
          <div className="space-y-6">
            {postingProcess.map((step, index) => (
              <div key={index} className="flex items-start gap-6 bg-background p-6 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xl text-foreground font-semibold">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Built for Your Success</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We've designed every feature to make hiring easier, faster, and more reliable.
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
            <div>
              <img
                src="https://images.unsplash.com/photo-1618544976420-1f213fcf2052"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground mb-8">
            No hidden fees. Pay only when you hire. Service fee of 5% on project value.
          </p>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-foreground mb-2">Free</div>
                <div className="text-muted-foreground">To post projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-2">5%</div>
                <div className="text-muted-foreground">Service fee on hire</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-2">24/7</div>
                <div className="text-muted-foreground">Support available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-500 to-purple-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Find Your Perfect Match?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses hiring quality talent on Hapployed
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            Post Your First Project - Free
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
