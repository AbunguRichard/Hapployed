import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft, CheckCircle, Users, Clock, DollarSign } from 'lucide-react';
import Header from '../components/Header';

export default function ProjectsServicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-12 mb-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Briefcase className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">Projects</h1>
          </div>
          <p className="text-2xl text-white/90 leading-relaxed">
            Connect with top talent for remote and short-term contract work. From quick freelance gigs 
            to multi-month engagements, find the perfect professional for your project needs.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">How Projects Work</h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Whether you're looking to hire a designer for a website redesign, a developer for an app, 
              or a writer for content creation, Hapployed's Projects marketplace connects you with 
              skilled professionals ready to take on your remote or contract-based work.
            </p>
            <p>
              Our platform is designed for structured projects with clear deliverables, timelines, 
              and budgets. With built-in milestone tracking, escrow payments, and review systems, 
              you can manage your projects with confidence.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">How to Post a Project</h2>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Describe Your Project',
                description: 'Share details about what you need done, timeline, and budget. Use our AI voice input for faster posting.',
                icon: Briefcase
              },
              {
                step: '2',
                title: 'Get Matched with Talent',
                description: 'Our AI matches your project with qualified professionals based on skills, availability, and success history.',
                icon: Users
              },
              {
                step: '3',
                title: 'Review Proposals',
                description: 'Browse through proposals, review portfolios, and interview candidates before making your choice.',
                icon: CheckCircle
              },
              {
                step: '4',
                title: 'Work & Track Progress',
                description: 'Collaborate with your chosen professional, track milestones, and release payments as work is completed.',
                icon: Clock
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    </div>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'AI-Powered Matching',
                description: 'Smart algorithm connects you with the best-fit professionals based on project requirements',
                icon: '🤖'
              },
              {
                title: 'Milestone & Payments',
                description: 'Break projects into milestones with secure escrow-protected payments',
                icon: '💰'
              },
              {
                title: 'Portfolio Reviews',
                description: 'View past work, ratings, and client reviews before hiring',
                icon: '⭐'
              },
              {
                title: 'Contract Protection',
                description: 'Built-in agreements and dispute resolution for peace of mind',
                icon: '🛡️'
              },
              {
                title: 'Real-Time Communication',
                description: 'Integrated messaging and file sharing for seamless collaboration',
                icon: '💬'
              },
              {
                title: 'Project Analytics',
                description: 'Track progress, time spent, and budget utilization in real-time',
                icon: '📊'
              }
            ].map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="text-4xl">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Info */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">Transparent Pricing</h2>
          </div>
          <div className="space-y-4 text-gray-300 text-lg">
            <p>
              <strong className="text-white">For Clients:</strong> Post projects for free. We charge a small 
              service fee (typically 3-5%) on successful transactions to cover platform costs and payment processing.
            </p>
            <p>
              <strong className="text-white">For Workers:</strong> Apply to projects for free. We take a 
              competitive commission only when you successfully complete work and get paid.
            </p>
            <p className="text-blue-300 font-semibold">
              💡 Use our AI Price Estimator to get accurate project cost estimates based on market rates!
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Your Project Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of businesses finding top talent for their projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/auth/signup')}
              className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
            >
              Sign Up to Post a Project →
            </button>
            <button
              onClick={() => navigate('/auth/signup')}
              className="bg-blue-800 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all hover:scale-105"
            >
              Sign Up to Find Projects →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
