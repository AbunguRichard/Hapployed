import React, { useState, useEffect } from 'react';
import { Crown, Check, Zap, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Star,
    color: 'from-gray-500 to-gray-600',
    features: [
      'Up to 5 applications per month',
      'Basic profile',
      'Standard support',
      'Access to public gigs'
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    popular: false,
    features: [
      'Unlimited applications',
      'Featured profile badge',
      'Priority support',
      'Early access to premium gigs',
      'Advanced analytics'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    icon: Zap,
    color: 'from-purple-500 to-pink-600',
    popular: true,
    features: [
      'Everything in Basic',
      'AI-powered job matching',
      'Dedicated account manager',
      'Custom portfolio showcase',
      'Skip-the-line verification',
      'Invoice & tax tools'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    features: [
      'Everything in Pro',
      'Team collaboration tools',
      'Bulk hiring features',
      'Custom integrations',
      'White-label options',
      'Enterprise SLA'
    ]
  }
];

export default function MembershipSection({ user, onUnsavedChanges }) {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembership();
  }, []);

  const fetchMembership = async () => {
    try {
      const userId = user?.id || 'test-user';
      const res = await fetch(`${BACKEND_URL}/api/settings/membership/${userId}`);
      const data = await res.json();
      setCurrentPlan(data.plan);
    } catch (error) {
      console.error('Error fetching membership:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      const userId = user?.id || 'test-user';
      await fetch(`${BACKEND_URL}/api/settings/membership/${userId}/upgrade?plan=${planId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success(`Upgraded to ${planId} plan successfully!`);
      fetchMembership();
    } catch (error) {
      toast.error('Failed to upgrade plan');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Membership</h2>
        <p className="text-muted-foreground">Choose the plan that fits your needs.</p>
      </div>

      {/* Current Plan */}
      <div className="p-6 border-2 border-primary rounded-lg bg-primary/5">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-6 h-6 text-primary" />
          <p className="font-semibold text-foreground text-lg">Current Plan: {currentPlan?.toUpperCase() || 'FREE'}</p>
        </div>
        <p className="text-sm text-muted-foreground">Your plan renews on the 1st of each month</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`relative p-6 border-2 rounded-2xl transition-all ${
                isCurrentPlan
                  ? 'border-primary shadow-lg'
                  : 'border-border hover:border-primary/50 hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrentPlan}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  isCurrentPlan
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg hover:scale-105`
                }`}
              >
                {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
