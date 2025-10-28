import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, CreditCard, Bell, Shield, RefreshCw, HelpCircle, LogOut } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import { useAuth } from '../context/AuthContext';

export default function ProfileLayout({ children, currentSection }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const menuItems = [
    { id: 'profile', label: 'View Profile', icon: User, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard, path: '/billing' },
    { id: 'notifications', label: 'Notification Settings', icon: Bell, path: '/notifications-settings' },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield, path: '/privacy-security' },
    { id: 'switch', label: 'Switch Account Type', icon: RefreshCw, path: '/switch-account' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/help' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              {/* User Info */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-300 via-cyan-300 to-blue-300 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-b from-yellow-200 to-yellow-300 rounded-full flex flex-col items-center justify-end overflow-hidden">
                      <div className="w-6 h-6 bg-yellow-600 rounded-full mb-1"></div>
                      <div className="w-10 h-6 bg-cyan-400 rounded-t-full"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">{user?.name || 'John Doe'}</p>
                    <p className="text-sm text-gray-600">{user?.email || 'john@example.com'}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="py-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                        isActive
                          ? 'bg-purple-50 text-purple-600 border-r-4 border-purple-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
                
                {/* Divider */}
                <div className="my-2 border-t border-gray-200"></div>
                
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-6 py-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Log Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
