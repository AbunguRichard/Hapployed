import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function WorkerDashboardPage() {
  const { user, switchMode } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [stats, setStats] = useState({
    availableJobs: 24,
    activeGigs: 3,
    pendingApplications: 5,
    weeklyEarnings: 1240
  });

  const handleSwitchMode = async () => {
    if (!user?.roles?.includes('employer')) {
      alert('You need to add the Recruiter role first to switch to Recruiter mode.');
      return;
    }
    try {
      setSwitching(true);
      await switchMode('employer');
      navigate('/recruiter-dashboard');
    } catch (error) {
      console.error('Failed to switch mode:', error);
      alert('Failed to switch mode. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/worker-dashboard/stats/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          availableJobs: data.available_jobs || 24,
          activeGigs: data.active_gigs || 3,
          pendingApplications: data.pending_applications || 5,
          weeklyEarnings: data.weekly_earnings || 1240
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const workerDashboardItems = [
    { icon: '🏠', label: 'Dashboard Home', checked: true },
    { icon: '📡', label: 'Job Feed', checked: false },
    { icon: '📄', label: 'My Applications', checked: true },
    { icon: '💼', label: 'Active Gigs', checked: true },
    { icon: '✅', label: 'Completed Work', checked: true },
    { icon: '💬', label: 'Messages', checked: true },
    { icon: '💵', label: 'My Earnings', checked: true },
    { icon: '👤', label: 'Profile & Reputation', checked: false },
    { icon: '📚', label: 'Resources', checked: true },
    { icon: '⚙️', label: 'Settings', checked: true }
  ];

  return (
    <div style={{ backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      <DashboardHeader />
      
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        {/* Sidebar */}
        <div style={{
          width: '260px',
          background: 'linear-gradient(180deg, #4361ee 0%, #3f37c9 100%)',
          color: 'white',
          padding: '1.5rem 1rem',
          minHeight: 'calc(100vh - 70px)',
          position: 'fixed',
          left: 0,
          top: '70px',
          overflowY: 'auto',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', padding: '0 0.5rem' }}>
            <i className="fas fa-handshake" style={{ fontSize: '1.8rem' }}></i>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Hapployed</h1>
          </div>

          <SidebarSection title="MAIN">
            <SidebarLink icon="home" label="Dashboard" active={activeNav === 'dashboard'} onClick={() => setActiveNav('dashboard')} />
            <SidebarLink icon="briefcase" label="Jobs" active={activeNav === 'jobs'} onClick={() => setActiveNav('jobs')} />
            <SidebarLink icon="users" label="Candidates" active={activeNav === 'candidates'} onClick={() => setActiveNav('candidates')} />
            <SidebarLink icon="calendar-alt" label="Interviews" active={activeNav === 'interviews'} onClick={() => setActiveNav('interviews')} />
            <SidebarLink icon="envelope" label="Messages" active={activeNav === 'messages'} onClick={() => setActiveNav('messages')} />
          </SidebarSection>

          <SidebarSection title="MANAGE">
            <SidebarLink icon="sliders-h" label="Manage Menu" />
            <SidebarLink icon="star" label="Interviewer Ratings" />
            <SidebarLink icon="print" label="Prints" />
            <SidebarLink icon="cog" label="Settings" />
          </SidebarSection>

          <SidebarSection title="ORGANIZATION">
            <SidebarLink icon="credit-card" label="Payments" />
            <SidebarLink icon="user-cog" label="Accounts" />
            <SidebarLink icon="hubspot" label="Hub" />
          </SidebarSection>
        </div>

        {/* Main Content */}
        <div style={{ marginLeft: '260px', flex: 1, padding: '2rem', width: 'calc(100% - 260px)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#212529' }}>Talent Dashboard</h1>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'white',
                borderRadius: '50px',
                padding: '0.5rem 1rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <i className="fas fa-search" style={{ marginRight: '0.5rem', color: '#6c757d' }}></i>
                <input
                  type="text"
                  placeholder="Search candidates, jobs..."
                  style={{ border: 'none', outline: 'none', padding: '0.5rem', width: '250px' }}
                />
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#4361ee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {user?.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.name || 'Talent'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Recruiter</div>
                </div>
              </div>
            </div>
          </div>

          {/* Role Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            background: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <span style={{
              background: '#4361ee',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              Talent Mode
            </span>
            <button
              onClick={handleSwitchMode}
              disabled={switching}
              style={{
                background: '#f8f9fa',
                border: '2px solid #e9ecef',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {switching ? 'Switching...' : 'Switch to Recruiter'}
            </button>
          </div>

          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #4361ee 0%, #4895ef 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(67, 97, 238, 0.2)'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              Welcome Back, {user?.name?.split(' ')[0] || 'Talent'}!
            </h2>
            <p style={{ fontSize: '1rem', opacity: 0.9 }}>Your command center for managing all your gigs</p>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <TalentStatCard title="Available Jobs" value={stats.availableJobs} icon="briefcase" color="#4361ee" />
            <TalentStatCard title="Active Gigs" value={stats.activeGigs} icon="zap" color="#4cc9f0" />
            <TalentStatCard title="Pending Applications" value={stats.pendingApplications} icon="file-text" color="#f72585" />
            <TalentStatCard title="Weekly Earnings" value={`$${stats.weeklyEarnings.toLocaleString()}`} icon="dollar-sign" color="#7209b7" />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <ActionButton icon="search" label="Browse Jobs" onClick={() => navigate('/opportunities')} />
            <ActionButton icon="file-text" label="View Applications" onClick={() => navigate('/proposals')} />
            <ActionButton icon="user" label="Update Profile" onClick={() => navigate('/profile')} />
          </div>

          {/* Recommended Jobs */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem' }}>Recommended Jobs (AI-powered matches)</h3>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>No recommended jobs at the moment.</p>
            <button
              onClick={() => navigate('/opportunities')}
              style={{
                background: '#4361ee',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-list"></i> Browse All Jobs
            </button>
          </div>

          {/* Worker Dashboard Grid */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem' }}>Worker Dashboard</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              {workerDashboardItems.map((item, index) => (
                <DashboardGridItem
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  checked={item.checked}
                />
              ))}
            </div>
          </div>

          {/* Back to Main Dashboard */}
          <div>
            <button
              onClick={() => navigate('/home')}
              style={{
                background: '#f8f9fa',
                border: '2px solid #e9ecef',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#4361ee',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-arrow-left"></i> Back to Main Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '1rem',
        padding: '0 0.5rem',
        opacity: 0.7
      }}>{title}</h3>
      <ul style={{ listStyle: 'none' }}>{children}</ul>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }) {
  return (
    <li style={{ marginBottom: '0.5rem' }}>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onClick && onClick(); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0.8rem',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          backgroundColor: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          transition: 'all 0.3s ease'
        }}
      >
        <i className={`fas fa-${icon}`} style={{ width: '20px', textAlign: 'center' }}></i>
        <span>{label}</span>
      </a>
    </li>
  );
}

function TalentStatCard({ title, value, icon, color }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '1.5rem',
      textAlign: 'center'
    }}>
      <div style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: color, margin: '0.5rem 0' }}>{value}</div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'white',
        border: '2px solid #e9ecef',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        color: '#4361ee',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#4361ee';
        e.currentTarget.style.color = 'white';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'white';
        e.currentTarget.style.color = '#4361ee';
      }}
    >
      <i className={`fas fa-${icon}`}></i> {label}
    </button>
  );
}

function DashboardGridItem({ icon, label, checked }) {
  return (
    <div style={{
      background: checked ? '#f8f9ff' : 'white',
      border: checked ? '2px solid #4361ee' : '2px solid #e9ecef',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {checked && <i className="fas fa-check-circle" style={{ color: '#4361ee' }}></i>}
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <span style={{ fontWeight: '500', color: '#212529', flex: 1 }}>{label}</span>
    </div>
  );
}