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

      <div className="relative z-10 max-w-7xl w-full mx-auto text-center">
        {/* Hero Text */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
            Get{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 text-transparent bg-clip-text">
              Hapployed
            </span>
            <br />
            Get Ahead.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Whether you're hiring top talent or looking for your next opportunity, 
            Hapployed connects you instantly with AI-powered matching.
          </p>
        </div>

        {/* Main CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <button
            onClick={() => navigate('/auth/signup')}
            className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-2xl font-bold text-xl transition-all hover:scale-105 shadow-2xl shadow-cyan-500/50 min-w-[280px]"
          >
            <div className="flex flex-col items-center gap-2">
              <Briefcase className="w-8 h-8" />
              <span>I'm looking to hire</span>
            </div>
          </button>
          <button
            onClick={() => navigate('/auth/signup')}
            className="group relative px-10 py-5 bg-white hover:bg-gray-100 text-slate-900 rounded-2xl font-bold text-xl transition-all hover:scale-105 shadow-2xl min-w-[280px]"
          >
            <div className="flex flex-col items-center gap-2">
              <Users className="w-8 h-8" />
              <span>I'm looking for work</span>
            </div>
          </button>
        </div>

        {/* Key Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-cyan-400">50K+</div>
            <div className="text-sm text-gray-400">Active Professionals</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-cyan-400">2,847</div>
            <div className="text-sm text-gray-400">Live Projects</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-cyan-400">98%</div>
            <div className="text-sm text-gray-400">Match Rate</div>
          </div>
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
