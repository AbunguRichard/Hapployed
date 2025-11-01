import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Pie, PolarArea } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RecruiterDashboard() {
  const { user, switchMode } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  const handleSwitchMode = async () => {
    if (!user?.roles?.includes('worker')) {
      alert('You need to add the Worker role first to switch to Talent mode.');
      return;
    }
    try {
      setSwitching(true);
      await switchMode('worker');
      navigate('/epic-worker-dashboard');
    } catch (error) {
      console.error('Failed to switch mode:', error);
      alert('Failed to switch mode. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  // Chart data
  const appliedVsHiredData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Applied', data: [120, 150, 180, 90, 130, 160], backgroundColor: '#4361ee' },
      { label: 'Hired', data: [30, 45, 60, 25, 40, 50], backgroundColor: '#4cc9f0' }
    ]
  };

  const acceptanceData = {
    labels: ['Accepted', 'Rejected', 'Pending'],
    datasets: [{ data: [75, 15, 10], backgroundColor: ['#4361ee', '#f72585', '#7209b7'] }]
  };

  const inclusionData = {
    labels: ['Interviewed', 'Not Interviewed'],
    datasets: [{ data: [60, 40], backgroundColor: ['#7209b7', '#e9ecef'] }]
  };

  const quarterlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Hires',
      data: [12, 19, 15, 25, 22, 30, 28, 32, 30, 35, 40, 45],
      borderColor: '#4361ee',
      backgroundColor: 'rgba(67, 97, 238, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const sourceData = {
    labels: ['Company Website', 'Job Boards', 'Social Media', 'Career Fair', 'Referrals'],
    datasets: [{ data: [30, 15, 20, 30, 15], backgroundColor: ['#4361ee', '#4cc9f0', '#f72585', '#7209b7', '#3a0ca3'] }]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false };

  return (
    <div style={{ backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      <DashboardHeader />
      
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        {/* Sidebar */}
        <div style={{
          width: '260px',
          minWidth: '260px',
          background: 'linear-gradient(180deg, #4361ee 0%, #3f37c9 100%)',
          color: 'white',
          padding: '1.5rem 1rem',
          overflowY: 'auto'
        }}>
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
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#212529' }}>Recruiter Dashboard</h1>
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
                  {user?.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.name || 'Recruiter'}</div>
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
              Recruiter Mode
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
              {switching ? 'Switching...' : 'Switch to Talent'}
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <StatCard title="Total Candidates" value="1,248" change="+12%" positive />
            <StatCard title="Open Positions" value="24" change="-3%" />
            <StatCard title="Interviews" value="86" change="+8%" positive />
            <StatCard title="Hire Rate" value="68%" change="+5%" positive />
          </div>

          {/* Application Progress */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Application Progress</h3>
            <ProgressBar label="UX Designer at TechVision" percent={85} color="#4361ee" status="Expand date" />
            <ProgressBar label="Social Media Gig" percent={45} color="#4cc9f0" status="Submitted" />
            <ProgressBar label="Website Redesign" percent={95} color="#f72585" status="Under Review" />
          </div>

          {/* Dashboard Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem'
          }}>
            <ChartCard title="Job Applied vs Hired">
              <Bar data={appliedVsHiredData} options={chartOptions} />
            </ChartCard>

            <ChartCard title="Offer Letter Acceptance">
              <ProgressItem label="Acceptance Rate" value="75%" percent={75} color="#4361ee" />
              <Doughnut data={acceptanceData} options={{ ...chartOptions, cutout: '70%', plugins: { legend: { position: 'bottom' } } }} />
            </ChartCard>

            <ChartCard title="LGBTQIA+ Inclusion">
              <ProgressItem label="Applied" value="60% Interviewed" percent={60} color="#7209b7" />
              <Pie data={inclusionData} options={{ ...chartOptions, plugins: { legend: { position: 'bottom' } } }} />
            </ChartCard>

            <ChartCard title="Q1-Jan2022 - 31Dec2022">
              <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0', color: '#4361ee' }}>Q1 Export</h3>
              <Line data={quarterlyData} options={chartOptions} />
            </ChartCard>

            <ChartCard title="Application Progression">
              <ProgressItem label="Applied" value="400 candidates" percent={100} color="#4895ef" />
              <ProgressItem label="Shortlisted" value="250 candidates" percent={62.5} color="#4cc9f0" />
              <ProgressItem label="Interviewed" value="150 candidates" percent={37.5} color="#f72585" />
              <ProgressItem label="Hired" value="80 candidates" percent={20} color="#4361ee" />
            </ChartCard>

            <ChartCard title="Source of Hire">
              <SourceItem name="Company Website" value="100 (30%)" color="#4361ee" />
              <SourceItem name="Job Boards" value="50 (15%)" color="#4cc9f0" />
              <SourceItem name="Social Media" value="80 (20%)" color="#f72585" />
              <SourceItem name="Career Fair" value="100 (30%)" color="#7209b7" />
              <SourceItem name="Referrals" value="70 (15%)" color="#3a0ca3" />
              <div style={{ marginTop: '1rem' }}>
                <PolarArea data={sourceData} options={{ ...chartOptions, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </ChartCard>
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

function StatCard({ title, value, change, positive }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '1.5rem'
    }}>
      <div style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: positive ? '#28a745' : '#dc3545' }}>
        <i className={`fas fa-arrow-${positive ? 'up' : 'down'}`} style={{ marginRight: '0.5rem' }}></i>
        {change} from last month
      </div>
    </div>
  );
}

function ProgressBar({ label, percent, color, status }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        <span>{label}</span>
        <span style={{ color: '#4361ee', fontSize: '0.85rem' }}>{status}</span>
      </div>
      <div style={{ height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percent}%`, backgroundColor: color, borderRadius: '4px' }} />
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '1.5rem',
      minHeight: '400px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#212529' }}>{title}</h3>
      </div>
      <div style={{ height: '300px' }}>{children}</div>
    </div>
  );
}

function ProgressItem({ label, value, percent, color }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        <span>{label}</span>
        <span style={{ fontWeight: '600' }}>{value}</span>
      </div>
      <div style={{ height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percent}%`, backgroundColor: color, borderRadius: '4px' }} />
      </div>
    </div>
  );
}

function SourceItem({ name, value, color }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.8rem 0',
      borderBottom: '1px solid #e9ecef'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
        <span style={{ fontWeight: '500' }}>{name}</span>
      </div>
      <span style={{ fontWeight: '600' }}>{value}</span>
    </div>
  );
}