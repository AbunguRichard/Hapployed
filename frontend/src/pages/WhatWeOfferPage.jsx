import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Zap, MapPin, CheckCircle2, Users, Clock, Award, Shield, Sparkles, TrendingUp } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_visual-evolution/artifacts/l0gczbs1_background_AI-removebg-preview%20%281%29.png';

export default function WhatWeOfferPage() {
  const navigate = useNavigate();

  const services = [
    {
      icon: Briefcase,
      title: 'Projects',
      subtitle: 'Remote & Hybrid Opportunities',
      description: 'Find meaningful work with flexible arrangements. Whether you\'re looking for full-time contracts, part-time engagements, or project-based work, we connect you with opportunities that match your skills and schedule.',
      features: [
        'AI-powered skill matching',
        'Milestone-based payments',
        'Secure escrow protection',
        'Portfolio building opportunities',
        'Client reviews & ratings',
        'Contract templates included',
      ],
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
    },
    {
      icon: Zap,
      title: 'Emergency / QuickHire',
      subtitle: 'Immediate Help When You Need It',
      description: 'Life doesn\'t wait, and neither do we. Get instant access to verified professionals for urgent tasks. From emergency repairs to last-minute help, our QuickHire system connects you with available talent in minutes.',
      features: [
        'One-tap SOS request',
        'Real-time availability tracking',
        'Live ETA updates',
        'Safety verification checks',
        'Emergency pricing transparency',
        'Instant chat with workers',
      ],
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    },
    {
      icon: MapPin,
      title: 'Gigs Near Me',
      subtitle: 'Local Opportunities in Your Area',
      description: 'Discover work opportunities right in your neighborhood. Our location-based matching ensures you find gigs close to home, saving time and transportation costs while supporting your local community.',
      features: [
        'Radius-based job filtering',
        'Same-day start available',
        'Verified local businesses',
        'Community reputation system',
        'Map view for easy navigation',
        'Multiple gigs per day',
      ],
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      image: 'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800&q=80',
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Trust & Safety First',
      description: 'All users verified. Secure payments. Client reviews. Background checks available.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Matching',
      description: 'Smart recommendations based on your skills, location, and work preferences.',
    },
    {
      icon: Users,
      title: '50k+ Happy Workers',
      description: 'Join thousands of professionals already earning through Hapployed.',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Career',
      description: 'Build your portfolio, earn reviews, and unlock better opportunities.',
    },
  ];

  const stats = [
    { value: '10k+', label: 'Active Gigs' },
    { value: '50k+', label: 'Happy Workers' },
    { value: '1k+', label: 'Trusted Companies' },
    { value: '4.8/5', label: 'Average Rating' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <img src={LOGO_URL} alt="Hapployed" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-foreground">Hapployed</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Three Ways to <span className="gradient-text">Get Work Done</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you need urgent help, remote talent, or local workers, Hapployed connects you with the right people at the right time.
            </p>
          </div>
        </section>

        {/* Services Detailed */}
        {services.map((service, index) => {
          const Icon = service.icon;
          const isEven = index % 2 === 0;
          
          return (
            <section key={index} className={`py-20 ${service.bgColor}`}>
              <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                  {/* Image */}
                  <div className="flex-1">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                      <img 
                        src={service.image}
                        alt={service.title}
                        className="w-full h-[400px] object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-20`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 ${service.bgColor} border-2 border-current rounded-full mb-6 ${service.textColor}`}>
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{service.title}</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                      {service.subtitle}
                    </h2>
                    
                    <p className="text-lg text-muted-foreground mb-8">
                      {service.description}
                    </p>

                    <div className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center flex-shrink-0`}>
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => navigate('/auth/signup')}
                      className={`mt-8 px-8 py-4 bg-gradient-to-r ${service.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all`}
                    >
                      Get Started with {service.title}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Hapployed?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're not just a platform—we're your partner in building a successful freelance career.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="card hover-lift text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Get started in 3 simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Create Your Profile', description: 'Sign up and tell us about your skills, experience, and preferences. Takes less than 5 minutes.' },
                { step: '2', title: 'Browse & Apply', description: 'Our AI matches you with perfect opportunities. Apply with one click or set up instant alerts.' },
                { step: '3', title: 'Work & Get Paid', description: 'Complete the work, get reviewed, and receive secure payments. Build your reputation and earn more.' },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="card text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent text-white text-3xl font-bold flex items-center justify-center mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 text-primary">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Hapployed?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals finding meaningful work and building successful careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/auth/signup')}
                className="px-8 py-4 bg-white text-primary rounded-xl font-semibold text-lg hover:bg-white/90 transition-all shadow-xl"
              >
                Sign Up Free
              </button>
              <button 
                onClick={() => navigate('/auth/login')}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all"
              >
                Log In
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}