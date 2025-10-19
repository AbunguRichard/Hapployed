import React, { useState } from 'react';
import { 
  MapPin, Zap, Clock, Shield, Heart, MessageCircle, ChevronDown, ChevronUp, 
  Check, Target, Star, DollarSign, Users, AlertCircle, Navigation, Phone, Map
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardNav from '../components/DashboardNav';

export default function GigsNearMePage() {
  const [savedGigs, setSavedGigs] = useState([]);
  const [acceptedGigs, setAcceptedGigs] = useState([]);
  const [expandedGigs, setExpandedGigs] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const gigs = [
    {
      id: 1,
      title: 'EMERGENCY: Burst Pipe - Need Plumber NOW',
      badge: { text: '🚨 EMERGENCY', type: 'emergency' },
      urgent: true,
      description: 'Burst pipe flooding basement. Need licensed plumber immediately. Tools required. Payment upon completion.',
      budget: { amount: '$150-250', type: 'Fixed' },
      distance: '0.8 miles away',
      eta: '12 mins',
      availableNow: true,
      startTime: 'ASAP',
      duration: '2-3 hours',
      client: {
        name: 'Sarah Johnson',
        rating: 4.9,
        reviews: 18,
        totalHired: '12 times',
        location: '123 Oak Street',
        verified: true,
        responseRate: '100%',
        avgResponseTime: '5 mins',
        phoneVerified: true
      },
      skills: ['Plumbing', 'Emergency Repair', 'Licensed'],
      accepting: 2,
      hired: 0,
      postedTime: '8 mins ago',
      expiresIn: '45 mins',
      matchScore: 98,
      requirements: {
        mustHave: ['Licensed plumber', 'Own tools', 'Available now'],
        niceToHave: ['Insurance', 'Emergency experience']
      },
      payment: {
        method: 'Cash on completion',
        verified: true
      }
    },
    {
      id: 2,
      title: 'Last Minute: House Cleaning Before Guests Arrive',
      badge: { text: '⚡ URGENT', type: 'urgent' },
      urgent: true,
      description: 'Need house cleaned in next 3 hours before guests arrive. 3 bedroom, 2 bath. All supplies provided.',
      budget: { amount: '$80-120', type: 'Fixed' },
      distance: '1.5 miles away',
      eta: '18 mins',
      availableNow: true,
      startTime: 'Next 30 mins',
      duration: '3 hours',
      client: {
        name: 'Michael Chen',
        rating: 4.7,
        reviews: 24,
        totalHired: '31 times',
        location: '456 Maple Avenue',
        verified: true,
        responseRate: '95%',
        avgResponseTime: '10 mins',
        phoneVerified: true
      },
      skills: ['House Cleaning', 'Deep Clean', 'Quick Service'],
      accepting: 5,
      hired: 1,
      postedTime: '22 mins ago',
      expiresIn: '2 hours',
      matchScore: 92,
      requirements: {
        mustHave: ['Professional cleaner', 'Available immediately', 'References'],
        niceToHave: ['Eco-friendly products', 'Pet-friendly']
      },
      payment: {
        method: 'Cash or Venmo',
        verified: true
      }
    },
    {
      id: 3,
      title: 'Moving Help Needed Today - Heavy Furniture',
      badge: null,
      urgent: false,
      description: 'Need 2 people to help move furniture from truck to 2nd floor apartment. No elevator. Strong lifters needed.',
      budget: { amount: '$40/hr per person', type: 'Hourly' },
      distance: '2.3 miles away',
      eta: '25 mins',
      availableNow: false,
      startTime: 'Today 2-6pm',
      duration: '3-4 hours',
      client: {
        name: 'Lisa Martinez',
        rating: 5.0,
        reviews: 8,
        totalHired: '8 times',
        location: '789 Pine Road',
        verified: false,
        responseRate: '88%',
        avgResponseTime: '15 mins',
        phoneVerified: true
      },
      skills: ['Moving', 'Heavy Lifting', 'Teamwork'],
      accepting: 3,
      hired: 0,
      postedTime: '1 hour ago',
      expiresIn: '5 hours',
      matchScore: 85,
      requirements: {
        mustHave: ['Physically fit', 'Available 2-6pm', '2 people needed'],
        niceToHave: ['Moving experience', 'Own truck']
      },
      payment: {
        method: 'Cash',
        verified: false
      }
    },
    {
      id: 4,
      title: 'Yard Work - Lawn Mowing & Trimming',
      badge: null,
      urgent: false,
      description: 'Weekly lawn maintenance needed. Front and back yard, includes mowing, edging, and trimming. Equipment provided.',
      budget: { amount: '$60', type: 'Fixed' },
      distance: '3.7 miles away',
      eta: '35 mins',
      availableNow: false,
      startTime: 'This weekend',
      duration: '2 hours',
      client: {
        name: 'Robert Williams',
        rating: 4.8,
        reviews: 15,
        totalHired: '20 times',
        location: '321 Elm Street',
        verified: true,
        responseRate: '92%',
        avgResponseTime: '20 mins',
        phoneVerified: true
      },
      skills: ['Lawn Care', 'Yard Work', 'Landscaping'],
      accepting: 8,
      hired: 2,
      postedTime: '3 hours ago',
      expiresIn: '2 days',
      matchScore: 78,
      requirements: {
        mustHave: ['Lawn care experience', 'Weekend availability'],
        niceToHave: ['Own equipment', 'Regular weekly work']
      },
      payment: {
        method: 'Check or Cash',
        verified: true
      }
    }
  ];

  const toggleSave = (gigId) => {
    setSavedGigs(prev => 
      prev.includes(gigId) ? prev.filter(id => id !== gigId) : [...prev, gigId]
    );
    toast.success(savedGigs.includes(gigId) ? 'Removed from saved' : 'Saved for later');
  };

  const toggleExpand = (gigId) => {
    setExpandedGigs(prev =>
      prev.includes(gigId) ? prev.filter(id => id !== gigId) : [...prev, gigId]
    );
  };

  const handleAccept = (gigId) => {
    setAcceptedGigs(prev => [...prev, gigId]);
    toast.success('Request sent! Client will contact you shortly.', {
      description: 'Check your phone and email for updates.'
    });
  };

  const handleCall = (gig) => {
    toast.info(`Calling ${gig.client.name}...`, {
      description: 'Feature coming soon!'
    });
  };

  const handleMessage = () => {
    toast.info('Messaging feature coming soon!');
  };

  const handleGetDirections = (gig) => {
    toast.info(`Getting directions to ${gig.client.location}...`);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => <span key={i}>★</span>)}
        {hasHalfStar && <span>☆</span>}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => <span key={`empty-${i}`} className="text-gray-400">☆</span>)}
      </>
    );
  };

  const getMatchColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getUrgencyColor = (gig) => {
    if (gig.badge?.type === 'emergency') return 'border-red-400 bg-red-50/50';
    if (gig.badge?.type === 'urgent') return 'border-orange-400 bg-orange-50/50';
    return 'border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🔥 Gigs Near You - Act Fast!
          </h1>
          <p className="text-lg text-muted-foreground">
            <strong>{gigs.filter(g => g.urgent).length} urgent gigs</strong> and <strong>{gigs.filter(g => !g.urgent).length} regular gigs</strong> within 5 miles of you.
          </p>
        </div>

        {/* Emergency Alert Banner */}
        {gigs.some(g => g.badge?.type === 'emergency') && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900 text-lg">🚨 EMERGENCY GIGS AVAILABLE</h3>
              <p className="text-red-700">Someone needs help RIGHT NOW! Respond within minutes to get hired.</p>
            </div>
          </div>
        )}

        {/* Filter & View Toggle Bar */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-bold">
                🚨 Emergency Only
              </button>
              
              <button className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors font-bold">
                ⚡ Urgent
              </button>
              
              <button className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors font-medium">
                🟢 Available Now
              </button>

              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                <option>Within 5 miles</option>
                <option>Within 2 miles</option>
                <option>Within 10 miles</option>
                <option>Within 20 miles</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary font-medium">
                <option>Nearest first</option>
                <option>Highest pay</option>
                <option>Best match</option>
                <option>Most urgent</option>
              </select>

              <button 
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
              >
                <Map className="w-4 h-4" />
                {viewMode === 'list' ? 'Map View' : 'List View'}
              </button>
            </div>
          </div>
        </div>

        {/* Gig Cards */}
        <div className="space-y-4">
          {gigs.map((gig) => {
            const isSaved = savedGigs.includes(gig.id);
            const isAccepted = acceptedGigs.includes(gig.id);
            const isExpanded = expandedGigs.includes(gig.id);

            return (
              <div
                key={gig.id}
                className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${getUrgencyColor(gig)}`}
              >
                <div className="p-6">
                  {/* Header with Badges */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-foreground">
                          {gig.title}
                        </h2>
                        
                        {gig.badge && (
                          <span className={`px-3 py-1 rounded-full text-sm font-bold animate-pulse ${
                            gig.badge.type === 'emergency' 
                              ? 'bg-red-500 text-white' 
                              : 'bg-orange-500 text-white'
                          }`}>
                            {gig.badge.text}
                          </span>
                        )}
                        
                        {gig.client.verified && (
                          <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Verified Client
                          </span>
                        )}

                        {gig.availableNow && (
                          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold flex items-center gap-1 animate-pulse">
                            🟢 AVAILABLE NOW
                          </span>
                        )}
                      </div>

                      {/* Match Score & Location */}
                      <div className="flex items-center gap-4 mb-3 flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                          <Target className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-700">{gig.matchScore}% Match</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${getMatchColor(gig.matchScore)}`}
                              style={{ width: `${gig.matchScore}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-blue-700">{gig.distance}</span>
                          <span className="text-blue-600">• {gig.eta} drive</span>
                        </div>

                        {gig.expiresIn && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-lg">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-orange-700 font-medium">Expires in {gig.expiresIn}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => toggleSave(gig.id)}
                      className={`p-2 rounded-full transition-all ${
                        isSaved 
                          ? 'bg-red-100 text-red-500' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Budget & Timeline */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-200 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-700 text-lg">{gig.budget.amount}</span>
                      <span className="text-green-600 font-medium">{gig.budget.type}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-purple-700 font-medium">{gig.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 font-medium">Start: {gig.startTime}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4 leading-relaxed text-base">
                    {gig.description}
                  </p>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                      {/* Requirements */}
                      <div>
                        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                          <Check className="w-5 h-5 text-primary" />
                          Requirements:
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Must Have:</p>
                            <ul className="space-y-1">
                              {gig.requirements.mustHave.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-700">
                                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Nice to Have:</p>
                            <ul className="space-y-1">
                              {gig.requirements.niceToHave.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-500">
                                  <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-primary" />
                          Payment:
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-700">
                            {gig.payment.method}
                          </span>
                          {gig.payment.verified && (
                            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm font-medium flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Payment Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Client Info */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-foreground">{gig.client.name}</h3>
                          {gig.client.phoneVerified && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 text-yellow-500 text-base">
                            {renderStars(gig.client.rating)}
                            <span className="ml-1 text-gray-700 font-bold text-sm">
                              {gig.client.rating}/5
                            </span>
                            <span className="text-gray-600 text-sm">
                              ({gig.client.reviews} reviews)
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">{gig.client.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-700">Hired {gig.client.totalHired}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">{gig.client.responseRate} response rate</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-gray-700">Avg: {gig.client.avgResponseTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {gig.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Activity Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 font-medium text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{gig.accepting} people considering</span>
                    </div>
                    {gig.hired > 0 && (
                      <>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-2 font-medium text-green-600">
                          <Check className="w-4 h-4" />
                          <span>{gig.hired} already hired</span>
                        </div>
                      </>
                    )}
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Posted {gig.postedTime}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => toggleSave(gig.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                        isSaved
                          ? 'bg-red-100 text-red-600 border-2 border-red-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleCall(gig)}
                      className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl font-bold hover:bg-green-50 transition-all"
                    >
                      <Phone className="w-5 h-5" />
                      Call
                    </button>

                    <button
                      onClick={handleMessage}
                      className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Message
                    </button>

                    <button
                      onClick={() => handleGetDirections(gig)}
                      className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all"
                    >
                      <Navigation className="w-5 h-5" />
                      Directions
                    </button>

                    <button
                      onClick={() => handleAccept(gig.id)}
                      disabled={isAccepted}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                        isAccepted
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105'
                      }`}
                    >
                      {isAccepted ? (
                        <>
                          <Check className="w-5 h-5" />
                          Request Sent
                        </>
                      ) : (
                        <>
                          {gig.urgent ? '🚀 Accept Now' : '✓ I\'m Interested'}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => toggleExpand(gig.id)}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-5 h-5" />
                          Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-5 h-5" />
                          More
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
            Load More Gigs Nearby
          </button>
        </div>
      </div>
    </div>
  );
}
