import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Zap, Users, TrendingUp, Activity } from 'lucide-react';

export default function UnifiedHeroSection() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Animated network background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.update();
        particle.draw();

        // Draw connections
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-start py-20 px-4 md:px-8 lg:px-16 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ opacity: 0.4 }}
      />

      {/* Top Badge */}
      <div className="absolute top-8 left-8 z-20">
        <div className="flex items-center gap-3 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-full px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-cyan-300 text-sm font-semibold">AI-POWERED NETWORK</span>
          <span className="text-white text-sm font-medium">Real-time Matching</span>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl w-full mx-auto">
        {/* Hero Text - Centered */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Work <span className="text-cyan-400">smarter.</span><br />
            Hire <span className="text-cyan-400">faster.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Hapployed connects people and projects in{' '}
            <span className="text-cyan-400 font-semibold">real time.</span>
          </p>
          <p className="text-lg text-gray-400">
            AI-powered matching for every gig, contract, or emergency task.
          </p>
        </div>

        {/* Two Main Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
          {/* Find Work Card */}
          <div className="relative bg-slate-800/40 backdrop-blur-md border-2 border-cyan-500/30 rounded-3xl p-8 hover:border-cyan-500/60 transition-all">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Image placeholder - would use actual image */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                <Users className="w-16 h-16 text-cyan-400" />
              </div>
              <h3 className="text-3xl font-bold text-white">Find Work</h3>
              <p className="text-gray-300 text-lg">
                Discover opportunities that match your skill and schedule.
              </p>
              <button
                onClick={() => navigate('/work/start')}
                className="w-full px-8 py-4 bg-transparent border-2 border-cyan-500 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 rounded-full font-bold text-lg transition-all"
              >
                Find Opportunities
              </button>
            </div>
          </div>

          {/* Hire Talent Card */}
          <div className="relative bg-slate-800/40 backdrop-blur-md border-2 border-cyan-500/30 rounded-3xl p-8 hover:border-cyan-500/60 transition-all">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                <Briefcase className="w-16 h-16 text-cyan-400" />
              </div>
              <h3 className="text-3xl font-bold text-white">Hire Talent</h3>
              <p className="text-gray-300 text-lg">
                Hire professionals, contractors, and skilled workers.
              </p>
              <button
                onClick={() => navigate('/hire/start')}
                className="w-full px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-cyan-500/50"
              >
                Hire Talent
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 mb-12">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm text-gray-400">Active Pros</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-3xl font-bold text-white">2,800+</div>
              <div className="text-sm text-gray-400">Live Projects</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-sm text-gray-400">Match rate</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => navigate('/discover-opportunities-info')}
            className="px-8 py-3 bg-transparent border-2 border-cyan-500 hover:bg-cyan-500/20 text-cyan-400 rounded-full font-semibold transition-all"
          >
            Discover Opportunities
          </button>
          <button
            onClick={() => navigate('/post-project-info')}
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-semibold transition-all"
          >
            Post a Project
          </button>
          <button
            onClick={() => navigate('/quickhire/post')}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full font-semibold transition-all flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Post Gig for QuickHire
          </button>
          <button
            onClick={() => navigate('/gigs-near-me-info')}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full font-semibold transition-all"
          >
            Gigs Near Me
          </button>
        </div>

        {/* Bottom Text */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            <span className="text-cyan-400">AI-Powered</span> Work.{' '}
            <span className="text-cyan-400">Real-Time</span> Results.
          </h2>
        </div>

        {/* Feature Tags - Navigate to Dedicated Pages */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/features/smart-ai-matching')}
            className="bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-4 py-2 rounded-full text-sm hover:bg-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            Smart AI Matching
          </button>
          <button
            onClick={() => navigate('/features/instant-deployment')}
            className="bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-4 py-2 rounded-full text-sm hover:bg-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            Instant Deployment
          </button>
          <button
            onClick={() => navigate('/features/verified-network')}
            className="bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-4 py-2 rounded-full text-sm hover:bg-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            Verified Network
          </button>
          <button
            onClick={() => navigate('/features/real-time-analytics')}
            className="bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-4 py-2 rounded-full text-sm hover:bg-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            Real-time Analytics
          </button>
        </div>
      </div>
    </section>
  );
}
