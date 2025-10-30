import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Target, TrendingUp, Zap, MapPin, Clock, DollarSign, Star, CheckCircle, Filter } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function AIMatchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchMatches();
    fetchStats();
  }, [activeTab, locationFilter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ type: activeTab });
      if (locationFilter !== 'all') {
        params.append('location', locationFilter);
      }
      
      const response = await fetch(`${BACKEND_URL}/api/ai-match/matches?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMatches(data.data.matches || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-match/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getMatchBadge = (match) => {
    if (match.isQuickHire) {
      return { text: '⚡ QuickHire', class: 'quickhire', color: 'bg-orange-100 text-orange-700 border-orange-300' };
    }
    const level = match.matchResult?.compatibility?.level;
    if (level === 'perfect') {
      return { text: '✨ Perfect Match', class: 'perfect', color: 'bg-green-100 text-green-700 border-green-300' };
    }
    if (level === 'excellent') {
      return { text: '⭐ Excellent', class: 'excellent', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    }
    return { text: '✓ Good Match', class: 'good', color: 'bg-purple-100 text-purple-700 border-purple-300' };
  };

  const applyToMatch = async (matchId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-match/matches/${matchId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal: 'I am interested in this opportunity and believe I would be a great fit!',
          proposedRate: null
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Application submitted successfully!');
        fetchMatches(); // Refresh matches
      } else {
        alert(`❌ ${data.message || 'Application failed'}`);
      }
    } catch (error) {
      alert(`❌ Application failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🤖 AI Match</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Smart opportunities tailored just for you using advanced AI matching
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{stats.overview.totalMatches}</div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.overview.perfectMatches}</div>
              <div className="text-sm text-gray-600">Perfect Matches</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{Math.round(stats.overview.averageScore)}%</div>
              <div className="text-sm text-gray-600">Avg. Score</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">{Math.round(stats.successRate)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'gig', 'project', 'quickhire'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'quickhire' && '⚡ '}
                  {tab === 'all' ? 'All Opportunities' : tab === 'quickhire' ? 'QuickHire' : `${tab}s`}
                </button>
              ))}
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="all">📍 Anywhere</option>
              <option value="nearme">📍 Near Me</option>
              <option value="remote">🏠 Remote Only</option>
            </select>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {matches.map((match, index) => {
            const badge = getMatchBadge(match);
            const scores = match.matchResult?.scores || {};
            const compatibility = match.matchResult?.compatibility || {};
            const reasons = match.matchResult?.matchReasons || [];
            const insights = match.matchResult?.aiInsights || {};

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border-l-4 border-purple-600 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${badge.color}`}>
                      {badge.text}
                    </span>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">
                        {Math.round(scores.overall || 0)}%
                      </div>
                      <div className="text-xs text-gray-600 capitalize">{compatibility.level}</div>
                    </div>
                  </div>

                  {/* Opportunity Details */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {match.opportunity?.title || 'Opportunity Title'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {match.opportunity?.description || 'Description not available'}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Type: <span className="font-semibold text-gray-900 capitalize">{match.type}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Success: <span className="font-semibold text-green-600">{Math.round(compatibility.predictedSuccess || 0)}%</span></span>
                    </div>
                    {match.opportunity?.budget && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Budget: <span className="font-semibold text-gray-900">${match.opportunity.budget}</span></span>
                      </div>
                    )}
                    {match.opportunity?.workLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{match.opportunity.workLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-2 mb-4">
                    {['skills', 'experience'].map((scoreType) => (
                      <div key={scoreType} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-24 capitalize">{scoreType}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                            style={{ width: `${scores[scoreType] || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-10">{Math.round(scores[scoreType] || 0)}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Match Reasons */}
                  {reasons.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-semibold text-green-900 mb-2">Why you're a great match:</h4>
                      <div className="space-y-1">
                        {reasons.slice(0, 3).map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-green-800">
                            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{reason.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Insights */}
                  {insights.recommendations && insights.recommendations.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">🤖 AI Insights:</h4>
                      <div className="space-y-1">
                        {insights.recommendations.slice(0, 2).map((insight, idx) => (
                          <div key={idx} className="text-xs text-blue-800">• {insight}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => applyToMatch(match.opportunity._id || match.opportunity.jobId)}
                      disabled={match.status === 'applied'}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-sm"
                    >
                      {match.status === 'applied' ? 'Applied ✓' : 'Apply Now'}
                    </button>
                    <button className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-semibold text-sm">
                      Details
                    </button>
                  </div>

                  {/* QuickHire Notice */}
                  {match.isQuickHire && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800 text-center font-semibold">
                      ⚡ Apply within 24 hours for priority consideration
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* No Matches State */}
        {matches.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or updating your profile for better matches</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActiveTab('all')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Show All Opportunities
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-semibold"
              >
                Update Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
