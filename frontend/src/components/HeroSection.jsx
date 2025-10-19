import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[750px] overflow-hidden bg-slate-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80)',
            filter: 'brightness(0.3)'
          }}
        />
        
        {/* Cyan Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-slate-900/60 to-blue-900/40" />
      </div>

      {/* Digital Network Overlay - Animated Nodes and Lines */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Animated lines */}
          <line x1="10%" y1="20%" x2="40%" y2="50%" stroke="url(#lineGradient)" strokeWidth="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="40%" y1="50%" x2="70%" y2="30%" stroke="url(#lineGradient)" strokeWidth="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="0.5s" repeatCount="indefinite" />
          </line>
          <line x1="70%" y1="30%" x2="90%" y2="60%" stroke="url(#lineGradient)" strokeWidth="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="1s" repeatCount="indefinite" />
          </line>
          <line x1="20%" y1="70%" x2="50%" y2="80%" stroke="url(#lineGradient)" strokeWidth="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="1.5s" repeatCount="indefinite" />
          </line>
          <line x1="50%" y1="80%" x2="80%" y2="70%" stroke="url(#lineGradient)" strokeWidth="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="2s" repeatCount="indefinite" />
          </line>
        </svg>

        {/* Glowing Nodes */}
        {[
          { top: '20%', left: '10%', delay: '0s' },
          { top: '50%', left: '40%', delay: '0.5s' },
          { top: '30%', left: '70%', delay: '1s' },
          { top: '60%', left: '90%', delay: '1.5s' },
          { top: '70%', left: '20%', delay: '2s' },
          { top: '80%', left: '50%', delay: '2.5s' },
          { top: '70%', left: '80%', delay: '3s' },
          { top: '40%', left: '85%', delay: '0.8s' },
          { top: '25%', left: '30%', delay: '1.2s' },
          { top: '55%', left: '60%', delay: '1.8s' },
        ].map((node, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
            style={{
              top: node.top,
              left: node.left,
              animation: `pulse 2s ease-in-out ${node.delay} infinite`
            }}
          >
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" />
          </div>
        ))}

        {/* Data Particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cyan-300 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out ${Math.random() * 5}s infinite`
            }}
          />
        ))}
      </div>

      {/* Hexagonal Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 10 L50 0 L75 10 L75 30 L50 40 L25 30 Z' fill='none' stroke='%2306b6d4' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 py-24">
        <div className="max-w-4xl">
          {/* Floating Tech Badge */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-cyan-500/10 border border-cyan-400/30 rounded-full backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-cyan-300 font-semibold text-sm">AI-POWERED NETWORK</span>
              </div>
              <div className="w-px h-4 bg-cyan-400/30" />
              <span className="text-cyan-200 text-sm">Real-time Matching</span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-none mb-4">
              <span className="block text-white mb-2">Get</span>
              <span className="block relative inline-block">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Hapployed
                </span>
                {/* Glowing underline */}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full shadow-lg shadow-cyan-400/50" />
              </span>
              <span className="block text-white/90 text-5xl md:text-6xl mt-6">Get Ahead.</span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Navigate the future of work with confidence. Discover your next gig, launch your project, 
            or deploy emergency support—instantly. Our AI doesn't just connect; it{' '}
            <span className="text-cyan-400 font-semibold">anticipates</span>.
          </p>

          {/* Stats Pills */}
          <div className="flex flex-wrap gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {[
              { value: '50K+', label: 'Active Pros', icon: '👥' },
              { value: '2,847', label: 'Live Projects', icon: '⚡' },
              { value: '98%', label: 'Match Rate', icon: '🎯' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <div className="text-cyan-400 font-bold text-lg">{stat.value}</div>
                  <div className="text-gray-400 text-xs">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => navigate('/opportunities')}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl font-bold text-lg text-white overflow-hidden shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <span className="relative flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                Discover Opportunities
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => navigate('/projects/new')}
              className="group px-8 py-4 bg-white/5 border-2 border-cyan-400/30 rounded-2xl font-bold text-lg text-white backdrop-blur-sm hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                <Briefcase className="w-5 h-5" />
                Post a Project
              </span>
            </button>
          </div>

          {/* Tech Feature Tags */}
          <div className="mt-12 flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {['Smart AI Matching', 'Instant Deployment', 'Verified Network', 'Real-time Analytics'].map((feature, i) => (
              <div key={i} className="px-4 py-2 bg-cyan-500/10 border border-cyan-400/20 rounded-lg text-cyan-300 text-sm font-medium backdrop-blur-sm">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(10px, -10px); }
          50% { transform: translate(-5px, 5px); }
          75% { transform: translate(-10px, -5px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}