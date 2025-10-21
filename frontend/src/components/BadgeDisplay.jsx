import React from 'react';
import { Shield, Award, Star, CheckCircle } from 'lucide-react';

const BADGE_CONFIG = {
  'gov-verified': {
    name: 'Gov-Verified',
    icon: Shield,
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    description: 'Government ID & background verified'
  },
  'pro-verified': {
    name: 'Pro-Verified',
    icon: Award,
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    description: 'Professional skills tested & verified'
  },
  'community-trusted': {
    name: 'Community-Trusted',
    icon: Star,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    description: 'Highly rated by community (4.5+ stars)'
  }
};

export default function BadgeDisplay({ badges = [], size = 'medium', showTooltip = true }) {
  if (!badges || badges.length === 0) {
    return null;
  }

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => {
        const config = BADGE_CONFIG[badge.badge_type];
        if (!config) return null;

        const Icon = config.icon;

        return (
          <div
            key={index}
            className={`group relative inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]} font-semibold transition-all hover:shadow-md`}
          >
            <Icon className={iconSizes[size]} />
            <span>{config.name}</span>
            <CheckCircle className={`${iconSizes[size]} opacity-80`} />
            
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {config.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Badge Filter Component
export function BadgeFilter({ selectedBadges = [], onBadgeToggle }) {
  const allBadges = Object.entries(BADGE_CONFIG);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <Shield className="w-4 h-4 text-purple-600" />
        Verified Workforce
      </h3>
      <div className="space-y-2">
        {allBadges.map(([badgeType, config]) => {
          const Icon = config.icon;
          const isSelected = selectedBadges.includes(badgeType);

          return (
            <button
              key={badgeType}
              onClick={() => onBadgeToggle(badgeType)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? `${config.bgColor} ${config.borderColor} shadow-md`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bgColor} ${config.textColor} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className={`text-sm font-semibold ${isSelected ? config.textColor : 'text-gray-900'}`}>
                  {config.name}
                </div>
                <div className="text-xs text-gray-600">
                  {config.description}
                </div>
              </div>
              {isSelected && (
                <CheckCircle className={`w-5 h-5 ${config.textColor}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Badge Stats Component
export function BadgeStats({ badges = [] }) {
  const badgeCount = badges.length;
  
  if (badgeCount === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-full">
      <Shield className="w-4 h-4 text-purple-600" />
      <span className="text-sm font-semibold text-purple-700">
        {badgeCount} Verification{badgeCount > 1 ? 's' : ''}
      </span>
    </div>
  );
}
