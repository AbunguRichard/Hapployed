import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, CreditCard, Lock, Users, Crown, Bell, FileText, Link2, AlertCircle,
  Search, ChevronRight, Save, AlertTriangle
} from 'lucide-react';
import DashboardNav from '../components/DashboardNav';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 relative">
      {/* Subtle Background Texture */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <DashboardNav />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 relative z-10">
        {/* Decorative Background Blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Settings</span>
          {currentSection !== 'my-info' && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">
                {SECTIONS.find(s => s.id === currentSection)?.label}
              </span>
            </>
          )}
        </div>

        {/* Main Title */}
        <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Decorative Card Background */}
              <div className="absolute -inset-4 bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl -z-10" />
              
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Type to find a setting..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {filteredSections.map(({ id, label, icon: Icon }) => (
                  <Link
                    key={id}
                    to={`/settings/${id}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      currentSection === id
                        ? 'bg-primary text-white shadow-md'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Unsaved Changes Warning */}
            {hasUnsavedChanges && (
              <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3 backdrop-blur-sm">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">You have unsaved changes</p>
                  <p className="text-sm text-muted-foreground">Make sure to save your changes before leaving this page.</p>
                </div>
              </div>
            )}

            {/* Dynamic Section Content */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
              <CurrentComponent 
                user={user} 
                onUnsavedChanges={setHasUnsavedChanges}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
