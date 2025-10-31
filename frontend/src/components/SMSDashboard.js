import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SMSDashboard.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const SMSDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [offlineGigs, setOfflineGigs] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [templates, setTemplates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'analytics') {
        const response = await axios.get(`${BACKEND_URL}/api/sms/analytics?range=7d`);
        setAnalytics(response.data.data || []);
      } else if (activeTab === 'gigs') {
        const response = await axios.get(`${BACKEND_URL}/api/sms/offline-gigs?status=pending_sync`);
        setOfflineGigs(response.data.data.gigs || []);
      } else if (activeTab === 'health') {
        const response = await axios.get(`${BACKEND_URL}/api/sms/health`);
        setHealthStatus(response.data.data);
      } else if (activeTab === 'templates') {
        const response = await axios.get(`${BACKEND_URL}/api/sms/templates`);
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncGig = async (gigId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/sms/sync-gig/${gigId}`);
      alert('Gig sync initiated!');
      loadData();
    } catch (error) {
      alert(`Sync failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const sendTestSMS = async () => {
    const phoneNumber = prompt('Enter phone number (e.g., +1234567890):');
    const message = prompt('Enter message:');
    
    if (phoneNumber && message) {
      setIsLoading(true);
      try {
        await axios.post(`${BACKEND_URL}/api/sms/send`, { phone_number: phoneNumber, message });
        alert('Test SMS sent successfully (mocked for now)!');
      } catch (error) {
        alert(`Failed to send SMS: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const copyTemplate = (template) => {
    navigator.clipboard.writeText(template);
    alert('Template copied to clipboard!');
  };

  return (
    <div className="sms-dashboard">
      <div className="dashboard-header">
        <h1>📱 SMS Gateway Dashboard</h1>
        <p>Manage offline SMS operations and monitor gateway health</p>
        
        <div className="header-actions">
          <button className="btn-primary" onClick={sendTestSMS} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Send Test SMS'}
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => window.open('https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply-python', '_blank')}
          >
            Twilio Docs
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={activeTab === 'gigs' ? 'active' : ''}
          onClick={() => setActiveTab('gigs')}
        >
          📝 Offline Gigs
        </button>
        <button 
          className={activeTab === 'health' ? 'active' : ''}
          onClick={() => setActiveTab('health')}
        >
          ❤️ Health
        </button>
        <button 
          className={activeTab === 'templates' ? 'active' : ''}
          onClick={() => setActiveTab('templates')}
        >
          📋 Templates
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            {analytics && analytics.length > 0 ? (
              <>
                <div className="stats-cards">
                  <div className="stat-card">
                    <h3>Total Messages</h3>
                    <p className="stat-number">
                      {analytics.reduce((sum, day) => sum + day.totalMessages, 0)}
                    </p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Cost</h3>
                    <p className="stat-number">
                      ${analytics.reduce((sum, day) => sum + (day.totalCost || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="stat-card">
                    <h3>Success Rate</h3>
                    <p className="stat-number">
                      {(() => {
                        const total = analytics.reduce((sum, day) => sum + day.totalMessages, 0);
                        const successful = analytics.reduce((sum, day) => sum + (day.successful || 0), 0);
                        return total > 0 ? ((successful / total) * 100).toFixed(1) : 0;
                      })()}%
                    </p>
                  </div>
                </div>

                <div className="charts-section">
                  <h3>Messages Per Day</h3>
                  <div className="messages-chart">
                    {analytics.map(day => (
                      <div key={day._id} className="chart-bar">
                        <div 
                          className="bar-fill"
                          style={{ height: `${Math.min((day.totalMessages / 100) * 100, 100)}%` }}
                        ></div>
                        <span className="bar-value">{day.totalMessages}</span>
                        <span className="bar-label">{day._id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No SMS activity yet. Send your first SMS to get started! 📱</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gigs' && (
          <div className="gigs-tab">
            <h3>Pending Sync Gigs ({offlineGigs.length})</h3>
            
            <div className="gigs-list">
              {offlineGigs.length > 0 ? (
                offlineGigs.map(gig => (
                  <div key={gig.id} className="gig-card">
                    <div className="gig-info">
                      <h4>{gig.title}</h4>
                      <p>{gig.description}</p>
                      <div className="gig-meta">
                        <span>💰 ${gig.price || 'N/A'}</span>
                        <span>⏱️ {gig.duration || 'N/A'}</span>
                        <span>📁 {gig.category}</span>
                      </div>
                      <div className="gig-user">
                        From: {gig.phone_number || 'Unknown'}
                      </div>
                    </div>
                    <div className="gig-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => syncGig(gig.id)}
                      >
                        Sync Now
                      </button>
                      <span className="sync-status">
                        Attempts: {gig.sync_attempts || 0}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No pending gigs to sync! 🎉</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'health' && healthStatus && (
          <div className="health-tab">
            <div className="health-status">
              <div className={`status-indicator ${healthStatus.is_running ? 'healthy' : 'unhealthy'}`}>
                {healthStatus.is_running ? '🟢 Running' : '🔴 Stopped'}
              </div>
              
              <div className="health-metrics">
                <div className="metric">
                  <span className="metric-label">Pending Responses:</span>
                  <span className="metric-value">{healthStatus.pending_responses || 0}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Pending Gigs:</span>
                  <span className="metric-value">{healthStatus.pending_gigs || 0}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Failed Gigs:</span>
                  <span className="metric-value">{healthStatus.failed_gigs || 0}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Last Checked:</span>
                  <span className="metric-value">
                    {new Date(healthStatus.last_checked).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="health-actions">
              <button className="btn-primary" onClick={loadData}>Refresh Status</button>
            </div>
          </div>
        )}

        {activeTab === 'templates' && templates && (
          <div className="templates-tab">
            <h3>SMS Command Templates</h3>
            
            <div className="template-category">
              <h4>📝 Create Gig</h4>
              <div className="template-list">
                {templates.create_gig?.map((template, index) => (
                  <div key={index} className="template-item">
                    <code>{template}</code>
                    <button className="btn-copy" onClick={() => copyTemplate(template)}>Copy</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="template-category">
              <h4>✏️ Update Gig</h4>
              <div className="template-list">
                {templates.update_gig?.map((template, index) => (
                  <div key={index} className="template-item">
                    <code>{template}</code>
                    <button className="btn-copy" onClick={() => copyTemplate(template)}>Copy</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="template-category">
              <h4>🗑️ Delete Gig</h4>
              <div className="template-list">
                {templates.delete_gig?.map((template, index) => (
                  <div key={index} className="template-item">
                    <code>{template}</code>
                    <button className="btn-copy" onClick={() => copyTemplate(template)}>Copy</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="template-category">
              <h4>ℹ️ Other Commands</h4>
              <div className="template-list">
                {templates.status?.map((template, index) => (
                  <div key={index} className="template-item">
                    <code>{template}</code>
                    <button className="btn-copy" onClick={() => copyTemplate(template)}>Copy</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '30px', padding: '20px', background: '#e7f3ff', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
              <h4 style={{ marginBottom: '10px', color: '#004085' }}>💡 How to Use SMS Gateway</h4>
              <ol style={{ color: '#004085', lineHeight: '1.8' }}>
                <li>Users send SMS to your Twilio/Africa's Talking number</li>
                <li>Webhook receives SMS at <code>/api/sms/webhook/incoming</code></li>
                <li>System parses command and creates gig</li>
                <li>Gig syncs to main database automatically</li>
                <li>Confirmation SMS sent back to user</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSDashboard;
