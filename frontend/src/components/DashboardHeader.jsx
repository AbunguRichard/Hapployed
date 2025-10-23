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
    <header className="bg-[#FFE5D4] sticky top-0 z-50 border-b-2 border-gray-300">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center mr-8">
            <img src={LOGO_URL} alt="Hapployed" className="w-16 h-16 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 flex-1">
            {navItems.map((item, index) => {
              const active = item.path && isActive(item.path);
              
              if (item.hasDropdown) {
                return (
                  <div key={index} className="relative" ref={quickHireDropdownRef}>
                    <button
                      onClick={() => setIsQuickHireDropdownOpen(!isQuickHireDropdownOpen)}
                      className={`px-5 py-2.5 rounded-lg border-2 border-black bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                        active ? 'bg-purple-50' : ''
                      }`}
                    >
                      <span className="text-sm font-semibold text-black">{item.name}</span>
                      <ChevronDown className={`w-4 h-4 text-black transition-transform ${isQuickHireDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Quick Hire Dropdown */}
                    {isQuickHireDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border-2 border-black py-2 z-50">
                        {item.dropdownItems.map((dropdownItem) => (
                          <button
                            key={dropdownItem.path}
                            onClick={() => {
                              navigate(dropdownItem.path);
                              setIsQuickHireDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm font-medium text-black"
                          >
                            {dropdownItem.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-5 py-2.5 rounded-lg border-2 border-black bg-white hover:bg-gray-50 transition-colors ${
                    active ? 'bg-purple-50' : ''
                  }`}
                >
                  <span className="text-sm font-semibold text-black">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Post Project/Gigs Button */}
            <button
              onClick={() => navigate('/post-project')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold text-white">Post Project/Gigs</span>
            </button>

            {/* User Avatar with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <User className="w-10 h-10 text-green-600 stroke-[2.5]" />
                <ChevronDown className={`w-4 h-4 text-black transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border-2 border-black py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b-2 border-gray-200">
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

                  <div className="border-t-2 border-gray-200 py-2">
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

                  <div className="border-t-2 border-gray-200 py-2">
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
      </div>
      
      {/* Quick Hire Modal */}
      <QuickHireModal 
        isOpen={isQuickHireModalOpen} 
        onClose={() => setIsQuickHireModalOpen(false)} 
      />
    </header>
  );
}
