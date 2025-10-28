import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Clock, Briefcase, Star, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import { toast } from 'sonner';

export default function FindWorkPage() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    typeAll: true,
    typeUrgent: false,
    typeFixed: false,
    typeRemote: false,
    minMatch: 80,
    maxBudget: 5000
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockData = [
        {
          id: 1,
          type: 'urgent',
          title: 'Pipe Repair',
          description: 'Kitchen sink pipe leaking, need immediate help. Basic plumbing skills required. Must be available within the hour.',
          price: 120,
          priceType: 'fixed',
          match: 95,
          location: '1.2mi away',
          isRemote: false,
          postedAt: '5 minutes ago'
        },
        {
          id: 2,
          type: 'project',
          title: 'React Dashboard',
          description: 'Build a responsive React dashboard with analytics components and data visualization. The project requires integration with REST APIs and real-time data updates. We need someone with experience in React Hooks, Context API, and charting libraries like Chart.js or D3.',
          price: 2500,
          priceType: 'fixed',
          match: 92,
          location: 'Remote',
          isRemote: true,
          postedAt: '2 hours ago'
        },
        {
          id: 3,
          type: 'urgent',
          title: 'Mobile App Fix',
          description: 'Urgent fix needed for React Native app crashing on iOS 15. The app works fine on Android but crashes on startup for iOS users.',
          price: 450,
          priceType: 'fixed',
          match: 87,
          location: '3.2mi away',
          isRemote: false,
          postedAt: '15 minutes ago'
        },
        {
          id: 4,
          type: 'project',
          title: 'E-commerce Site',
          description: 'Build a complete e-commerce solution with React frontend and Node.js backend. The project includes user authentication, product catalog, shopping cart, payment integration, and admin dashboard.',
          price: 5200,
          priceType: 'fixed',
          match: 89,
          location: 'Remote',
          isRemote: true,
          postedAt: '1 day ago'
        },
        {
          id: 5,
          type: 'project',
          title: 'UI/UX Overhaul',
          description: 'Need help redesigning and improving the user experience of our SaaS application. The current interface is confusing for users.',
          price: 1800,
          priceType: 'fixed',
          match: 78,
          location: 'Remote',
          isRemote: true,
          postedAt: '3 hours ago'
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

  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const updateSlider = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      typeAll: true,
      typeUrgent: false,
      typeFixed: false,
      typeRemote: false,
      minMatch: 80,
      maxBudget: 5000
    });
  };

  const getFilteredOpportunities = () => {
    return opportunities.filter(opp => {
      // Match score filter
      if (opp.match < filters.minMatch) return false;
      
      // Budget filter
      if (opp.price > filters.maxBudget) return false;
      
      // Type filters
      if (!filters.typeAll) {
        if (opp.type === 'urgent' && !filters.typeUrgent) return false;
        if (opp.type === 'project' && !filters.typeFixed) return false;
        if (!opp.isRemote && filters.typeRemote) return false;
      }
      
      return true;
    });
  };

  const toggleExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleApply = (opportunity) => {
    navigate(`/apply/${opportunity.id}`, { state: { opportunity } });
  };

  const filteredOpportunities = getFilteredOpportunities();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">Your Next Gig is Here!</h1>
          <p className="text-lg opacity-90">
            We found {filteredOpportunities.length} perfect matches for your skills
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Job Type</h4>
                <div className="space-y-3">
                  {[
                    { key: 'typeAll', label: 'All' },
                    { key: 'typeUrgent', label: 'Urgent Only' },
                    { key: 'typeFixed', label: 'Fixed-price' },
                    { key: 'typeRemote', label: 'Remote-only' }
                  ].map(filter => (
                    <label key={filter.key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters[filter.key]}
                        onChange={() => toggleFilter(filter.key)}
                        className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <span className="text-gray-700">{filter.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Match Score Slider */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Match Score</h4>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minMatch}
                  onChange={(e) => updateSlider('minMatch', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="text-center mt-2 text-primary font-semibold">
                  Minimum: {filters.minMatch}%
                </div>
              </div>

              {/* Budget Range Slider */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Budget Range</h4>
                <input
                  type="range"
                  min="50"
                  max="10000"
                  value={filters.maxBudget}
                  onChange={(e) => updateSlider('maxBudget', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="text-center mt-2 text-primary font-semibold">
                  Up to: ${filters.maxBudget.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">Loading opportunities...</p>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-md">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOpportunities.map(opportunity => {
                  const isExpanded = expandedCards[opportunity.id];
                  const isLongDescription = opportunity.description.length > 150;
                  
                  return (
                    <div
                      key={opportunity.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              opportunity.type === 'urgent' 
                                ? 'bg-red-100 text-red-600' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {opportunity.type === 'urgent' ? '🚨 URGENT' : '📅 PROJECT'}
                            </span>
                            <span className="text-xs text-gray-500">{opportunity.postedAt}</span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">{opportunity.title}</h3>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-primary">${opportunity.price.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{opportunity.priceType}</div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <p className={`text-gray-700 leading-relaxed mb-4 ${
                          !isExpanded && isLongDescription ? 'line-clamp-3' : ''
                        }`}>
                          {opportunity.description}
                        </p>
                        
                        {isLongDescription && (
                          <button
                            onClick={() => toggleExpand(opportunity.id)}
                            className="text-primary font-medium text-sm flex items-center gap-1 hover:underline mb-4"
                          >
                            {isExpanded ? (
                              <>
                                Show less <ChevronUp className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                Read more <ChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{opportunity.location}</span>
                            </div>
                          </div>
                          <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Match: {opportunity.match}%
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="bg-gray-50 px-6 py-4 flex gap-3">
                        <button
                          className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleApply(opportunity)}
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                        >
                          Apply Now
                        </button>
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
