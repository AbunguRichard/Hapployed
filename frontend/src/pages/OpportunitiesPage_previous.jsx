import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Clock, MessageCircle, Star, Sparkles, Award, Target, Zap } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function OpportunitiesPage() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    matchLevel: 'perfect', // 'perfect', 'good', 'all'
    maxBudget: 5000,
    growthType: null // 'portfolio', 'high-paying', 'top-clients'
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/jobs/opportunities`);
      const data = await response.json();
      
      // Use mock data with AI enhancements
      const mockData = [
        {
          id: 1,
          type: 'urgent',
          title: 'E-commerce React Dashboard',
          description: 'Build a responsive React dashboard with analytics components and data visualization. The project requires integration with REST APIs and real-time data updates.',
          price: 3500,
          priceType: 'fixed',
          match: 97,
          location: 'Remote',
          isRemote: true,
          postedAt: '1 hour ago',
          featured: true,
          marketIntel: {
            demandTrend: '📈 React demand up 47% this week',
            rateInfo: '💰 Top performers charge $85-120/hr for this work'
          },
          clientViability: {
            score: 'A+',
            rating: 4.8,
            responseRate: 94,
            paymentRate: 97
          },
          fitReasons: [
            'Your portfolio shows 3 similar e-commerce projects',
            'Client specifically wants TypeScript experience',
            'Budget matches your preferred rate'
          ],
          aiApplySuccess: 92,
          quickApplySuccess: 67,
          timeline: '2-3 weeks',
          applicants: 5
        },
        {
          id: 2,
          type: 'project',
          title: 'Mobile App UI/UX Redesign',
          description: 'Complete redesign of a fitness tracking mobile app. Need modern UI/UX with focus on user engagement and retention.',
          price: 3500,
          priceType: 'fixed',
          match: 88,
          location: 'Remote',
          isRemote: true,
          postedAt: '2 hours ago',
          featured: false,
          clientViability: {
            score: 'A',
            rating: 4.6,
            responseRate: 89,
            paymentRate: 95
          },
          timeline: '2-3 weeks',
          applicants: 8
        },
        {
          id: 3,
          type: 'project',
          title: 'SaaS Dashboard Development',
          description: 'Build analytics dashboard for B2B SaaS platform with data visualization and reporting features.',
          price: 4200,
          priceType: 'fixed',
          match: 92,
          location: 'Remote',
          isRemote: true,
          postedAt: '3 hours ago',
          featured: false,
          clientViability: {
            score: 'A+',
            rating: 4.9,
            responseRate: 96,
            paymentRate: 98
          },
          timeline: '3-4 weeks',
          applicants: 12
        }
      ];
      
      setOpportunities(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
      setLoading(false);
    }
  };

  const getFilteredOpportunities = () => {
    return opportunities.filter(opp => {
      // Match level filter
      if (filters.matchLevel === 'perfect' && opp.match < 95) return false;
      if (filters.matchLevel === 'good' && opp.match < 80) return false;
      
      // Budget filter
      if (opp.price > filters.maxBudget) return false;
      
      return true;
    });
  };

  const handleSmartApply = (opportunity) => {
    toast.success('AI is optimizing your proposal...', {
      description: `Success rate: ${opportunity.aiApplySuccess}%`
    });
    setTimeout(() => {
      navigate(`/apply/${opportunity.id}`, { state: { opportunity, mode: 'smart' } });
    }, 1500);
  };

  const handleQuickApply = (opportunity) => {
    navigate(`/apply/${opportunity.id}`, { state: { opportunity, mode: 'quick' } });
  };

  const filteredOpportunities = getFilteredOpportunities();
  const perfectMatches = opportunities.filter(o => o.match >= 95).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      {/* Header with AI Personalization */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            Your Next Project is Here! 🎯
          </h1>
          <div className="space-y-2">
            <p className="text-xl opacity-95">
              We found <strong>{filteredOpportunities.length} perfect matches</strong> for your skills in <strong>React</strong> & <strong>UI/UX</strong>
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 inline-block">
              <p className="text-sm flex items-center gap-2">
                💡 <span>Based on your profile strength, you're likely to win {Math.ceil(perfectMatches * 0.67)} of these</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Advanced Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-24 space-y-6">
              {/* Smart Match */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  🎯 Smart Match
                </h3>
                <div className="space-y-2">
                  {[
                    { value: 'perfect', label: 'Perfect Fit (95%+)', count: opportunities.filter(o => o.match >= 95).length },
                    { value: 'good', label: 'Good Match (80%+)', count: opportunities.filter(o => o.match >= 80).length },
                    { value: 'all', label: 'All Opportunities', count: opportunities.length }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFilters(prev => ({ ...prev, matchLevel: option.value }))}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        filters.matchLevel === option.value
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{option.label}</span>
                      <span className="float-right">({option.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Intelligence */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  💰 Budget Intelligence
                </h3>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={filters.maxBudget}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="mt-3 space-y-1 text-sm">
                  <div className="text-gray-600">Any budget</div>
                  <div className="text-purple-600 font-semibold">
                    $2K-5K (Your sweet spot)
                  </div>
                  <div className="text-gray-900 font-bold">
                    Up to: ${filters.maxBudget.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Growth Potential */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  🚀 Growth Potential
                </h3>
                <div className="space-y-2">
                  {[
                    { value: 'portfolio', label: '📈 Portfolio Builders' },
                    { value: 'high-paying', label: '💰 High-Paying' },
                    { value: 'top-clients', label: '🌟 Top Clients' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        growthType: prev.growthType === option.value ? null : option.value 
                      }))}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        filters.growthType === option.value
                          ? 'bg-blue-100 text-blue-700 font-semibold border-2 border-blue-400'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  🤖 AI Suggestions
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">HOT</span>
                    <span className="text-sm text-gray-700">React + TypeScript projects paying 30% more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Project Listings */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">Loading opportunities...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOpportunities.map(opportunity => (
                  <div
                    key={opportunity.id}
                    className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden ${
                      opportunity.featured ? 'ring-2 ring-purple-400' : ''
                    }`}
                  >
                    {/* Project Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-3">
                            {opportunity.match >= 95 ? '🎯 AI PERFECT MATCH' : '🔥 STRONG MATCH'} - {opportunity.match}%
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>{opportunity.postedAt}</span>
                            {opportunity.type === 'urgent' && (
                              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full font-semibold">
                                🚨 URGENT
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{opportunity.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{opportunity.description}</p>
                    </div>

                    {/* Market Intelligence */}
                    {opportunity.marketIntel && (
                      <div className="px-6 py-4 bg-blue-50 border-l-4 border-blue-500">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">{opportunity.marketIntel.demandTrend}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">{opportunity.marketIntel.rateInfo}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Client Viability */}
                    <div className="px-6 py-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-500 text-white px-3 py-1 rounded font-bold">
                            {opportunity.clientViability.score}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Excellent Client</div>
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-gray-700 font-medium">{opportunity.clientViability.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>💬 {opportunity.clientViability.responseRate}% response</span>
                          <span>💰 {opportunity.clientViability.paymentRate}% paid on time</span>
                        </div>
                      </div>
                    </div>

                    {/* Smart Apply Section */}
                    {opportunity.featured && (
                      <div className="p-6 bg-white">
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* AI-Optimized Apply */}
                          <div className="border-2 border-purple-500 rounded-xl p-4 bg-purple-50">
                            <div className="flex items-start gap-2 mb-3">
                              <Sparkles className="w-5 h-5 text-purple-600" />
                              <div>
                                <h4 className="font-bold text-gray-900">🚀 AI-Optimized Apply</h4>
                                <p className="text-sm text-gray-600">We'll tailor your proposal based on client preferences</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSmartApply(opportunity)}
                              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                            >
                              Apply Smart ({opportunity.aiApplySuccess}% success)
                            </button>
                          </div>

                          {/* Quick Apply */}
                          <div className="border-2 border-gray-300 rounded-xl p-4 bg-gray-50">
                            <div className="flex items-start gap-2 mb-3">
                              <Zap className="w-5 h-5 text-gray-600" />
                              <div>
                                <h4 className="font-bold text-gray-900">⚡ Quick Apply</h4>
                                <p className="text-sm text-gray-600">Use your profile template</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleQuickApply(opportunity)}
                              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-800 transition-all"
                            >
                              Quick Apply ({opportunity.quickApplySuccess}% success)
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Why You're Perfect */}
                    {opportunity.fitReasons && (
                      <div className="px-6 py-4 bg-green-50 border-t border-green-200">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          💡 Why you're perfect for this:
                        </h4>
                        <ul className="space-y-2">
                          {opportunity.fitReasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <span className="text-green-600 mt-1">✓</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Simple apply for non-featured */}
                    {!opportunity.featured && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-bold text-xl text-purple-600">${opportunity.price.toLocaleString()}</span>
                            <span>⏱️ {opportunity.timeline}</span>
                            <span>👥 {opportunity.applicants} applicants</span>
                          </div>
                          <button
                            onClick={() => handleQuickApply(opportunity)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
