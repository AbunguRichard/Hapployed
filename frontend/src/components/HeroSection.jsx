import React from 'react';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="mb-8">
      <div className="glass-strong rounded-2xl p-6 md:p-8 hover-lift neon-border">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Welcome Content */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-primary overflow-hidden glow-primary flex-shrink-0">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser" 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                Welcome back, <span className="gradient-text">Test User!</span>
              </h1>
              <div className="text-muted-foreground text-sm md:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Your AI-powered opportunity radar is active
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button className="group px-6 py-3 bg-gradient-primary rounded-xl font-semibold text-background hover:scale-105 transition-all duration-300 glow-primary flex items-center justify-center gap-2 whitespace-nowrap">
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              View Opportunities
            </button>
            <button className="px-6 py-3 glass-strong rounded-xl font-semibold text-foreground hover:bg-accent/10 transition-all duration-300 neon-border-accent flex items-center justify-center gap-2 whitespace-nowrap">
              <TrendingUp className="w-5 h-5" />
              Browse Talent
            </button>
            <button className="px-6 py-3 glass-strong rounded-xl font-semibold text-foreground hover:bg-secondary/10 transition-all duration-300 border border-secondary/30 flex items-center justify-center gap-2 whitespace-nowrap">
              <span>+</span>
              Post Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}