import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, CreditCard, Lock, Users, Crown, Bell, FileText, Link2, AlertCircle,
  Search, ChevronRight, Save, AlertTriangle
} from 'lucide-react';
import ProfileLayout from '../components/ProfileLayout';
import { useAuth } from '../context/AuthContext';

// Section Components
import MyInfoSection from '../components/settings/MyInfoSection';
import BillingSection from '../components/settings/BillingSection';
import SecuritySection from '../components/settings/SecuritySection';
import TeamsSection from '../components/settings/TeamsSection';
import MembershipSection from '../components/settings/MembershipSection';
import NotificationsSection from '../components/settings/NotificationsSection';
import TaxInfoSection from '../components/settings/TaxInfoSection';
import ConnectedServicesSection from '../components/settings/ConnectedServicesSection';
import AppealsSection from '../components/settings/AppealsSection';

const SECTIONS = [
  { id: 'my-info', label: 'My Info', icon: User, component: MyInfoSection },
  { id: 'billing', label: 'Billing & Payments', icon: CreditCard, component: BillingSection },
  { id: 'security', label: 'Password & Security', icon: Lock, component: SecuritySection },
  { id: 'teams', label: 'Teams & Members', icon: Users, component: TeamsSection },
  { id: 'membership', label: 'Membership', icon: Crown, component: MembershipSection },
  { id: 'notifications', label: 'Notification Settings', icon: Bell, component: NotificationsSection },
  { id: 'tax', label: 'Tax Information', icon: FileText, component: TaxInfoSection },
  { id: 'connected', label: 'Connected Services', icon: Link2, component: ConnectedServicesSection },
  { id: 'appeals', label: 'Appeals Tracker', icon: AlertCircle, component: AppealsSection },
];

export default function SettingsPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState('my-info');

  const currentSection = section || 'my-info';
  const CurrentComponent = SECTIONS.find(s => s.id === currentSection)?.component || MyInfoSection;

  // Unsaved changes guard
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const filteredSections = SECTIONS.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProfileLayout currentSection="settings">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Settings Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Type to find a setting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Settings Sub-Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {filteredSections.map((sect) => {
            const Icon = sect.icon;
            const isActive = currentSection === sect.id;
            
            return (
              <button
                key={sect.id}
                onClick={() => {
                  setActiveSubSection(sect.id);
                  navigate(`/settings/${sect.id}`);
                }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isActive
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-purple-600' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <span className={`font-semibold ${isActive ? 'text-purple-600' : 'text-gray-900'}`}>
                    {sect.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Section Content */}
        <div className="p-6 border-t border-gray-200">
          <CurrentComponent 
            user={user}
            onSave={() => setHasUnsavedChanges(false)}
            onChange={() => setHasUnsavedChanges(true)}
          />
        </div>
      </div>
    </ProfileLayout>
  );
}
