import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Zap, Briefcase, Gauge, Plus, ClipboardList, MessageSquare, User, Settings, CreditCard, Bell, Shield, HelpCircle, LogOut, ChevronDown, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QuickHireModal from './QuickHireModal';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_visual-evolution/artifacts/l0gczbs1_background_AI-removebg-preview%20%281%29.png';

export default function DashboardHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isQuickHireModalOpen, setIsQuickHireModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { 
      name: 'Home', 
      path: '/',
      icon: Home,
      gradient: 'from-orange-400 via-red-400 to-green-400'
    },
    { 
      name: 'Dashboard', 
      path: '/dashboard',
      icon: Gauge,
      iconColor: 'text-gray-800'
    },
    { 
      name: 'Find Work', 
      path: '/find-work',
      icon: Search,
      gradient: 'from-purple-500 to-blue-500'
    },
    { 
      name: 'Quick Hire', 
      path: '/quickhire-info',
      icon: Plus,
      gradient: 'from-purple-600 to-blue-500',
      isButton: true,
      onClick: () => setIsQuickHireModalOpen(true)
    },
    { 
      name: 'Find Gigs', 
      path: '/gigs-near-me',
      icon: Briefcase,
      iconColor: 'text-red-800'
    },
    { 
      name: 'Find Projects', 
      path: '/opportunities',
      icon: Briefcase,
      iconColor: 'text-green-500',
      outlined: true
    },
    { 
      name: 'My Jobs', 
      path: '/my-jobs',
      icon: ClipboardList,
      iconColor: 'text-blue-600'
    },
    { 
      name: 'Messages', 
      path: '/messages',
      icon: MessageSquare,
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center mr-8">
            <img src={LOGO_URL} alt="Hapployed" className="w-16 h-16 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              if (item.isButton) {
                return (
                  <button
                    key={item.path}
                    onClick={item.onClick || (() => navigate(item.path))}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {item.name}
                    </span>
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center gap-1 group"
                >
                  {item.gradient ? (
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                      <Icon 
                        className={`w-6 h-6 ${item.iconColor}`} 
                        strokeWidth={item.outlined ? 1.5 : 2}
                      />
                    </div>
                  )}
                  <span className={`text-xs font-medium ${active ? 'text-purple-600' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
            
            {/* Post Project Button */}
            <button
              onClick={() => navigate('/post-project')}
              className="flex flex-col items-center gap-1 group ml-6"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors shadow-md">
                <Plus className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">Post Project</span>
              </div>
            </button>
          </nav>

          {/* User Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-300 via-cyan-300 to-blue-300 flex items-center justify-center">
              {/* Simple avatar illustration */}
              <div className="w-full h-full bg-gradient-to-b from-yellow-200 to-yellow-300 rounded-full flex flex-col items-center justify-end overflow-hidden">
                <div className="w-6 h-6 bg-yellow-600 rounded-full mb-1"></div>
                <div className="w-10 h-6 bg-cyan-400 rounded-t-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Hire Modal */}
      <QuickHireModal 
        isOpen={isQuickHireModalOpen} 
        onClose={() => setIsQuickHireModalOpen(false)} 
      />
    </header>
  );
}
