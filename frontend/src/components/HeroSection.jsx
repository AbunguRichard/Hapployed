import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, ArrowRight, Sparkles, Users, Target } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[800px] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0">
        {/* Glowing Mesh Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 90%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)
          `
        }} />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/50 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Scan Line Effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />
        </div>
      </div>

      {/* 3D Card Container */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[750px]">
          
          {/* Left Content */}
          <div className="space-y-8">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full backdrop-blur-xl animate-fade-in">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-white">Live • 50,000+ Active Users</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4 animate-fade-in-up">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-none">
                <span className="block text-white mb-2">Get</span>
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2 relative">
                  Hapployed
                  {/* Underline Effect */}
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full" />
                </span>
                <span className="block text-white/80 text-5xl md:text-6xl mt-4">Get Ahead.</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-xl text-gray-300 leading-relaxed max-w-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              The AI-powered marketplace that doesn't just connect talent with opportunity—it 
              <span className="text-cyan-400 font-semibold"> predicts </span> 
              your perfect match before you even search.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {[
                { icon: Target, text: 'AI Matching' },
                { icon: Sparkles, text: 'Instant Deploy' },
                { icon: Users, text: 'Verified Pros' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                  <feature.icon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-white font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => navigate('/opportunities')}
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Discover Opportunities
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => navigate('/projects/new')}
                className="group px-8 py-4 bg-white/5 border-2 border-white/20 rounded-2xl font-bold text-lg text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Post a Project
                </span>
              </button>
            </div>
          </div>

          {/* Right Side - Floating Cards */}
          <div className="relative h-[600px] hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {/* Card 1 - Top */}
            <div className="absolute top-0 right-0 w-80 p-6 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-3xl backdrop-blur-xl shadow-2xl animate-float" style={{ animationDelay: '0s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">Sarah M.</div>
                  <div className="text-xs text-gray-400">Web Developer</div>
                </div>
              </div>
              <div className="text-cyan-400 text-2xl font-bold mb-1">$15,240</div>
              <div className="text-gray-400 text-sm">Earned this month</div>
            </div>

            {/* Card 2 - Middle */}
            <div className="absolute top-40 left-10 w-72 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl backdrop-blur-xl shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-bold">Live Projects</div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div className="text-blue-400 text-3xl font-bold mb-2">2,847</div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full w-3/4 animate-pulse" />
              </div>
              <div className="text-gray-400 text-xs mt-2">+24% from last week</div>
            </div>

            {/* Card 3 - Bottom */}
            <div className="absolute bottom-20 right-10 w-64 p-5 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-3xl backdrop-blur-xl shadow-2xl animate-float" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <div className="text-white font-bold text-sm">AI Match</div>
              </div>
              <div className="text-purple-400 text-xl font-bold mb-1">98% Accuracy</div>
              <div className="text-gray-400 text-xs">Perfect job-talent matching</div>
            </div>

            {/* Glow Effects */}
            <div className="absolute top-20 right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-40 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

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
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </section>
  );
}