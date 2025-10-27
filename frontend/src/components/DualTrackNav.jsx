import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkMode } from '../context/WorkModeContext';
import { 
  Briefcase, Zap, LayoutDashboard, UserSearch, 
  Mail, ClipboardList, Plus, ChevronDown, Settings, 
  LogOut, User, Menu, X
} from 'lucide-react';

const gigMenuItems = [
  { title: 'Post Gig (QuickHire)', link: '/gig/post', icon: Plus },
  { title: 'Nearby Gigs', link: '/gig/find', icon: Zap },
  { title: 'Gig Dashboard', link: '/gig/dashboard', icon: LayoutDashboard },
];

const proMenuItems = [
  { title: 'Browse Projects', link: '/pro/find', icon: Briefcase },
  { title: 'Post Project', link: '/pro/post', icon: Plus },
  { title: 'Project Dashboard', link: '/pro/dashboard', icon: LayoutDashboard },
];

const engagementsMenuItems = [
  { title: 'My Gigs', link: '/me/gigs', icon: Zap },
  { title: 'My Projects', link: '/me/projects', icon: Briefcase },
];

const Dropdown = ({ label, items, isActive, buttonClass, ariaLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Handle ESC key to close dropdown
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e, index) => {
    const menuItems = dropdownRef.current?.querySelectorAll('[role="menuitem"]');
    if (!menuItems) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (index + 1) % menuItems.length;
        menuItems[nextIndex]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
        menuItems[prevIndex]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        menuItems[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        menuItems[menuItems.length - 1]?.focus();
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${buttonClass}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={ariaLabel}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div 
          role="menu"
          className="absolute top-full left-0 mt-2 min-w-[240px] bg-white rounded-xl shadow-2xl border-2 border-gray-100 py-2 z-50 animate-fadeIn"
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.link}
                to={item.link}
                role="menuitem"
                tabIndex={0}
                className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors focus:outline-none focus:bg-purple-50"
                onClick={() => setIsOpen(false)}
                onKeyDown={(e) => handleKeyDown(e, index)}
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
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <User className="w-4 h-4" />
        {user?.name || 'Menu'}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 min-w-[200px] bg-white rounded-xl shadow-2xl border-2 border-gray-100 py-2 z-50" role="menu">
          <Link
            to="/profile"
            role="menuitem"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Profile</span>
          </Link>
          <Link
            to="/settings"
            role="menuitem"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Settings</span>
          </Link>
          <div className="border-t border-gray-200 my-2"></div>
          <button
            onClick={handleLogout}
            role="menuitem"
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

const MobileMenu = ({ isOpen, setIsOpen, mode, switchMode }) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
        <div className="p-4">
          {/* Close button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mode Switch */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 border-2 border-gray-200 mb-6">
            <button
              onClick={() => switchMode('gig')}
              className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                mode === 'gig'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-gray-600'
              }`}
            >
              ⚡ Gig
            </button>
            <button
              onClick={() => switchMode('pro')}
              className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                mode === 'pro'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600'
              }`}
            >
              💼 Pro
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>

            {/* Gig Work Section */}
            <div className="pt-4 pb-2">
              <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wide px-4 mb-2">
                ⚡ Gig Work
              </h3>
              {gigMenuItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.link}
                    to={item.link}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-700">{item.title}</span>
                  </Link>
                );
              })}
            </div>

            {/* Professional Work Section */}
            <div className="pt-4 pb-2">
              <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wide px-4 mb-2">
                💼 Professional Work
              </h3>
              {proMenuItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.link}
                    to={item.link}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-700">{item.title}</span>
                  </Link>
                );
              })}
            </div>

            <Link
              to="/find-workers"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <UserSearch className="w-5 h-5" />
              <span className="font-medium">Find Workers</span>
            </Link>

            {/* My Engagements Section */}
            <div className="pt-4 pb-2">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide px-4 mb-2">
                My Engagements
              </h3>
              {engagementsMenuItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.link}
                    to={item.link}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">{item.title}</span>
                  </Link>
                );
              })}
            </div>

            <Link
              to="/messages"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default function DualTrackNav() {
  const { mode, setMode } = useWorkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    // Smart redirect to appropriate dashboard
    navigate(newMode === 'gig' ? '/gig/dashboard' : '/pro/dashboard');
  };

  return (
    <>
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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 flex-1">
              {/* Dashboard */}
              <Link
                to={`/dashboard?mode=${mode}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
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
                ariaLabel="Gig Work menu"
                buttonClass={
                  mode === 'gig'
                    ? 'bg-white border-2 border-orange-500 text-orange-700 shadow-md'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-400 hover:shadow-sm'
                }
              />

              {/* Professional Work Dropdown */}
              <Dropdown
                label={
                  <>
                    <Briefcase className="w-4 h-4" />
                    Professional Project
                  </>
                }
                items={proMenuItems}
                isActive={mode === 'pro'}
                ariaLabel="Professional Project menu"
                buttonClass={
                  mode === 'pro'
                    ? 'bg-white border-2 border-purple-600 text-purple-700 shadow-md'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400 hover:shadow-sm'
                }
              />

              {/* Find Workers */}
              <Link
                to="/talent"
                className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
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
                ariaLabel="My Engagements menu"
                buttonClass="bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm"
              />

              {/* Messages */}
              <Link
                to="/messages"
                className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <Mail className="w-4 h-4" />
                Messages
              </Link>
            </nav>

            {/* Right Side: Mode Switch + Post Button + User Menu (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Mode Toggle Pill */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 border-2 border-gray-200">
                <button
                  onClick={() => switchMode('gig')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    mode === 'gig'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                  title="Switch to Gig Mode"
                  aria-label="Switch to Gig Mode"
                >
                  ⚡ Gig
                </button>
                <button
                  onClick={() => switchMode('pro')}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    mode === 'pro'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                  title="Switch to Professional Mode"
                  aria-label="Switch to Professional Mode"
                >
                  💼 Pro
                </button>
              </div>

              {/* Post CTA */}
              <Link
                to={mode === 'gig' ? '/gig/post' : '/pro/post'}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 text-white font-bold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5" />
                + Post {mode === 'gig' ? 'Gig' : 'Project'}
              </Link>

              {/* User Menu */}
              <UserMenu />
            </div>

            {/* Mobile: Hamburger + Post Button */}
            <div className="flex lg:hidden items-center gap-2 ml-auto">
              <Link
                to={mode === 'gig' ? '/gig/post' : '/pro/post'}
                className="flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold text-sm"
              >
                <Plus className="w-4 h-4" />
                Post
              </Link>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        setIsOpen={setMobileMenuOpen}
        mode={mode}
        switchMode={switchMode}
      />
    </>
  );
}
