import React from 'react';
import { Brain, Shield, Sparkles, TrendingUp } from 'lucide-react';

export default function StatsGrid() {
  const stats = [
    {
      icon: Brain,
      title: 'Behavioral Archetype',
      value: 'Meticulous Planner',
      details: [
        { label: 'planner', value: '100%' },
        { label: 'creative', value: '0%' },
        { label: 'executor', value: '0%' },
      ],
      color: 'primary',
      glow: 'glow-primary',
    },
    {
      icon: Shield,
      title: 'Trust Score',
      value: '50/100',
      subtitle: '0 verified skills',
      color: 'accent',
      glow: 'glow-accent',
      showProgress: true,
      progress: 50,
    },
    {
      icon: Sparkles,
      title: 'New Opportunities',
      value: '0',
      subtitle: 'Oracle predictions available',
      color: 'secondary',
      glow: 'glow-secondary',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`glass-strong rounded-2xl p-6 hover-lift transition-all duration-300 neon-border group relative overflow-hidden`}
          >
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <Icon className={`w-4 h-4 text-${stat.color}`} />
                  {stat.title}
                </span>
                <div className={`w-8 h-8 rounded-lg bg-${stat.color}/10 flex items-center justify-center ${stat.glow}`}>
                  <TrendingUp className={`w-4 h-4 text-${stat.color}`} />
                </div>
              </div>

              {/* Value */}
              <div className="mb-3">
                <h3 className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </h3>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                )}
              </div>

              {/* Progress Bar */}
              {stat.showProgress && (
                <div className="mb-3">
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${stat.color} to-${stat.color}-glow transition-all duration-1000 ${stat.glow}`}
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Details */}
              {stat.details && (
                <div className="flex items-center gap-4">
                  {stat.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{detail.label}:</span>
                      <span className={`text-xs font-semibold text-${stat.color}`}>{detail.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}