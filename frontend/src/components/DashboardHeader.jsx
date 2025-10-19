import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_visual-evolution/artifacts/l0gczbs1_background_AI-removebg-preview%20%281%29.png';

export default function DashboardHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Opportunities', path: '/opportunities' },
    { name: 'Gigs Near Me', path: '/gigs-near-me' }
  ];

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-8">
            <img src={LOGO_URL} alt="Hapployed" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-foreground">Hapployed</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => navigate('/post-project')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Post Project
            </button>
          </nav>

          {/* User Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
