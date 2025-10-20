import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Shield, Heart, MessageCircle, Phone, Eye, 
  Star, DollarSign, Map, Search, Share2, Flag, Ban
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '../components/DashboardHeader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function GigsNearMePage() {
  const [savedGigs, setSavedGigs] = useState([]);
  const [acceptedGigs, setAcceptedGigs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [showAvailableNow, setShowAvailableNow] = useState(false);
  const [distanceRadius, setDistanceRadius] = useState('20');
  const [sortBy, setSortBy] = useState('nearest');
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch gigs from backend
  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs/gigs`);
      const data = await response.json();
      setGigs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      toast.error('Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (gigId) => {
    setSavedGigs(prev => 
      prev.includes(gigId) ? prev.filter(id => id !== gigId) : [...prev, gigId]
    );
    toast.success(savedGigs.includes(gigId) ? 'Removed from saved' : 'Saved for later');
  };

  const handleAccept = (gigId) => {
    setAcceptedGigs(prev => [...prev, gigId]);
    toast.success('Request sent! Client will contact you shortly.', {
      description: 'Check your phone and email for updates.'
    });
  };

  const handleCall = (gig) => {
    toast.info(`Calling ${gig.client?.name || 'client'}...`, {
      description: 'Feature coming soon!'
    });
  };

  const handleMessage = () => {
    toast.info('Messaging feature coming soon!');
  };

  const handleDirections = (gig) => {
    toast.info(`Getting directions to ${gig.client?.location || 'location'}...`);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-current' : ''}`}
          />
        ))}
      </div>
    );
  };

  const urgentGigsCount = gigs.filter(g => g.urgent || g.badge?.type === 'urgent').length;
  const availableGigsCount = gigs.filter(g => g.availableNow).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔥 Gigs Near You — Act Fast!
          </h1>
          <p className="text-gray-600">
            <strong className="text-red-600">{urgentGigsCount} urgent gigs</strong> and{' '}
            <strong className="text-green-600">{availableGigsCount} available now</strong> within your area
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by skills, tags, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Urgent Toggle */}
            <button
              onClick={() => setShowUrgentOnly(!showUrgentOnly)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showUrgentOnly
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              }`}
            >
              🚨 Urgent
            </button>

            {/* Available Now Toggle */}
            <button
              onClick={() => setShowAvailableNow(!showAvailableNow)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showAvailableNow
                  ? 'bg-green-500 text-white'
                  : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
              }`}
            >
              🟢 Available Now
            </button>

            {/* Distance Radius */}
            <select
              value={distanceRadius}
              onChange={(e) => setDistanceRadius(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="2">Within 2 mi</option>
              <option value="5">Within 5 mi</option>
              <option value="10">Within 10 mi</option>
              <option value="20">Within 20 mi</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="nearest">Nearest first</option>
              <option value="highest-pay">Highest pay</option>
              <option value="best-match">Best match</option>
              <option value="most-urgent">Most urgent</option>
            </select>

            {/* Map View Button */}
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <Map className="w-4 h-4" />
              Map View
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading gigs near you...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Gig Cards */}
            <div className="space-y-4">
              {gigs.map((gig) => {
                const isSaved = savedGigs.includes(gig.id);
                const isAccepted = acceptedGigs.includes(gig.id);

                return (
                  <div
                    key={gig.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-6">
                      {/* Left Content */}
                      <div className="flex-1">
                        {/* Title and Badges */}
                        <div className="flex items-start gap-3 mb-3">
                          <h2 className="text-xl font-bold text-gray-900">{gig.title}</h2>
                          
                          {gig.badge && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                gig.badge.type === 'urgent'
                                  ? 'bg-red-500 text-white'
                                  : gig.badge.type === 'emergency'
                                  ? 'bg-red-600 text-white animate-pulse'
                                  : 'bg-orange-500 text-white'
                              }`}
                            >
                              {gig.badge.text || 'Urgent'}
                            </span>
                          )}

                          {gig.availableNow && (
                            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                              Available Now
                            </span>
                          )}
                        </div>

                        {/* Payment Info */}
                        <div className="flex items-center gap-4 mb-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                              {gig.budget?.amount || '$50'}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                              {gig.budget?.type || 'Fixed'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{gig.startTime || 'ASAP'}</span>
                          </div>
                        </div>

                        {/* Tags/Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(gig.skills || []).slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-lg border border-purple-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Poster Info */}
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {gig.client?.name || 'Guest User'}
                            </span>
                            {gig.client?.verified && (
                              <Shield className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {renderStars(gig.client?.rating || 4.5)}
                            <span className="text-sm text-gray-600 ml-1">
                              ({gig.client?.reviews || 0})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-gray-600 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{gig.client?.location || 'Unknown'}</span>
                          </div>

                          <span className="text-sm text-gray-500">
                            Posted {gig.postedTime || '1h ago'}
                          </span>
                        </div>

                        {/* Match and Distance */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">Match:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-yellow-400 to-green-500"
                                  style={{ width: `${gig.matchScore || 85}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-gray-900">{gig.matchScore || 85}%</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">{gig.distance || '2.3 mi'}</span>
                            <span>• {gig.eta || '10 min'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        {/* Save Button */}
                        <button
                          onClick={() => toggleSave(gig.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isSaved
                              ? 'bg-red-50 text-red-600'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        {/* Action Buttons */}
                        <button
                          onClick={() => handleCall(gig)}
                          className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </button>

                        <button
                          onClick={handleMessage}
                          className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </button>

                        <button
                          onClick={() => handleDirections(gig)}
                          className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <MapPin className="w-4 h-4" />
                          Directions
                        </button>

                        {/* Accept Now Button */}
                        <button
                          onClick={() => handleAccept(gig.id)}
                          disabled={isAccepted}
                          className={`px-4 py-3 rounded-lg font-bold transition-all ${
                            isAccepted
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                          }`}
                        >
                          {isAccepted ? 'Request Sent' : 'Accept Now'}
                        </button>

                        {/* View More Button */}
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4" />
                          View More
                        </button>

                        {/* Secondary Actions */}
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <button
                            onClick={() => toast.info('Share ETA feature coming soon')}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Share ETA"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toast.info('Report feature coming soon')}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Report"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toast.info('Block feature coming soon')}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Block"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {gigs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No gigs available at the moment.</p>
                <button
                  onClick={fetchGigs}
                  className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Refresh Gigs
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
