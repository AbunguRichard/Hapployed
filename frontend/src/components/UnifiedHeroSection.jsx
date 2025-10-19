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

      <div className="relative z-10 max-w-7xl w-full">
        {/* Hero Text */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Get <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 text-transparent bg-clip-text">
              Hapployed
            </span>
            <br />
            Get Ahead.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
            Navigate the future of work with confidence. Discover your next gig, 
            launch your project, or deploy emergency support—instantly. Our AI 
            doesn't just connect; it <span className="text-cyan-400 font-semibold">anticipates</span>.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="flex flex-wrap gap-6 mb-10">
          <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl px-5 py-3">
            <Users className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-sm text-gray-400">Active Pros</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl px-5 py-3">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-white">2,847</div>
              <div className="text-sm text-gray-400">Live Projects</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl px-5 py-3">
            <Activity className="w-6 h-6 text-pink-400" />
            <div>
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-sm text-gray-400">Match Rate</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => navigate('/opportunities')}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-cyan-500/50"
          >
            <MapPin className="w-5 h-5" />
            Discover Opportunities →
          </button>
          <button
            onClick={() => navigate('/post-project')}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-slate-900 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
          >
            <Briefcase className="w-5 h-5" />
            Post a Project
          </button>
          <button
            onClick={() => navigate('/gigs-near-me')}
            className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
          >
            Gigs Near Me
          </button>
          <button
            onClick={() => navigate('/quickhire-info')}
            className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
          >
            QuickHire
          </button>
          <button
            onClick={() => navigate('/opportunities')}
            className="bg-blue-400 hover:bg-blue-300 text-slate-900 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
          >
            Opportunities
          </button>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-4 py-2 rounded-full text-sm">
            Smart AI Matching
          </div>
          <div className="bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-4 py-2 rounded-full text-sm">
            Instant Deployment
          </div>
          <div className="bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-4 py-2 rounded-full text-sm">
            Verified Network
          </div>
          <div className="bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-4 py-2 rounded-full text-sm">
            Real-time Analytics
          </div>
        </div>
      </div>
    </section>
  );
}
