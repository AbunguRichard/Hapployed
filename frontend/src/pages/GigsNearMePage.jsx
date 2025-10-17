import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Zap, Clock, Award, Filter, LayoutList, Layers, 
  ChevronDown, Search, X, Heart, MessageSquare, Share2, 
  AlertTriangle, CheckCircle2, Star, DollarSign, User, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardNav from '../components/DashboardNav';
import MessagingPanel from '../components/MessagingPanel';
import GigCard from '../components/GigCard';
import SwipeView from '../components/SwipeView';

export default function GigsNearMePage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'swipe'
  const [activeFilters, setActiveFilters] = useState(['nearMe']);
  const [showUrgentBanner, setShowUrgentBanner] = useState(true);
  const [selectedRadius, setSelectedRadius] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showMessaging, setShowMessaging] = useState(false);
  const [savedGigs, setSavedGigs] = useState([]);
  
  // Mock gig data with all required fields
  const mockGigs = [
    {
      id: 1,
      title: 'Emergency Gig',
      distance: '0.0 mi away',
      pay: '$50/hour',
      duration: '2-3 hours',
      startTime: 'Now',
      category: 'Home Repair',
      skills: ['Plumbing', 'Emergency'],
      clientVerified: true,
      backgroundCheck: false,
      matchScore: 95,
      urgent: true,
      applicants: 3,
      timeLeft: '2 hours left',
      description: 'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
      client: {
        name: 'John Smith',
        rating: 4.8,
        verified: true,
      }
    },
    {
      id: 2,
      title: 'Delivery Driver Needed',
      distance: '2.5 mi away',
      pay: '$25/hour',
      duration: '4 hours',
      startTime: 'Today 4-7pm',
      category: 'Delivery',
      skills: ['Driving', 'Customer Service'],
      clientVerified: true,
      backgroundCheck: true,
      matchScore: 88,
      urgent: false,
      applicants: 8,
      timeLeft: '5 hours left',
      description: 'Need reliable driver for local deliveries.',
      client: {
        name: 'Restaurant LLC',
        rating: 4.6,
        verified: true,
      }
    },
    {
      id: 3,
      title: 'React Developer for Weekend Project',
      distance: '5.2 mi away',
      pay: '$75/hour',
      duration: '8 hours',
      startTime: 'Tomorrow',
      category: 'IT & Tech',
      skills: ['React', 'JavaScript', 'Node.js'],
      clientVerified: true,
      backgroundCheck: false,
      matchScore: 92,
      urgent: false,
      applicants: 15,
      timeLeft: '1 day left',
      description: 'Build a dashboard with real-time data.',
      client: {
        name: 'Tech Startup',
        rating: 4.9,
        verified: true,
      }
    },
  ];

  const filterOptions = [
    { id: 'nearMe', label: 'Near Me', icon: MapPin },
    { id: 'emergency', label: 'Emergency / QuickHire', icon: Zap },
    { id: 'recent', label: 'Recently Posted', icon: Clock },
    { id: 'notFilled', label: 'Not Filled Yet', icon: AlertTriangle },
    { id: 'highMatch', label: 'High Match', icon: Award },
  ];

  const radiusOptions = [1, 3, 5, 10, 15, 25, 50, 'Anywhere'];
  const categories = ['All Categories', 'Home Repair', 'Delivery', 'IT & Tech', 'Admin Help', 'Events', 'Cleaning', 'Pet Care', 'Creative'];
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'highestPay', label: 'Highest Pay' },
    { value: 'closest', label: 'Closest' },
    { value: 'bestMatch', label: 'Best Match (AI)' },
    { value: 'endingSoon', label: 'Ending Soon' },
  ];

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleSaveGig = (gigId) => {
    setSavedGigs(prev => 
      prev.includes(gigId) 
        ? prev.filter(id => id !== gigId)
        : [...prev, gigId]
    );
    toast.success(savedGigs.includes(gigId) ? 'Gig removed from saved' : 'Gig saved!');
  };

  const handleApply = (gigId, quick = false) => {
    if (quick) {
      toast.success('Quick Apply sent! You\'re available now.', {
        description: 'The client will contact you shortly.',
      });
    } else {
      toast.success('Application sent successfully!', {
        description: 'We\'ll notify you when the client responds.',
      });
    }
  };

  const urgentGigsNearby = mockGigs.filter(g => g.urgent && parseFloat(g.distance) < selectedRadius).length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">Gigs Near Me</h1>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{mockGigs.length}</span> new opportunities nearby • 
            <span className="text-destructive font-semibold"> {urgentGigsNearby} URGENT</span>
          </p>
        </div>

        {/* Urgent Banner */}
        {showUrgentBanner && urgentGigsNearby > 0 && (
          <div className="mb-6 p-4 bg-accent/10 border-2 border-accent rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <p className="text-foreground">
                <span className="font-semibold">Detected:</span> You're within {selectedRadius} miles of {urgentGigsNearby} urgent request{urgentGigsNearby > 1 ? 's' : ''} — switch to Emergency/QuickHire Mode?
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  toggleFilter('emergency');
                  setShowUrgentBanner(false);
                }}
                className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-colors"
              >
                YES
              </button>
              <button 
                onClick={() => setShowUrgentBanner(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filterOptions.map(filter => {
            const Icon = filter.icon;
            const isActive = activeFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-white border border-border text-foreground hover:border-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Controls Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('swipe')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'swipe' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Miles Dropdown */}
            <select 
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(e.target.value === 'Anywhere' ? 'Anywhere' : parseInt(e.target.value))}
              className="px-4 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {radiusOptions.map(radius => (
                <option key={radius} value={radius}>
                  {radius === 'Anywhere' ? 'Anywhere' : `Within ${radius} miles`}
                </option>
              ))}
            </select>

            {/* Categories Dropdown */}
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase().replace(/ /g, '_')}>{cat}</option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Messages Button */}
          <button 
            onClick={() => setShowMessaging(!showMessaging)}
            className="ml-auto relative px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Messages
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center">3</span>
          </button>
        </div>

        {/* View Content */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {mockGigs.map(gig => (
              <GigCard 
                key={gig.id}
                gig={gig}
                onSave={handleSaveGig}
                onApply={handleApply}
                isSaved={savedGigs.includes(gig.id)}
                showMatchScore={activeFilters.includes('highMatch')}
              />
            ))}
          </div>
        ) : (
          <SwipeView 
            gigs={mockGigs}
            onSave={handleSaveGig}
            onApply={handleApply}
            savedGigs={savedGigs}
          />
        )}
      </main>

      {/* Messaging Panel */}
      {showMessaging && (
        <MessagingPanel onClose={() => setShowMessaging(false)} />
      )}
    </div>
  );
}