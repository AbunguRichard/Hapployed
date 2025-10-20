import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Lightbulb, Trophy, Sparkles, Zap, Check, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function FindWorkPage() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    jobType: 'all', // 'all', 'urgent', 'fixed', 'remote'
    matchLevel: 'all', // 'perfect', 'good', 'all'
    maxBudget: 5000,
    growthType: null // 'portfolio', 'high-paying', 'top-clients'
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      
      // Mock data combining projects and gigs
      const mockData = [
        {
          id: 1,
          type: 'urgent',
          title: 'React Dashboard Development',
          description: 'Build a responsive React dashboard with analytics components and data visualization. The project requires integration with REST APIs and real-time data updates.',
          price: 2500,
          match: 97,
          postedAt: '1 hour ago',
          featured: true,
          marketIntel: {
            demandTrend: 'React demand up 47% this week',
            rateInfo: 'Top performers charge $85-120/hr for this work'
          },
          clientScore: 'A+',
          clientRating: 4.8,
          responseRate: 94,
          paymentRate: 97,
          fitReasons: [
            'Your portfolio shows 3 similar e-commerce projects',
            'Client specifically wants TypeScript experience',
            'Budget matches your preferred rate'
          ],
          aiSuccessRate: 92,
          quickSuccessRate: 67
        },
        {
          id: 2,
          type: 'gig',
          title: 'Emergency Plumbing Repair',
          description: 'Kitchen sink pipe leaking, need immediate help. Basic plumbing skills required. Must be available within the hour.',
          price: 150,
          match: 88,
          postedAt: '15 minutes ago',
          featured: false,
          clientScore: 'A',
          clientRating: 4.6,
          responseRate: 89,
          timeline: 'ASAP',
          applicants: 5
        },
        {
          id: 3,
          type: 'project',
          title: 'Mobile App UI/UX Design',
          description: 'Complete redesign of a fitness tracking mobile app. Need modern UI/UX with focus on user engagement and retention.',
          price: 3200,
          match: 92,
          postedAt: '2 hours ago',
          featured: false,
          clientScore: 'A+',
          clientRating: 4.9,
          responseRate: 96,
          timeline: '2-3 weeks',
          applicants: 12
        },
        {
          id: 4,
          type: 'gig',
          title: 'House Cleaning Service',
          description: 'Need thorough house cleaning for 3-bedroom apartment. All supplies provided. Estimated 4-5 hours of work.',
          price: 200,
          match: 85,
          postedAt: '3 hours ago',
          featured: false,
          clientScore: 'A',
          clientRating: 4.7,
          responseRate: 91,
          timeline: 'This weekend',
          applicants: 8
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
      if (filters.matchLevel === 'perfect' && opp.match < 95) return false;
      if (filters.matchLevel === 'good' && opp.match < 80) return false;
      if (opp.price > filters.maxBudget) return false;
      return true;
    });
  };

  const handleSmartApply = (opportunity) => {
    toast.success('AI is optimizing your proposal...', {
      description: `Success rate: ${opportunity.aiSuccessRate}%`
    });
    setTimeout(() => {
      navigate(`/apply/${opportunity.id}`, { state: { opportunity, mode: 'smart' } });
    }, 1500);
  };

  const handleQuickApply = (opportunity) => {
    navigate(`/apply/${opportunity.id}`, { state: { opportunity, mode: 'quick' } });
  };

  const toggleExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredOpportunities = getFilteredOpportunities();
  const perfectMatches = opportunities.filter(o => o.match >= 95).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Your Next Opportunity is Here! 🎯</h1>
          <p className="text-xl mb-3">
            We found <span className="font-bold">{filteredOpportunities.length} perfect matches</span> for your skills in <span className="font-bold">Development</span> & <span className="font-bold">Services</span>
          </p>
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-sm">💡 Based on your profile strength, you're likely to win {Math.ceil(perfectMatches * 0.67)} of these</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>

              {/* Job Type */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Job Type</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'urgent', label: 'Urgent Only' },
                    { value: 'fixed', label: 'Fixed-price' },
                    { value: 'remote', label: 'Remote-only' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jobType"
                        value={option.value}
                        checked={filters.jobType === option.value}
                        onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Smart Match */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Smart Match
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
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        filters.matchLevel === option.value
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {option.label} ({option.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Intelligence */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Budget Intelligence
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
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <div>Any budget</div>
                  <div className="text-purple-600 font-semibold">$2K-5K (Your sweet spot)</div>
                  <div className="font-bold text-gray-900">Up to: ${filters.maxBudget.toLocaleString()}</div>
                </div>
              </div>

              {/* Growth Potential */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Growth Potential
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
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        filters.growthType === option.value
                          ? 'bg-blue-100 text-blue-700 font-semibold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">🤖 AI Suggestions</h4>
                <div className="flex items-start gap-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">HOT</span>
                  <span className="text-sm text-gray-700">React + TypeScript projects paying 30% more</span>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunity Listings */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">Loading opportunities...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOpportunities.map(opportunity => {
                  const isExpanded = expandedCards[opportunity.id];
                  
                  return (
                    <div key={opportunity.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200">
                      {/* Card Header */}
                      <div className="p-6 space-y-4">
                        {/* Badges */}
                        <div className="flex justify-between items-start">
                          <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block">
                            {opportunity.match >= 95 ? '🎯 AI PERFECT MATCH' : '🔥 STRONG MATCH'} - {opportunity.match}%
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{opportunity.postedAt}</span>
                            {opportunity.type === 'urgent' && (
                              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                🚨 URGENT
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{opportunity.title}</h3>
                          <p className="text-gray-700 leading-relaxed">{opportunity.description}</p>
                        </div>

                        {/* Market Intelligence - Only for featured */}
                        {opportunity.featured && opportunity.marketIntel && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              <span>📈 {opportunity.marketIntel.demandTrend}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span>💰 {opportunity.marketIntel.rateInfo}</span>
                            </div>
                          </div>
                        )}

                        {/* Client Viability - Different for featured vs non-featured */}
                        {opportunity.featured ? (
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="bg-green-500 text-white px-3 py-1 rounded font-bold text-lg">
                                {opportunity.clientScore}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-yellow-500">★</span>
                                <span className="font-bold text-gray-900">{opportunity.clientRating}</span>
                              </div>
                              <span className="text-sm text-gray-600">💬 {opportunity.responseRate}% response</span>
                              {opportunity.paymentRate && (
                                <span className="text-sm text-gray-600">💰 {opportunity.paymentRate}% paid on time</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Non-featured: Show stats with View Details button */
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold text-purple-600">${opportunity.price?.toLocaleString()}</span>
                                  <span className="text-sm text-gray-600">{opportunity.timeline}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="bg-green-500 text-white px-2 py-1 rounded font-bold text-sm">
                                    {opportunity.clientScore}
                                  </div>
                                  <span className="text-yellow-500">★</span>
                                  <span className="font-bold text-gray-900">{opportunity.clientRating}</span>
                                </div>
                                <span className="text-sm text-gray-600">💬 {opportunity.responseRate}%</span>
                              </div>
                              <button
                                onClick={() => toggleExpand(opportunity.id)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
                              >
                                {isExpanded ? (
                                  <>
                                    Hide Details
                                    <ChevronUp className="w-4 h-4" />
                                  </>
                                ) : (
                                  <>
                                    View Details
                                    <ChevronDown className="w-4 h-4" />
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Expanded Details for Non-Featured Cards */}
                            {isExpanded && (
                              <div className="space-y-4">
                                {/* Market Intelligence */}
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                    <span>📈 {opportunity.type === 'gig' ? 'Service demand up 40% this week' : 'React demand up 35% this week'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <span>💰 Top performers charge ${opportunity.type === 'gig' ? '30-50' : '75-100'}/hr for this work</span>
                                  </div>
                                </div>

                                {/* Payment Rate Info */}
                                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                  💰 96% paid on time • 👥 {opportunity.applicants} applicants
                                </div>
                              </div>
                            )}

                            {/* Apply Buttons - ALWAYS VISIBLE */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <button
                                onClick={() => handleSmartApply(opportunity)}
                                className="px-4 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                              >
                                Apply Now
                              </button>
                              <button
                                onClick={() => handleQuickApply(opportunity)}
                                className="px-4 py-3 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                              >
                                Quick Apply
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Smart Apply Section - Only for Featured */}
                        {opportunity.featured && (
                          <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            {/* AI-Optimized */}
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600 mt-1" />
                                <div>
                                  <h4 className="font-bold text-gray-900">🚀 AI-Optimized Apply</h4>
                                  <p className="text-sm text-gray-600">We'll tailor your proposal based on client preferences</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleSmartApply(opportunity)}
                                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                              >
                                Apply Smart ({opportunity.aiSuccessRate}% success)
                              </button>
                            </div>

                            {/* Quick Apply */}
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <Zap className="w-5 h-5 text-gray-600 mt-1" />
                                <div>
                                  <h4 className="font-bold text-gray-900">⚡ Quick Apply</h4>
                                  <p className="text-sm text-gray-600">Use your profile template</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleQuickApply(opportunity)}
                                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                              >
                                Quick Apply ({opportunity.quickSuccessRate}% success)
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Why You're Perfect - Only for Featured */}
                        {opportunity.featured && opportunity.fitReasons && (
                          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                            <h4 className="font-bold text-gray-900 mb-3">💡 Why you're perfect for this:</h4>
                            <ul className="space-y-2">
                              {opportunity.fitReasons.map((reason, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-700">
                                  <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
