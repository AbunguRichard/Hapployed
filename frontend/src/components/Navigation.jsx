import React, { useState } from 'react';
import { Menu, X, Home, LayoutDashboard, Briefcase, MapPin, Users, PlusCircle, MessageSquare, User } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '#', active: true },
    { icon: Briefcase, label: 'Opportunities', href: '#' },
    { icon: MapPin, label: 'Gigs Near Me', href: '#' },
    { icon: Users, label: 'Browse Talent', href: '#' },
    { icon: PlusCircle, label: 'Post Project', href: '#' },
  ];

  return (
    <nav className="glass sticky top-0 z-50 border-b border-primary/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center glow-primary">
              <span className="text-xl font-bold text-background">O</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:inline">OpportunityHub</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    item.active
                      ? 'bg-primary/10 text-primary neon-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg glass-strong hover:bg-accent/10 transition-all hover-lift">
              <MessageSquare className="w-5 h-5 text-foreground" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full text-xs flex items-center justify-center text-background font-semibold glow-accent">
                3
              </span>
            </button>
            
            <button className="flex items-center gap-2 glass-strong px-3 py-2 rounded-lg hover:bg-accent/10 transition-all hover-lift">
              <div className="w-8 h-8 rounded-full bg-gradient-secondary overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser" 
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-foreground hidden md:inline">Test User</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg glass-strong hover:bg-accent/10 transition-all"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-primary/20 space-y-1 animate-slide-in">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    item.active
                      ? 'bg-primary/10 text-primary neon-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}