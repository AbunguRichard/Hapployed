import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, Target, Shield, ArrowRight, CheckCircle, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function QuickHireInfoPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get qualified candidates in minutes, not days'
    },
    {
      icon: Target,
      title: 'Pre-Vetted Talent',
      description: 'All workers are verified with ratings and reviews'
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: 'Gig insurance protects your investment'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Find help anytime, day or night'
    }
  ];

  const useCases = [
    {
      scenario: 'Office Emergency',
      examples: 'HVAC failure, plumbing issues, electrical problems'
    },
    {
      scenario: 'Event Staffing',
      examples: 'Last-minute catering, setup crew, parking attendants'
    },
    {
      scenario: 'Business Operations',
      examples: 'Urgent deliveries, equipment repairs, cleaning services'
    },
    {
      scenario: 'Tech Support',
      examples: 'Network issues, software problems, IT emergencies'
    },
    {
      scenario: 'Construction',
      examples: 'Extra labor, specialized skills, equipment operators'
    },
    {
      scenario: 'Hospitality',
      examples: 'Short-staffed shifts, event support, maintenance'
    }
  ];

  const benefits = [
    'No long-term contracts or commitments',
    'Pay only for completed work',
    'Access to skilled, available workers instantly',
    'Real-time notifications and updates',
    'Flexible payment options',
    'Corporate pass for frequent hiring needs'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0yMCA0MGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-6">
                <Zap className="w-4 h-4" />
                INSTANT HIRING
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                QuickHire
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Fast hiring for urgent business needs. Find skilled workers instantly when you need them most - think "Uber for business staffing".
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/post-project')}
                  className="btn-primary text-lg flex items-center gap-2"
                >
                  Post Quick Gig
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/auth/signup')}
                  className="px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all font-semibold"
                >
                  Get Started
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1606248896999-387b3a9f621c"
                alt="Fast hiring platform"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Avg 8 min</div>
                    <div className="text-sm text-muted-foreground">To first response</div>
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
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Businesses Choose QuickHire</h2>
            <p className="text-xl text-muted-foreground">The fastest way to solve staffing emergencies</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
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

      {/* Use Cases Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Perfect For Any Business Need</h2>
            <p className="text-xl text-muted-foreground">From emergencies to planned events</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer border border-border group"
              >
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {useCase.scenario}
                </h3>
                <p className="text-muted-foreground">{useCase.examples}</p>
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
                src="https://images.unsplash.com/photo-1618544976420-1f213fcf2052"
                alt="Business team"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Built for Modern Businesses</h2>
              <p className="text-lg text-muted-foreground mb-8">
                QuickHire gives you the flexibility to scale your workforce up or down based on real-time needs.
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
            <p className="text-xl text-muted-foreground">Get help in 3 simple steps</p>
          </div>
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Post Your Need',
                description: 'Describe the work, set the pay, and indicate urgency level'
              },
              {
                step: '2',
                title: 'Review Applicants',
                description: 'Get instant notifications as qualified workers apply'
              },
              {
                step: '3',
                title: 'Hire & Complete',
                description: 'Select the best fit, complete the work, and pay upon satisfaction'
              }
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
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

      {/* Corporate Pass Teaser */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-border">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-foreground mb-4">Need to Hire Frequently?</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Get a Corporate Gig Pass for priority access, bulk credits, and special rates. Perfect for businesses with ongoing staffing needs.
                </p>
                <button
                  onClick={() => navigate('/auth/signup')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  Learn About Corporate Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Need Help Now?</h2>
          <p className="text-xl mb-8 opacity-90">
            Post your urgent need and get matched with qualified workers in minutes
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            Post Your First QuickHire Gig
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
