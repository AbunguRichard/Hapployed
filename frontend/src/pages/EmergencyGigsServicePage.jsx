import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';
import Header from '../components/Header';

export default function EmergencyGigsServicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-800">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-red-300 hover:text-red-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-12 mb-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <div>
              <div className="bg-white/30 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-2">
                🚨 ASAP SERVICE
              </div>
              <h1 className="text-5xl font-bold text-white">Emergency Gigs</h1>
            </div>
          </div>
          <p className="text-2xl text-white/90 leading-relaxed">
            Need help RIGHT NOW? Get connected with available professionals in minutes, not hours. 
            Perfect for urgent needs, last-minute emergencies, and time-sensitive situations.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">When Every Second Counts</h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              We all face unexpected situations that require immediate help. Your website crashed during 
              a product launch. The photographer for tomorrow's event just canceled. You need a plumber 
              NOW because there's water everywhere.
            </p>
            <p>
              Traditional hiring takes days or weeks. <span className="text-red-400 font-semibold">Emergency Gigs 
              connects you with available help in under 5 minutes.</span> Our QuickHire system is designed 
              specifically for urgent, same-day needs.
            </p>
            
            {/* Urgency Indicator */}
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-6 my-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <h3 className="text-2xl font-bold text-white">Average Response Time: 3-5 Minutes</h3>
              </div>
              <p className="text-gray-200">
                Our emergency response system prioritizes speed without sacrificing quality. All QuickHire 
                professionals are pre-verified and ready to respond immediately.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">How Emergency Gigs Work</h2>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'One-Tap SOS',
                description: 'Hit the Emergency Gig button and describe what you need help with. Voice input available for faster posting.',
                time: '30 seconds'
              },
              {
                step: '2',
                title: 'Instant Matching',
                description: 'Our AI immediately alerts available professionals in your area or field who can help RIGHT NOW.',
                time: '1-2 minutes'
              },
              {
                step: '3',
                title: 'Choose Your Helper',
                description: 'Review available responders with real-time ETAs, ratings, and instant pricing.',
                time: '1-2 minutes'
              },
              {
                step: '4',
                title: 'Get Help Fast',
                description: 'Connect instantly via chat or call. For local gigs, track their arrival with live ETA updates.',
                time: 'Immediate'
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-4 bg-slate-700/30 p-6 rounded-xl">
                <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <span className="text-red-400 font-semibold text-sm">{item.time}</span>
                  </div>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Perfect For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Technical Emergencies',
                examples: 'Website crashes, server issues, urgent bug fixes, system outages',
                icon: '💻'
              },
              {
                title: 'Event Crises',
                examples: 'Last-minute cancellations, urgent staffing needs, equipment failures',
                icon: '🎭'
              },
              {
                title: 'Home Emergencies',
                examples: 'Plumbing leaks, electrical issues, lock-outs, urgent repairs',
                icon: '🏠'
              },
              {
                title: 'Business Urgencies',
                examples: 'Delivery needs, urgent printing, same-day support, rush orders',
                icon: '💼'
              },
              {
                title: 'Creative Rush Jobs',
                examples: 'Urgent design work, same-day photography, quick video edits',
                icon: '🎨'
              },
              {
                title: 'Transportation SOS',
                examples: 'Emergency deliveries, urgent moving help, last-minute transport',
                icon: '🚚'
              }
            ].map((useCase, index) => (
              <div key={index} className="bg-slate-700/30 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{useCase.icon}</span>
                  <h3 className="text-xl font-semibold text-white">{useCase.title}</h3>
                </div>
                <p className="text-gray-300 text-sm">{useCase.examples}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Guarantees */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-red-400" />
            <h2 className="text-3xl font-bold text-white">Safety & Quality Guaranteed</h2>
          </div>
          <div className="space-y-4">
            {[
              'All QuickHire professionals are pre-verified with background checks',
              'Real-time tracking and safety check-ins for local gigs',
              'Secure payment processing with buyer protection',
              '24/7 emergency support team available',
              'Rating system ensures accountability',
              'Insurance coverage for eligible emergency services'
            ].map((item, index) => (
              <div key={index} className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 mb-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">Emergency Pricing</h2>
          <div className="space-y-4 text-gray-300 text-lg">
            <p>
              <strong className="text-white">Transparent Rates:</strong> Emergency gigs may include urgency 
              premiums (typically 20-50% higher than standard rates) to compensate professionals for 
              immediate availability and rush service.
            </p>
            <p>
              <strong className="text-white">No Hidden Fees:</strong> You'll see the exact price upfront before 
              accepting. What you see is what you pay.
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-300 font-semibold">
                💡 Pro Tip: The urgency premium is worth it when time is critical. Most clients report 
                that emergency help saves them far more than the premium costs.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-10 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready for Peace of Mind?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Sign up now and have access to emergency help whenever you need it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/auth/signup')}
              className="bg-white text-red-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Sign Up for Emergency Access →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
