import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkMode } from '../context/WorkModeContext';
import { 
  Briefcase, Zap, LayoutDashboard, UserSearch, 
  Mail, ClipboardList, Plus, ChevronDown, Settings, LogOut, User
} from 'lucide-react';

const gigMenuItems = [
  { title: 'Post Gig (QuickHire)', link: '/gig/post', icon: Plus },
  { title: 'Nearby Gigs', link: '/gig/find', icon: Zap },
  { title: 'Gig Dashboard', link: '/gig/dashboard', icon: LayoutDashboard },
];

const proMenuItems = [
  { title: 'Browse Projects', link: '/pro/find', icon: Briefcase },
  { title: 'Post Project', link: '/post-project', icon: Plus },
  { title: 'Project Dashboard', link: '/pro/dashboard', icon: LayoutDashboard },
];

const engagementsMenuItems = [
  { title: 'My Gigs', link: '/me/gigs', icon: Zap },
  { title: 'My Projects', link: '/me/projects', icon: Briefcase },
];

const Dropdown = ({ label, items, isActive, buttonClass }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${buttonClass}`}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[240px] bg-white rounded-xl shadow-2xl border-2 border-gray-100 py-2 z-50 animate-fadeIn">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.link}
                to={item.link}
                className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-700">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:brightness-110 transition-all">
        <User className="w-4 h-4" />
        {user?.name || 'Menu'}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 min-w-[200px] bg-white rounded-xl shadow-2xl border-2 border-gray-100 py-2 z-50">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Profile</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Settings</span>
          </Link>
          <div className="border-t border-gray-200 my-2"></div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-600">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function DualTrackNav() {
  const { mode, setMode } = useWorkMode();
  const navigate = useNavigate();

  const switchMode = (newMode) => {
    setMode(newMode);
    // Smart redirect to appropriate dashboard
    navigate(newMode === 'gig' ? '/gig/dashboard' : '/pro/dashboard');
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b-2 border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="mr-4 font-bold text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          >
            Hapployed
          </Link>

          {/* Main Navigation */}
          <nav className="flex items-center gap-2 flex-1">
            {/* Dashboard */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            {/* Gig Work Dropdown */}
            <Dropdown
              label={
                <>
                  <Zap className="w-4 h-4" />
                  Gig Work
                </>
              }
              items={gigMenuItems}
              isActive={mode === 'gig'}
              buttonClass={
                mode === 'gig'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-400'
              }
            />

            {/* Professional Work Dropdown */}
            <Dropdown
              label={
                <>
                  <Briefcase className="w-4 h-4" />
                  Professional Work
                </>
              }
              items={proMenuItems}
              isActive={mode === 'pro'}
              buttonClass={
                mode === 'pro'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400'
              }
            />

            {/* Find Workers */}
            <Link
              to="/find-workers"
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-all"
            >
              <UserSearch className="w-4 h-4" />
              Find Workers
            </Link>

            {/* My Engagements Dropdown */}
            <Dropdown
              label={
                <>
                  <ClipboardList className="w-4 h-4" />
                  My Engagements
                </>
              }
              items={engagementsMenuItems}
              buttonClass="bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400"
            />

            {/* Messages */}
            <Link
              to="/messages"
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-all"
            >
              <Mail className="w-4 h-4" />
              Messages
            </Link>
          </nav>

          {/* Right Side: Mode Switch + Post Button + User Menu */}
          <div className="flex items-center gap-3">
            {/* Mode Toggle Pill */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 border-2 border-gray-200">
              <button
                onClick={() => switchMode('gig')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  mode === 'gig'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-white'
                }`}
                title="Switch to Gig Mode"
              >
                ⚡ Gig
              </button>
              <button
                onClick={() => switchMode('pro')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  mode === 'pro'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-white'
                }`}
                title="Switch to Professional Mode"
              >
                💼 Pro
              </button>
            </div>

            {/* Post CTA */}
            <Link
              to={mode === 'gig' ? '/gig/post' : '/post-project'}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:brightness-110 text-white font-bold shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Post {mode === 'gig' ? 'Gig' : 'Project'}
            </Link>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
