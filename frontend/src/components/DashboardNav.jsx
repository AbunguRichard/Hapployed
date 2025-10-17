import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Opportunities', path: '/opportunities' },
    { label: 'Gigs Near Me', path: '/gigs-near-me' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:inline">Hapployed</span>
            </button>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`}
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}