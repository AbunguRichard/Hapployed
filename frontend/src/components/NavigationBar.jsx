import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkMode } from '../context/WorkModeContext';
import { useModeContext } from '../context/ModeContext';
import ModeToggle from './ModeToggle';
import { 
  LayoutDashboard, Zap, Briefcase, UserSearch, 
  Calendar, Mail, Plus, ChevronDown, User, LogOut, Settings
} from 'lucide-react';

export default function NavigationBar() {
  const { mode, setMode } = useWorkMode();
  const { user, logout } = useAuth();
  const { currentMode, switchMode, isDualRole } = useModeContext();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const handleModeChange = async (newMode) => {
    try {
      await switchMode(newMode);
      // Refresh the page to show new dashboard
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch mode:', error);
      alert('Failed to switch mode. Please try again.');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    navigate(newMode === 'gig' ? '/gig/dashboard' : '/pro/dashboard');
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className="w-full bg-blue-50 border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link to="/" className="mr-4">
            <span className="text-2xl font-bold text-purple-700">Hapployed</span>
          </Link>

          {/* Dashboard */}
          <Link
            to={`/dashboard?mode=${mode}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black bg-white text-gray-800 font-medium hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          {/* Gig Work with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => toggleDropdown('gig')}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black bg-white text-gray-800 font-medium hover:bg-gray-50 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Gig Work
              <ChevronDown className="w-4 h-4" />
            </button>
            {openDropdown === 'gig' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  to="/gig/post"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                >
                  <Plus className="w-5 h-5 text-purple-600" />
                  Post Gig (QuickHire)
                </Link>
                <Link
                  to="/gig/find"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                >
                  <Zap className="w-5 h-5 text-purple-600" />
                  Nearby Gigs
                </Link>
                <Link
                  to="/gig/dashboard"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                >
                  <LayoutDashboard className="w-5 h-5 text-purple-600" />
                  Gig Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* Professional Project with Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('pro')}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black bg-white text-gray-800 font-medium hover:bg-gray-50 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Professional Project
              <ChevronDown className="w-4 h-4" />
            </button>
            {openDropdown === 'pro' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  to="/pro/find"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                >
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Browse Projects
                </Link>
                <Link
                  to="/pro/post"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                >
                  <Plus className="w-5 h-5 text-purple-600" />
                  Post Project
                </Link>
                <Link
                  to="/pro/dashboard"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                >
                  <LayoutDashboard className="w-5 h-5 text-purple-600" />
                  Project Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* Find Workers */}
          <Link
            to="/talent"
            className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black bg-white text-gray-800 font-medium hover:bg-gray-50 transition-colors"
          >
            <UserSearch className="w-4 h-4" />
            Find Workers
          </Link>

          {/* My Engagements with Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('engage')}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black bg-white text-gray-800 font-medium hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              My Engagements
              <ChevronDown className="w-4 h-4" />
            </button>
            {openDropdown === 'engage' && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  to="/me/gigs"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                >
                  <Zap className="w-5 h-5 text-pink-500" />
                  My Gigs
                </Link>
                <Link
                  to="/me/projects"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                >
                  <Briefcase className="w-5 h-5 text-pink-500" />
                  My Projects
                </Link>
              </div>
            )}
          </div>

          {/* Messages */}
          <Link
            to="/messages"
            className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black bg-white text-gray-800 font-medium hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Messages
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Dual Role Toggle - Employer/Talent (if user has both roles) */}
          {isDualRole && currentMode && (
            <ModeToggle 
              currentMode={currentMode}
              onModeChange={handleModeChange}
            />
          )}

          {/* Post Button */}
          <Link
            to={mode === 'gig' ? '/gig/post' : '/pro/post'}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white rounded-lg font-bold hover:brightness-110 transition-all"
          >
            <Plus className="w-5 h-5" />
            + Post Project/Gigs
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('user')}
              className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
            {openDropdown === 'user' && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
