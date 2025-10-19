import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Sparkles, Zap } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[700px] overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Geometric Shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white/20 rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-white/20 rotate-12 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 border-2 border-white/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 flex flex-col justify-center items-center text-center min-h-[700px] py-20">
        {/* Floating Badge */}
        <div className="mb-8 animate-bounce">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-white font-semibold text-sm">AI-Powered Gig Marketplace</span>
            <Zap className="w-5 h-5 text-cyan-300" />
          </div>
        </div>

        {/* Main Heading with Gradient */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 max-w-5xl leading-tight">
          <span className="inline-block animate-fade-in-up">Get </span>
          <span className="inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Hapployed
          </span>
          <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>, </span>
          <br />
          <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.3s' }}>Get </span>
          <span className="inline-block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Ahead
          </span>
          <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.5s' }}>.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          Navigate the future of work with confidence. Discover your next gig, launch your project, 
          or deploy emergency support—instantly. Our AI doesn't just connect; it{' '}
          <span className="font-bold text-cyan-300">anticipates</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <button 
            onClick={() => navigate('/opportunities')}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg overflow-hidden shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
          >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <span className="relative flex items-center justify-center gap-3">
              <MapPin className="w-5 h-5" />
              Discover Opportunities
            </span>
          </button>

          <button 
            onClick={() => navigate('/projects/new')}
            className="group relative px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-2xl font-bold text-lg overflow-hidden shadow-2xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105"
          >
            <span className="relative flex items-center justify-center gap-3">
              <Briefcase className="w-5 h-5" />
              Post a Project
            </span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="mt-20 grid grid-cols-3 gap-8 md:gap-16 animate-fade-in-up" style={{ animationDelay: '1s' }}>
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '10K+', label: 'Jobs Posted' },
            { value: '98%', label: 'Success Rate' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-white mb-1 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-white/70 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
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
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}