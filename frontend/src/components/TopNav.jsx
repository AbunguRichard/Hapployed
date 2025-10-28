import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkMode } from '../context/WorkModeContext';
import { 
  LayoutDashboard, Zap, Briefcase, UserSearch, Calendar, 
  Mail, Plus, ChevronDown, User, LogOut, Settings
} from 'lucide-react';

export default function TopNav() {
  const { mode, setMode } = useWorkMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    navigate(newMode === 'gig' ? '/gig/dashboard' : '/pro/dashboard');
  };

  const NavButton = ({ children, onClick, hasDropdown, isActive }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium transition-all ${
        isActive 
          ? 'border-orange-500 bg-orange-50 text-orange-700'
          : 'border-orange-500 bg-blue-50 text-gray-700 hover:bg-orange-50'
      }`}
    >
      {children}
      {hasDropdown && <ChevronDown className="w-4 h-4" />}
    </button>
  );

  const Dropdown = ({ items, isOpen }) => {
    if (!isOpen) return null;
    return (
      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              to={item.link}
              onClick={() => setOpenDropdown(null)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <Icon className="w-5 h-5 text-purple-600" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    );
  };

  const gigWorkItems = [
    { label: 'Post Gig (QuickHire)', link: '/gig/post', icon: Plus },
    { label: 'Nearby Gigs', link: '/gig/find', icon: Zap },
    { label: 'Gig Dashboard', link: '/gig/dashboard', icon: LayoutDashboard },
  ];

  const proProjectItems = [
    { label: 'Browse Projects', link: '/pro/find', icon: Briefcase },
    { label: 'Post Project', link: '/pro/post', icon: Plus },
    { label: 'Project Dashboard', link: '/pro/dashboard', icon: LayoutDashboard },
  ];

  const engagementsItems = [
    { label: 'My Gigs', link: '/me/gigs', icon: Zap },
    { label: 'My Projects', link: '/me/projects', icon: Briefcase },
  ];

  return (
    <div className="bg-blue-50 border-b-2 border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-purple-600 mr-6">
            Hapployed
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {/* Dashboard */}
            <NavButton onClick={() => navigate(`/dashboard?mode=${mode}`)}>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavButton>

            {/* Gig Work Dropdown */}
            <div className="relative">
              <NavButton 
                onClick={() => setOpenDropdown(openDropdown === 'gig' ? null : 'gig')}
                hasDropdown
                isActive={mode === 'gig'}
              >
                <Zap className="w-4 h-4" />
                Gig Work
              </NavButton>
              <Dropdown items={gigWorkItems} isOpen={openDropdown === 'gig'} />
            </div>

            {/* Professional Project Dropdown */}
            <div className="relative">
              <NavButton 
                onClick={() => setOpenDropdown(openDropdown === 'pro' ? null : 'pro')}
                hasDropdown
                isActive={mode === 'pro'}
              >
                <Briefcase className="w-4 h-4" />
                Professional Project
              </NavButton>
              <Dropdown items={proProjectItems} isOpen={openDropdown === 'pro'} />
            </div>

            {/* Find Workers */}
            <NavButton onClick={() => navigate('/talent')}>
              <UserSearch className="w-4 h-4" />
              Find Workers
            </NavButton>

            {/* My Engagements Dropdown */}
            <div className="relative">
              <NavButton onClick={() => setOpenDropdown(openDropdown === 'engage' ? null : 'engage')} hasDropdown>
                <Calendar className="w-4 h-4" />
                My Engagements
              </NavButton>
              <Dropdown items={engagementsItems} isOpen={openDropdown === 'engage'} />
            </div>

            {/* Messages */}
            <NavButton onClick={() => navigate('/messages')}>
              <Mail className="w-4 h-4" />
              Messages
            </NavButton>

            {/* Mode Toggle */}
            <div className="flex items-center border-2 border-orange-500 rounded-full bg-blue-50 p-1">
              <button
                onClick={() => handleModeSwitch('gig')}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                  mode === 'gig' ? 'bg-purple-600 text-white' : 'text-gray-700'
                }`}
              >
                ⚡ Gig
              </button>
              <button
                onClick={() => handleModeSwitch('pro')}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                  mode === 'pro' ? 'bg-blue-600 text-white' : 'text-gray-700'
                }`}
              >
                💼 Pro
              </button>
            </div>

            {/* Post Button */}
            <Link
              to={mode === 'gig' ? '/gig/post' : '/pro/post'}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-full font-bold hover:brightness-110"
            >
              <Plus className="w-5 h-5" />
              Post {mode === 'gig' ? 'Gig' : 'Project'}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
                className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"
              >
                <User className="w-5 h-5" />
              </button>
              {openDropdown === 'user' && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
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
    </div>
  );
}
