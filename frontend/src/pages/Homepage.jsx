import React from 'react';
import Header from '../components/Header';
import UnifiedHeroSection from '../components/UnifiedHeroSection';
import RotatingHeroMessages from '../components/RotatingHeroMessages';
import HeroCarouselsSection from '../components/HeroCarouselsSection';
import ServicesSection from '../components/ServicesSection';
import AISection from '../components/AISection';
import CategoriesSection from '../components/CategoriesSection';
import StatsSection from '../components/StatsSection';
import Footer from '../components/Footer';

export default function Homepage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <UnifiedHeroSection />
      <RotatingHeroMessages />
      <HeroCarouselsSection />
      <ServicesSection />
      <AISection />
      <CategoriesSection />
      <StatsSection />
      <Footer />
    </div>
  );
}