import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, CheckCircle, Award } from 'lucide-react';
import Header from '../components/Header';

export default function VerifiedNetworkPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-green-300 hover:text-green-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-12 mb-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">Verified Network</h1>
          </div>
          <p className="text-2xl text-white/90 leading-relaxed">
            Work with confidence. Our verification system includes government ID checks, professional 
            credentials, and performance reviews—ensuring you connect with trusted, qualified professionals.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Multi-Layer Verification Process</h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Trust is the foundation of every successful working relationship. That's why Hapployed 
              implements one of the most rigorous verification systems in the industry.
            </p>
            <p>
              Every professional in our network undergoes a comprehensive verification process before 
              they can accept their first project. This ensures that when you hire through Hapployed, 
              you're working with legitimate, qualified professionals.
            </p>
            
            {/* Verification Badges */}
            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-8 h-8 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Gov-Verified Badge</h3>
                </div>
                <p className="text-gray-300">
                  Government-issued ID verification ensures the professional's identity is confirmed 
                  through official channels.
                </p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-8 h-8 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Pro-Verified Badge</h3>
                </div>
                <p className="text-gray-300">
                  Professional credentials, certifications, and work history have been verified and 
                  authenticated.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Steps */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Our Verification Process</h2>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Identity Verification',
                description: 'Government-issued ID check using advanced document verification technology'
              },
              {
                step: '2',
                title: 'Background Screening',
                description: 'Comprehensive background checks including criminal records and employment history'
              },
              {
                step: '3',
                title: 'Credential Validation',
                description: 'Verification of professional licenses, certifications, and educational qualifications'
              },
              {
                step: '4',
                title: 'Skill Assessment',
                description: 'Testing and validation of claimed skills and expertise levels'
              },
              {
                step: '5',
                title: 'Reference Checks',
                description: 'Contact with previous clients and employers to verify work quality and reliability'
              },
              {
                step: '6',
                title: 'Ongoing Monitoring',
                description: 'Continuous performance reviews and client feedback tracking'
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Key Benefits</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Gov-verified worker badges',
                description: 'Instantly identify professionals with government-verified identities'
              },
              {
                title: 'Professional credential verification',
                description: 'All licenses, certifications, and qualifications are authenticated'
              },
              {
                title: 'Background checks and reviews',
                description: 'Comprehensive screening ensures safety and reliability'
              },
              {
                title: 'Trust and safety guaranteed',
                description: 'Our verification process eliminates fraud and ensures quality'
              },
              {
                title: 'Performance Tracking',
                description: 'Real-time ratings and reviews from previous clients'
              },
              {
                title: 'Dispute Resolution',
                description: 'Protected transactions with dedicated support team'
              }
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-10 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Trusted Network
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Work with confidence knowing every professional is thoroughly verified.
          </p>
          <button
            onClick={() => navigate('/auth/signup')}
            className="bg-white text-green-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
          >
            Sign Up Now →
          </button>
        </div>
      </div>
    </div>
  );
}
