import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, DollarSign, Clock, Zap, Navigation, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import NavigationBar from '../components/NavigationBar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function QuickHireWorkerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nearbyGigs, setNearbyGigs] = useState([]);
  const [myActiveGigs, setMyActiveGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Could not detect location');
        }
      );
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyGigs();
      fetchMyActiveGigs();
      
      // Poll for new gigs every 10 seconds
      const interval = setInterval(() => {
        fetchNearbyGigs();
        fetchMyActiveGigs();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [userLocation]);

  const fetchNearbyGigs = async () => {
    if (!userLocation) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/quickhire/gigs/nearby?workerId=${user.id || user.email}&latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&radius=10`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby gigs');
      }
      
      const data = await response.json();
      setNearbyGigs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching nearby gigs:', error);
      if (loading) {
        toast.error('Failed to load nearby gigs');
        setLoading(false);
      }
    }
  };

  const fetchMyActiveGigs = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/quickhire/gigs/worker/${user.id || user.email}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch my gigs');
      }
      
      const data = await response.json();
      // Filter for active gigs only
      const active = data.filter(g => 
        ['Matched', 'On-Route', 'Arrived', 'In-Progress'].includes(g.status)
      );
      setMyActiveGigs(active);
    } catch (error) {
      console.error('Error fetching my gigs:', error);
    }
  };

  const handleAcceptGig = async (gig) => {
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }

    setAccepting(gig.id);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/quickhire/gigs/${gig.id}/accept?workerId=${user.id || user.email}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'Point',
            coordinates: [userLocation.longitude, userLocation.latitude],
            address: 'Current Location'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to accept gig');
      }

      toast.success('Gig accepted! Navigate to the location.');
      
      // Refresh lists
      fetchNearbyGigs();
      fetchMyActiveGigs();
      
      // Navigate to tracking
      setTimeout(() => {
        navigate(`/quickhire/worker/${gig.id}`);
      }, 1000);
      
    } catch (error) {
      console.error('Error accepting gig:', error);
      toast.error('Failed to accept gig');
    } finally {
      setAccepting(null);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchNearbyGigs();
    fetchMyActiveGigs();
    toast.success('Refreshed gigs list');
  };

  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Getting your location...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">QuickHire Gigs</h1>
            <p className="text-lg text-gray-600">Available gigs near you</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* My Active Gigs */}
        {myActiveGigs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Active Gigs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myActiveGigs.map(gig => (
                <div
                  key={gig.id}
                  onClick={() => navigate(`/quickhire/worker/${gig.id}`)}
                  className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{gig.category}</h3>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                      {gig.status}
                    </span>
                  </div>
                  <p className="text-green-100 mb-3 line-clamp-2">{gig.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${gig.estimatedPrice}</span>
                    {gig.eta && (
                      <span className="text-sm">ETA: {gig.eta} min</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Available Gigs */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Available Gigs Nearby ({nearbyGigs.length})
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading nearby gigs...</p>
          </div>
        ) : nearbyGigs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No gigs available right now</h3>
            <p className="text-gray-600 mb-4">Check back soon for new QuickHire requests near you</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all"
            >
              Refresh Gigs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyGigs.map(gig => (
              <div key={gig.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{gig.category}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {gig.distance} miles away
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    gig.urgency === 'ASAP' ? 'bg-red-100 text-red-700' :
                    gig.urgency === 'Today' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {gig.urgency}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-3">{gig.description}</p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      ETA:
                    </span>
                    <span className="font-semibold text-gray-900">{gig.eta} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Estimated:
                    </span>
                    <span className="text-2xl font-bold text-green-600">${gig.estimatedPrice}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleAcceptGig(gig)}
                  disabled={accepting === gig.id}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {accepting === gig.id ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Accept Gig
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Posted {new Date(gig.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
