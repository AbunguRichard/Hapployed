import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Zap, Briefcase, Gauge, Plus, ClipboardList, MessageSquare, User, Settings, CreditCard, Bell, Shield, HelpCircle, LogOut, ChevronDown, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QuickHireModal from './QuickHireModal';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_visual-evolution/artifacts/l0gczbs1_background_AI-removebg-preview%20%281%29.png';

export default function DashboardHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isQuickHireModalOpen, setIsQuickHireModalOpen] = useState(false);
  const [isQuickHireDropdownOpen, setIsQuickHireDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const quickHireDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (quickHireDropdownRef.current && !quickHireDropdownRef.current.contains(event.target)) {
        setIsQuickHireDropdownOpen(false);
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
      name: 'Dashboard', 
      path: '/dashboard',
    },
    { 
      name: 'Find Work', 
      path: '/opportunities',
    },
    { 
      name: 'Quick Hire', 
      hasDropdown: true,
      dropdownItems: [
        { name: 'Post QuickHire', path: '/quickhire/post' },
        { name: 'Worker Dashboard', path: '/quickhire/worker' },
        { name: 'QuickHire Info', path: '/quickhire-info' }
      ]
    },
    { 
      name: 'Find Gigs', 
      path: '/gigs-near-me',
    },
    { 
      name: 'Find Workers', 
      path: '/find-workers',
    },
    { 
      name: 'My Jobs', 
      path: '/manage-jobs',
    },
    { 
      name: 'Messages', 
      path: '/messages',
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

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-300 via-cyan-300 to-blue-300 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-b from-yellow-200 to-yellow-300 rounded-full flex flex-col items-center justify-end overflow-hidden">
                  <div className="w-5 h-5 bg-yellow-600 rounded-full mb-1"></div>
                  <div className="w-8 h-5 bg-cyan-400 rounded-t-full"></div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{user?.name || 'John Doe'}</p>
                  <p className="text-sm text-gray-600">{user?.email || 'john@example.com'}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => { navigate('/profile'); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                  >
                    <User className="w-5 h-5" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => { navigate('/settings'); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => { navigate('/billing'); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Billing & Payments</span>
                  </button>

                  <button
                    onClick={() => { navigate('/notifications-settings'); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                  >
                    <Bell className="w-5 h-5" />
                    <span>Notification Settings</span>
                  </button>

                  <button
                    onClick={() => { navigate('/privacy-security'); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Privacy & Security</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={() => { navigate('/switch-account'); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Switch Account Type</span>
                  </button>

                  <button
                    onClick={() => { navigate('/help'); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span>Help & Support</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={() => { logout(); navigate('/auth/login'); setIsProfileDropdownOpen(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
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
