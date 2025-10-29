import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import UberLikeGigFinder from '../utils/UberLikeGigFinder';
import '../styles/UberLikeGigFinder.css';

export default function FindGigsPage() {
  const { user } = useAuth();
  const gigFinderRef = useRef(null);

  useEffect(() => {
    // Initialize the Uber-like gig finder
    gigFinderRef.current = new UberLikeGigFinder();
    
    // Expose to window for onclick handlers
    window.gigFinder = gigFinderRef.current;

    return () => {
      // Cleanup on unmount
      if (gigFinderRef.current) {
        gigFinderRef.current.cleanup();
      }
      delete window.gigFinder;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Gigs Near You
          </h1>
          <p className="text-gray-600" id="gigCount">
            Loading nearby gigs...
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              id="gigSearch"
              placeholder="Search for gigs (e.g., plumber, electrician, cleaning...)"
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="filter-chips mb-6">
          <button 
            className="filter-chip active" 
            data-filter="available-now"
          >
            ⚡ Available Now
          </button>
          <button 
            className="filter-chip active" 
            data-filter="within-20mi"
          >
            📍 Within 20 miles
          </button>
          <button 
            className="filter-chip active" 
            data-filter="nearest-first"
          >
            🎯 Nearest First
          </button>
          <button className="filter-chip" data-filter="high-pay">
            💰 High Pay
          </button>
          <button className="filter-chip" data-filter="urgent-only">
            🔥 Urgent Only
          </button>
        </div>

        {/* Gigs Feed */}
        <div className="gigs-feed-container">
          <div id="gigsFeed">
            {/* Gigs will be rendered here by UberLikeGigFinder */}
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Finding gigs near you...</p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold mb-2">Instant Matching</h3>
            <p className="text-sm text-gray-600">
              Get matched with gigs in real-time based on your location and skills
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold mb-2">Quick Apply</h3>
            <p className="text-sm text-gray-600">
              One-tap application to start earning immediately
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2">Smart Matching</h3>
            <p className="text-sm text-gray-600">
              We show you the best gigs based on your profile and location
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
