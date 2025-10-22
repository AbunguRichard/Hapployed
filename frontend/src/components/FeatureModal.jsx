import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Zap, Shield, BarChart } from 'lucide-react';

const featureDetails = {
  'Smart AI Matching': {
    icon: Sparkles,
    title: 'Smart AI Matching',
    description: 'Our advanced AI doesn\'t just match skills—it anticipates needs, understands context, and connects you with opportunities that align perfectly with your expertise and career goals.',
    benefits: [
      'AI-powered skill and compatibility analysis',
      'Real-time job-to-candidate matching',
      'Predictive recommendations based on your profile',
      'Intelligent filtering to save you time'
    ],
    color: 'cyan'
  },
  'Instant Deployment': {
    icon: Zap,
    title: 'Instant Deployment',
    description: 'Need someone now? Our QuickHire system connects you with available professionals in minutes, not days. Perfect for urgent projects, last-minute needs, or emergency support.',
    benefits: [
      'Connect with available pros in under 5 minutes',
      'Real-time availability tracking',
      'Emergency support for urgent needs',
      'Streamlined onboarding process'
    ],
    color: 'orange'
  },
  'Verified Network': {
    icon: Shield,
    title: 'Verified Network',
    description: 'Work with confidence. Our verification system includes government ID checks, professional credentials, and performance reviews—ensuring you connect with trusted, qualified professionals.',
    benefits: [
      'Gov-verified worker badges',
      'Professional credential verification',
      'Background checks and reviews',
      'Trust and safety guaranteed'
    ],
    color: 'green'
  },
  'Real-time Analytics': {
    icon: BarChart,
    title: 'Real-time Analytics',
    description: 'Make data-driven decisions with live insights into market trends, pricing, worker availability, and project performance. Stay ahead with actionable intelligence.',
    benefits: [
      'Live market trend analysis',
      'AI-powered price estimation',
      'Worker availability insights',
      'Performance tracking and reporting'
    ],
    color: 'purple'
  }
};

const colorClasses = {
  cyan: {
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500',
    text: 'text-cyan-400',
    border: 'border-cyan-400',
    buttonHover: 'hover:bg-cyan-600'
  },
  orange: {
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500',
    text: 'text-orange-400',
    border: 'border-orange-400',
    buttonHover: 'hover:bg-orange-600'
  },
  green: {
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500',
    text: 'text-green-400',
    border: 'border-green-400',
    buttonHover: 'hover:bg-green-600'
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500',
    text: 'text-purple-400',
    border: 'border-purple-400',
    buttonHover: 'hover:bg-purple-600'
  }
};

export default function FeatureModal({ feature, onClose }) {
  const navigate = useNavigate();
  const details = featureDetails[feature];
  const colors = colorClasses[details.color];
  const IconComponent = details.icon;

  const handleSignUp = () => {
    navigate('/auth/signup');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-700 animate-fadeIn">
        {/* Header with Gradient */}
        <div className={`bg-gradient-to-r ${colors.gradient} p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">{details.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            {details.description}
          </p>

          {/* Benefits List */}
          <div className="space-y-3">
            <h3 className={`text-xl font-semibold ${colors.text}`}>Key Benefits:</h3>
            <ul className="space-y-2">
              {details.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className={`${colors.bg} rounded-full p-1 mt-1`}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleSignUp}
              className={`flex-1 ${colors.bg} ${colors.buttonHover} text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg`}
            >
              Sign Up Now →
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Learn More Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
