import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Star, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function GigsNearMeInfoPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Matching',
      description: 'Find gigs within your preferred radius - from 1 to 50 miles away'
    },
    {
      icon: Clock,
      title: 'Instant Availability',
      description: 'Get notified immediately when urgent gigs pop up in your area'
    },
    {
      icon: DollarSign,
      title: 'Quick Payments',
      description: 'Same-day payment for completed emergency gigs'
    },
    {
      icon: Star,
      title: 'Build Your Reputation',
      description: 'Earn ratings and unlock achievement badges as you complete gigs'
    }
  ];

  const gigCategories = [
    '🔧 Plumbing & Electrical',
    '🚚 Moving & Delivery',
    '🏠 Home Repairs',
    '🌳 Landscaping & Outdoor',
    '🧹 Cleaning Services',
    '🚗 Auto Services',
    '💻 Tech Support',
    '🎨 Creative Services'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0yMCA0MGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-6">
                <Zap className="w-4 h-4" />
                URGENT OPPORTUNITIES
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Gigs Near Me
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Find emergency work opportunities in your neighborhood. Perfect for skilled workers who want flexible, immediate income.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/gigs-near-me')}
                  className="btn-primary text-lg flex items-center gap-2"
                >
                  Browse Gigs
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
                src="https://images.unsplash.com/photo-1649769069590-268b0b994462"
                alt="Emergency service worker"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">127 Active Gigs</div>
                    <div className="text-sm text-muted-foreground">In your area</div>
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
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Gigs Near Me?</h2>
            <p className="text-xl text-muted-foreground">Everything you need to succeed in the gig economy</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
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

      {/* Categories Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Popular Gig Categories</h2>
            <p className="text-xl text-muted-foreground">Find work in your area of expertise</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gigCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 text-center font-semibold text-foreground hover:shadow-lg hover:scale-105 transition-all cursor-pointer border border-border"
              >
                {category}
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
            <p className="text-xl text-muted-foreground">Get started in just 3 simple steps</p>
          </div>
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                description: 'Tell us about your skills, location, and availability'
              },
              {
                step: '2',
                title: 'Browse & Apply',
                description: 'Find gigs that match your expertise and schedule'
              },
              {
                step: '3',
                title: 'Complete & Get Paid',
                description: 'Finish the work and receive same-day payment'
              }
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
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
      <section className="py-20 px-4 bg-gradient-to-br from-red-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of workers finding flexible gig opportunities every day
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            Sign Up Now - It's Free
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
