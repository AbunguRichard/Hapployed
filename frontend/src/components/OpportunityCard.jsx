import React, { useState } from 'react';
import { Briefcase, MapPin, CheckCircle, Users, Sparkles } from 'lucide-react';

export default function OpportunityCard({ opportunity, onApply, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const [gaugeProgress, setGaugeProgress] = useState(0);

  React.useEffect(() => {
    // Animate gauge on mount
    const timer = setTimeout(() => {
      setGaugeProgress(opportunity.matchScore);
    }, 300 + index * 100);
    return () => clearTimeout(timer);
  }, [opportunity.matchScore, index]);

  // Get color based on match score
  const getMatchColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getMatchGradient = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  // Get category gradient
  const getCategoryGradient = (category) => {
    if (category === 'tech') return 'from-violet-500/20 to-blue-500/20';
    if (category === 'design') return 'from-pink-500/20 to-orange-500/20';
    if (category === 'labor') return 'from-teal-500/20 to-green-500/20';
    return 'from-primary/20 to-accent/20';
  };

  const getCategoryBorder = (category) => {
    if (category === 'tech') return 'border-violet-500/30';
    if (category === 'design') return 'border-pink-500/30';
    if (category === 'labor') return 'border-teal-500/30';
    return 'border-primary/30';
  };

  return (
    <div
      className={`relative group animate-slide-up`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glassmorphism Card */}
      <div
        className={`relative rounded-2xl bg-white/90 backdrop-blur-sm border-2 p-6 transition-all duration-500 ${
          getCategoryBorder(opportunity.category)
        } ${
          isHovered ? 'shadow-2xl scale-[1.02] -translate-y-2' : 'shadow-lg'
        }`}
      >
        {/* Category Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(opportunity.category)} rounded-2xl opacity-50`} />

        {/* Content */}
        <div className="relative z-10">
          {/* Top Row: Company + Match Badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Company Avatar */}
              <img
                src={opportunity.avatar}
                alt={opportunity.company}
                className="w-12 h-12 rounded-full bg-white border-2 border-white shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-semibold text-foreground">{opportunity.company}</h5>
                  {opportunity.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" title="Verified Employer" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {opportunity.location}
                </p>
              </div>
            </div>

            {/* Circular Radial Gauge for Match % */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                {/* Progress circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray={`${(gaugeProgress / 100) * 100} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className={`${getMatchColor(opportunity.matchScore)}`} stopOpacity="1" />
                    <stop offset="100%" className={`${getMatchColor(opportunity.matchScore)}`} stopOpacity="0.8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-bold ${getMatchColor(opportunity.matchScore)}`}>
                  {opportunity.matchScore}%
                </span>
              </div>
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -bottom-8 right-0 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Matched based on your skills
                </div>
              )}
            </div>
          </div>

          {/* Middle Row: Title */}
          <h4 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
            {opportunity.title}
          </h4>

          {/* Description */}
          <p className="text-foreground/80 mb-4 leading-relaxed">{opportunity.description}</p>

          {/* Social Proof */}
          {opportunity.socialProof && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Users className="w-4 h-4" />
              <span>{opportunity.socialProof}</span>
            </div>
          )}

          {/* Bottom Row: Pay + Apply Button */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gradient-primary">{opportunity.pay}</span>
              <span className="ml-3 badge badge-purple">{opportunity.type}</span>
            </div>
            <button
              onClick={() => onApply(opportunity.id)}
              className="btn-primary flex items-center gap-2 group/btn relative overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-pulse transition-opacity" />
              <span className="relative z-10">🚀 Apply Instantly</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
