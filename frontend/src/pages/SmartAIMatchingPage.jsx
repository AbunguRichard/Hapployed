import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import Header from '../components/Header';

export default function SmartAIMatchingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl p-12 mb-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">Smart AI Matching</h1>
          </div>
          <p className="text-2xl text-white/90 leading-relaxed">
            Our advanced AI doesn't just match skills—it anticipates needs, understands context, 
            and connects you with opportunities that align perfectly with your expertise and career goals.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">How It Works</h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Traditional job platforms rely on simple keyword matching. Hapployed's Smart AI Matching 
              goes far beyond that, using cutting-edge machine learning algorithms to understand the 
              nuances of your skills, experience, and career aspirations.
            </p>
            <p>
              Our AI analyzes your complete profile, including your work history, skills, certifications, 
              and even your career trajectory to predict which opportunities will be the best fit. It 
              considers factors like:
            </p>
            <ul className="list-disc pl-8 space-y-2">
              <li>Your skill proficiency levels and areas of expertise</li>
              <li>Your preferred work types, industries, and project sizes</li>
              <li>Historical success rates with similar projects</li>
              <li>Location preferences and availability</li>
              <li>Career growth potential and learning opportunities</li>
            </ul>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Key Benefits</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'AI-powered skill and compatibility analysis',
                description: 'Deep learning models assess your true capabilities beyond simple keywords'
              },
              {
                title: 'Real-time job-to-candidate matching',
                description: 'Get matched with opportunities as soon as they\'re posted'
              },
              {
                title: 'Predictive recommendations',
                description: 'Discover opportunities you didn\'t even know you were perfect for'
              },
              {
                title: 'Intelligent filtering',
                description: 'Save hours by automatically filtering out mismatched opportunities'
              },
              {
                title: '98% Match Rate',
                description: 'Our AI achieves industry-leading accuracy in connecting the right talent with the right opportunities'
              },
              {
                title: 'Continuous Learning',
                description: 'The system gets smarter with every match, improving recommendations over time'
              }
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-10 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Smart Matching?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of professionals who are finding better opportunities with AI-powered matching.
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="bg-white text-cyan-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
          >
            Sign Up Now →
          </button>
        </div>
      </div>
    </div>
  );
}
