import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Plus, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_visual-evolution/artifacts/l0gczbs1_background_AI-removebg-preview%20%281%29.png';

export default function DashboardNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Opportunities', path: '/opportunities' },
    { label: 'Gigs Near Me', path: '/gigs-near-me' },
    { label: 'Post Project', path: '/projects/new', icon: Plus },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
              <img src={LOGO_URL} alt="Hapployed" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-foreground hidden sm:inline">Hapployed</span>
            </button>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`font-medium transition-colors flex items-center gap-1 ${
                      isActive(item.path)
                        ? 'text-primary'
                        : 'text-foreground hover:text-primary'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            >
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`}
                alt="User" 
                className="w-full h-full object-cover"
              />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-xl py-2">
                <div className="px-4 py-2 border-b border-border">
                  <p className="font-semibold text-foreground text-sm">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Link
                  to="/settings/my-info"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-sm w-full text-left text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}