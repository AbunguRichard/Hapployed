import React from 'react';
import { Crown, TrendingUp, Zap, Users, CheckCircle } from 'lucide-react';

export default function MembershipSection({ user, onUnsavedChanges }) {
  const currentPlan = {
    name: 'Professional',
    price: 29,
    interval: 'month',
    nextBilling: 'Dec 1, 2024',
    features: ['Unlimited projects', '10 team members', 'AI credits: 1000/mo', 'Priority support']
  };

  const usage = {
    seats: { used: 3, total: 10 },
    projects: { used: 12, total: 'unlimited' },
    aiCredits: { used: 450, total: 1000 }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Membership</h2>
        <p className="text-muted-foreground">Manage your plan, billing, and usage.</p>
      </div>

      {/* Current Plan Card */}
      <div className="p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{currentPlan.name}</h3>
              <p className="text-muted-foreground">Active subscription</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">${currentPlan.price}</p>
            <p className="text-sm text-muted-foreground">per {currentPlan.interval}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {currentPlan.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">Next billing: {currentPlan.nextBilling}</p>
          <div className="flex gap-3">
            <button className="btn-secondary">Change Plan</button>
            <button className="btn-primary">Upgrade</button>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Usage This Month</h3>
        <div className="space-y-4">
          {/* Seats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Team Seats</span>
              </div>
              <span className="text-sm text-muted-foreground">{usage.seats.used} / {usage.seats.total}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(usage.seats.used / usage.seats.total) * 100}%` }} />
            </div>
          </div>

          {/* AI Credits */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">AI Credits</span>
              </div>
              <span className="text-sm text-muted-foreground">{usage.aiCredits.used} / {usage.aiCredits.total}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${(usage.aiCredits.used / usage.aiCredits.total) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="p-6 border border-border rounded-lg">
        <h3 className="font-semibold text-foreground mb-4">Manage Subscription</h3>
        <div className="space-y-3">
          <button className="w-full p-3 border border-border rounded-lg text-left hover:bg-muted transition-colors">
            View Billing History
          </button>
          <button className="w-full p-3 border border-border rounded-lg text-left hover:bg-muted transition-colors">
            Update Payment Method
          </button>
          <button className="w-full p-3 border border-red-500/30 text-red-500 rounded-lg text-left hover:bg-red-500/10 transition-colors">
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
}