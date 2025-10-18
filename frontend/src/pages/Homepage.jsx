import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import RotatingHeroMessages from '../components/RotatingHeroMessages';
import HeroCarouselsSection from '../components/HeroCarouselsSection';
import ServicesSection from '../components/ServicesSection';
import AISection from '../components/AISection';
import CategoriesSection from '../components/CategoriesSection';
import StatsSection from '../components/StatsSection';
import Footer from '../components/Footer';
import VoiceOnlyModeModal from '../components/VoiceOnlyModeModal';

export default function Homepage() {
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <RotatingHeroMessages />
      <HeroCarouselsSection />
      <ServicesSection />
      <AISection />
      <CategoriesSection />
      <StatsSection />
      <Footer />
      
      {/* Floating Voice Mode Button */}
      <button
        onClick={() => setIsVoiceModeOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 group"
        title="Voice Mode - Talk to Hapployed"
      >
        <Volume2 className="w-8 h-8" />
        <span className="absolute -top-12 right-0 bg-foreground text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Voice Mode
        </span>
      </button>

      {/* Voice Mode Modal */}
      <VoiceOnlyModeModal 
        isOpen={isVoiceModeOpen} 
        onClose={() => setIsVoiceModeOpen(false)} 
        user={null} 
      />
    </div>
  );
}