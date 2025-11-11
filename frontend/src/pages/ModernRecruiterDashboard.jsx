import React, { useState, useEffect } from 'react';
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

// Register ChartJS components
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

export default function ModernRecruiterDashboard() {
  const { user, switchMode, addSecondaryRole } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const handleSwitchMode = async () => {
    try {
      setSwitching(true);
      
      // If user doesn't have worker role, add it first
      if (!user?.roles?.includes('worker')) {
        console.log('Adding worker role...');
        await addSecondaryRole('worker');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
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
      {
        label: 'Applied',
        data: [120, 150, 180, 90, 130, 160],
        backgroundColor: '#4361ee',
      },
      {
        label: 'Hired',
        data: [30, 45, 60, 25, 40, 50],
        backgroundColor: '#4cc9f0',
      }
    ]
  };

  const acceptanceData = {
    labels: ['Accepted', 'Rejected', 'Pending'],
    datasets: [{
      data: [75, 15, 10],
      backgroundColor: ['#4361ee', '#f72585', '#7209b7'],
    }]
  };

  const inclusionData = {
    labels: ['Interviewed', 'Not Interviewed'],
    datasets: [{
      data: [60, 40],
      backgroundColor: ['#7209b7', '#e9ecef'],
    }]
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
    datasets: [{
      data: [30, 15, 20, 30, 15],
      backgroundColor: ['#4361ee', '#4cc9f0', '#f72585', '#7209b7', '#3a0ca3'],
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fb' }}>
      <DashboardHeader />
      
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#212529', marginBottom: '0.5rem' }}>
            Recruiter Dashboard
          </h1>
          <p style={{ color: '#6c757d' }}>Welcome back, {user?.name || 'Recruiter'}!</p>
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
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#e9ecef'}
            onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
          >
            {switching ? 'Switching...' : 'Switch to Talent'}
          </button>
        </div>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            title="Total Candidates"
            value="1,248"
            change="+12%"
            positive={true}
          />
          <StatCard
            title="Open Positions"
            value="24"
            change="-3%"
            positive={false}
          />
          <StatCard
            title="Interviews"
            value="86"
            change="+8%"
            positive={true}
          />
          <StatCard
            title="Hire Rate"
            value="68%"
            change="+5%"
            positive={true}
          />
        </div>

        {/* Dashboard Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Job Applied vs Hired */}
          <ChartCard title="Job Applied vs Hired">
            <Bar data={appliedVsHiredData} options={chartOptions} />
          </ChartCard>

          {/* Offer Letter Acceptance */}
          <ChartCard title="Offer Letter Acceptance">
            <div style={{ marginBottom: '1rem' }}>
              <ProgressItem label="Acceptance Rate" value="75%" percent={75} color="#4361ee" />
            </div>
            <Doughnut data={acceptanceData} options={{
              ...chartOptions,
              cutout: '70%',
              plugins: { legend: { position: 'bottom' } }
            }} />
          </ChartCard>

          {/* LGBTQIA+ Inclusion */}
          <ChartCard title="LGBTQIA+ Inclusion">
            <div style={{ marginBottom: '1rem' }}>
              <ProgressItem label="Applied" value="60% Interviewed" percent={60} color="#7209b7" />
            </div>
            <Pie data={inclusionData} options={{
              ...chartOptions,
              plugins: { legend: { position: 'bottom' } }
            }} />
          </ChartCard>

          {/* Q1 Export */}
          <ChartCard title="Q1-Jan2022 - 31Dec2022">
            <h3 style={{ fontSize: '1.5rem', margin: '1rem 0', color: '#4361ee' }}>Q1 Export</h3>
            <Line data={quarterlyData} options={chartOptions} />
          </ChartCard>

          {/* Application Progression */}
          <ChartCard title="Application Progression">
            <div style={{ padding: '1rem 0' }}>
              <ProgressItem label="Applied" value="400 candidates" percent={100} color="#4895ef" />
              <ProgressItem label="Shortlisted" value="250 candidates" percent={62.5} color="#4cc9f0" />
              <ProgressItem label="Interviewed" value="150 candidates" percent={37.5} color="#f72585" />
              <ProgressItem label="Hired" value="80 candidates" percent={20} color="#4361ee" />
            </div>
          </ChartCard>

          {/* Source of Hire */}
          <ChartCard title="Source of Hire">
            <div style={{ marginBottom: '1rem' }}>
              <SourceItem name="Company Website" value="100 (30%)" color="#4361ee" />
              <SourceItem name="Job Boards" value="50 (15%)" color="#4cc9f0" />
              <SourceItem name="Social Media" value="80 (20%)" color="#f72585" />
              <SourceItem name="Career Fair" value="100 (30%)" color="#7209b7" />
              <SourceItem name="Referrals" value="70 (15%)" color="#3a0ca3" />
            </div>
            <PolarArea data={sourceData} options={{
              ...chartOptions,
              plugins: { legend: { position: 'bottom' } }
            }} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function StatCard({ title, value, change, positive }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      padding: '1.5rem',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0' }}>{value}</div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: positive ? '#28a745' : '#dc3545'
      }}>
        <i className={`fas fa-arrow-${positive ? 'up' : 'down'}`} style={{ marginRight: '0.5rem' }}></i>
        {change} from last month
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
      transition: 'all 0.3s ease',
      minHeight: '400px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#212529' }}>{title}</h3>
      </div>
      <div style={{ height: '300px' }}>
        {children}
      </div>
    </div>
  );
}

function ProgressItem({ label, value, percent, color }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        fontSize: '0.9rem'
      }}>
        <span>{label}</span>
        <span style={{ fontWeight: '600' }}>{value}</span>
      </div>
      <div style={{
        height: '8px',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          backgroundColor: color,
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
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
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: color
        }} />
        <span style={{ fontWeight: '500' }}>{name}</span>
      </div>
      <span style={{ fontWeight: '600' }}>{value}</span>
    </div>
  );
}
