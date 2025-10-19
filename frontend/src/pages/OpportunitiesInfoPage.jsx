import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function OpportunitiesInfoPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Briefcase,
      title: 'Professional Projects',
      description: 'Long-term contracts with established businesses and enterprises'
    },
    {
      icon: Calendar,
      title: 'Flexible Timeline',
      description: 'Set your own schedule and work at your own pace'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Build your portfolio with high-quality, meaningful work'
    },
    {
      icon: Users,
      title: 'Collaborate',
      description: 'Work with teams and expand your professional network'
    }
  ];

  const projectTypes = [
    {
      category: 'Web Development',
      examples: 'Full-stack apps, E-commerce sites, APIs'
    },
    {
      category: 'Design & Creative',
      examples: 'UI/UX Design, Branding, Marketing Materials'
    },
    {
      category: 'Consulting',
      examples: 'Business Strategy, Tech Consulting, Project Management'
    },
    {
      category: 'Content & Writing',
      examples: 'Copywriting, Technical Writing, Content Strategy'
    },
    {
      category: 'Data & Analytics',
      examples: 'Data Analysis, Machine Learning, Business Intelligence'
    },
    {
      category: 'Marketing',
      examples: 'SEO, Social Media, Digital Marketing Campaigns'
    }
  ];

  const benefits = [
    'Higher earning potential with project-based contracts',
    'Build long-term relationships with clients',
    'Work on meaningful, impactful projects',
    'Flexible work arrangements (remote or on-site)',
    'Get paid milestone-based or upon completion',
    'Access to enterprise-level projects'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0yMCA0MGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-6">
                <Calendar className="w-4 h-4" />
                FLEXIBLE SCHEDULE
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Current Projects
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Browse professional project-based opportunities from businesses seeking skilled talent for meaningful, long-term work.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/opportunities')}
                  className="btn-primary text-lg flex items-center gap-2"
                >
                  Browse Projects
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
                src="https://images.unsplash.com/photo-1659353589241-f450b33f908a"
                alt="Professional project team"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">254 Active Projects</div>
                    <div className="text-sm text-muted-foreground">Available now</div>
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
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Project-Based Work?</h2>
            <p className="text-xl text-muted-foreground">Build a sustainable freelance career with quality projects</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
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
            <h2 className="text-4xl font-bold text-foreground mb-4">Popular Project Categories</h2>
            <p className="text-xl text-muted-foreground">Find projects matching your expertise</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectTypes.map((type, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer border border-border group"
              >
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {type.category}
                </h3>
                <p className="text-muted-foreground">{type.examples}</p>
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
              <h2 className="text-4xl font-bold text-foreground mb-6">Why Professionals Love Hapployed</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join a platform designed for skilled professionals who want to build meaningful careers through project-based work.
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

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Your journey to project success</p>
          </div>
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Create Your Professional Profile',
                description: 'Showcase your skills, experience, and portfolio'
              },
              {
                step: '2',
                title: 'Browse & Propose',
                description: 'Find projects that match your expertise and submit proposals'
              },
              {
                step: '3',
                title: 'Deliver & Grow',
                description: 'Complete projects, build your reputation, and earn consistently'
              }
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
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
      <section className="py-20 px-4 bg-gradient-to-br from-blue-500 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Your Career?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join professionals earning sustainable income through quality project work
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            Start Your Professional Journey
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
