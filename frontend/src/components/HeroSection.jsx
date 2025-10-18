import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Futuristic Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/8728386/pexels-photo-8728386.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-purple-900/70 to-accent/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl">
          Get Hapployed, Get Ahead.
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl">
          Navigate the future of work with confidence. Discover your next gig,
          launch your project, or deploy emergency support—instantly. Our AI
          doesn't just connect; it anticipates.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate('/opportunities')}
            className="group px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-dark transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
          >
            <MapPin className="w-5 h-5" />
            Discover Opportunities
          </button>
          <button 
            onClick={() => navigate('/projects/new')}
            className="group px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <Briefcase className="w-5 h-5" />
            Post a Project
          </button>
        </div>
      </div>
    </section>
  );
}