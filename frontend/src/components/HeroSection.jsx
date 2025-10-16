import React from 'react';
import { MapPin, Briefcase } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
        <div 
          className="relative bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div 
          className="relative bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
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
          <button className="group px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-dark transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3">
            <MapPin className="w-5 h-5" />
            Discover Opportunities
          </button>
          <button className="group px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-3">
            <Briefcase className="w-5 h-5" />
            Post a Project
          </button>
        </div>
      </div>
    </section>
  );
}