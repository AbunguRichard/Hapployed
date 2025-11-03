import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import { ArrowLeft, Settings, ToggleLeft, ToggleRight, Eye, EyeOff, Check } from 'lucide-react';

export default function ManageMenuPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRecruiter = user?.currentMode === 'employer';

  // State for menu toggles
  const [menuSettings, setMenuSettings] = useState({
    showDashboard: true,
    showJobs: true,
    showCandidates: true,
    showInterviews: true,
    showManageMenu: true,
    showRatings: true,
    showSettings: true,
    showPayments: false,
    showAccounts: false,
    showHub: false
  });

  const [saved, setSaved] = useState(false);

  const handleReturn = () => {
    if (isRecruiter) {
      navigate('/recruiter-dashboard');
    } else {
      navigate('/epic-worker-dashboard');
    }
  };

  const toggleMenuItem = (key) => {
    setMenuSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // In production, this would save to backend
    localStorage.setItem('menuSettings', JSON.stringify(menuSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setMenuSettings({
      showDashboard: true,
      showJobs: true,
      showCandidates: true,
      showInterviews: true,
      showManageMenu: true,
      showRatings: true,
      showSettings: true,
      showPayments: false,
      showAccounts: false,
      showHub: false
    });
    setSaved(false);
  };

  return (
    <div style={{ backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      <DashboardHeader />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Return Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleReturn}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Manage Menu</h1>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>Customize your sidebar navigation.</strong> Toggle menu items on or off to personalize your dashboard experience.
          </p>
        </div>

        {/* Save Status */}
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Settings saved successfully!</span>
          </div>
        )}

        {/* Menu Sections */}
        <div className="space-y-6">
          {/* MAIN Section */}
          <MenuSection 
            title="MAIN Section" 
            description="Core navigation items for your dashboard"
          >
            <MenuItem 
              label="Dashboard" 
              enabled={menuSettings.showDashboard} 
              onToggle={() => toggleMenuItem('showDashboard')}
              locked={true}
            />
            <MenuItem 
              label="Jobs" 
              enabled={menuSettings.showJobs} 
              onToggle={() => toggleMenuItem('showJobs')}
            />
            <MenuItem 
              label="Candidates" 
              enabled={menuSettings.showCandidates} 
              onToggle={() => toggleMenuItem('showCandidates')}
            />
            <MenuItem 
              label="Interviews" 
              enabled={menuSettings.showInterviews} 
              onToggle={() => toggleMenuItem('showInterviews')}
            />
          </MenuSection>

          {/* MANAGE Section */}
          <MenuSection 
            title="MANAGE Section" 
            description="Administrative and management tools"
          >
            <MenuItem 
              label="Manage Menu" 
              enabled={menuSettings.showManageMenu} 
              onToggle={() => toggleMenuItem('showManageMenu')}
            />
            <MenuItem 
              label="Interviewer Ratings" 
              enabled={menuSettings.showRatings} 
              onToggle={() => toggleMenuItem('showRatings')}
            />
            <MenuItem 
              label="Settings" 
              enabled={menuSettings.showSettings} 
              onToggle={() => toggleMenuItem('showSettings')}
              locked={true}
            />
          </MenuSection>

          {/* ORGANIZATION Section */}
          <MenuSection 
            title="ORGANIZATION Section" 
            description="Enterprise and organizational features"
          >
            <MenuItem 
              label="Payments" 
              enabled={menuSettings.showPayments} 
              onToggle={() => toggleMenuItem('showPayments')}
              badge="Pro"
            />
            <MenuItem 
              label="Accounts" 
              enabled={menuSettings.showAccounts} 
              onToggle={() => toggleMenuItem('showAccounts')}
              badge="Enterprise"
            />
            <MenuItem 
              label="Hub" 
              enabled={menuSettings.showHub} 
              onToggle={() => toggleMenuItem('showHub')}
              badge="Coming Soon"
            />
          </MenuSection>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Save Changes
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuSection({ title, description, children }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function MenuItem({ label, enabled, onToggle, locked, badge }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        {enabled ? (
          <Eye className="w-5 h-5 text-green-600" />
        ) : (
          <EyeOff className="w-5 h-5 text-gray-400" />
        )}
        <span className={`font-medium ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>
          {label}
        </span>
        {locked && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
            Required
          </span>
        )}
        {badge && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
            {badge}
          </span>
        )}
      </div>
      <button
        onClick={onToggle}
        disabled={locked}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
          locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${enabled ? 'bg-purple-600' : 'bg-gray-300'}`}
      >
        <span
          className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}