import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Header from '../components/Header';

export default function InstantDeploymentPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-800">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-orange-300 hover:text-orange-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 mb-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">Instant Deployment</h1>
          </div>
          <p className="text-2xl text-white/90 leading-relaxed">
            Need someone now? Our QuickHire system connects you with available professionals in minutes, 
            not days. Perfect for urgent projects, last-minute needs, or emergency support.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Lightning-Fast Hiring</h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Traditional hiring can take weeks or even months. But what do you do when you need someone 
              <span className="text-orange-400 font-semibold"> right now</span>? That's where Instant Deployment comes in.
            </p>
            <p>
              Our QuickHire system maintains a real-time database of available professionals who are 
              ready to start immediately. Whether it's a same-day emergency, a last-minute project need, 
              or urgent support required, we can connect you with qualified professionals in under 5 minutes.
            </p>
            
            {/* Timeline */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 my-8">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-orange-400" />
                <h3 className="text-2xl font-bold text-white">Average Connection Time: 3-5 Minutes</h3>
              </div>
              <div className="space-y-3 text-gray-300">
                <p><strong className="text-white">0-2 min:</strong> Post your urgent need with QuickHire</p>
                <p><strong className="text-white">2-4 min:</strong> AI matches and notifies available professionals</p>
                <p><strong className="text-white">4-5 min:</strong> Review responses and make your selection</p>
                <p><strong className="text-white">5+ min:</strong> Professional is ready to start</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Key Benefits</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Connect with available pros in under 5 minutes',
                description: 'Our system only shows professionals who are actively available right now'
              },
              {
                title: 'Real-time availability tracking',
                description: 'Know exactly who can start immediately with live availability status'
              },
              {
                title: 'Emergency support for urgent needs',
                description: 'Priority matching and notifications for critical, time-sensitive projects'
              },
              {
                title: 'Streamlined onboarding process',
                description: 'Pre-verified professionals mean you can skip lengthy vetting'
              },
              {
                title: '24/7 Access',
                description: 'Post urgent needs anytime, day or night, and get immediate responses'
              },
              {
                title: 'Quality Guaranteed',
                description: 'Fast doesn\'t mean compromising on quality - all QuickHire pros are fully vetted'
              }
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-10 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready for Instant Access to Top Talent?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join businesses that never have to wait for the help they need.
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="bg-white text-orange-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
          >
            Sign Up Now →
          </button>
        </div>
      </div>
    </div>
  );
}
