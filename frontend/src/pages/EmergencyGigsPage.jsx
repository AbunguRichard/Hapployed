import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Zap, MapPin, Clock, DollarSign, AlertCircle } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import { toast } from 'sonner';

export default function EmergencyGigsPage() {
  const [searchParams] = useSearchParams();
  const [isAvailable, setIsAvailable] = useState(searchParams.get('available') === 'true');
  const [emergencyGigs, setEmergencyGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAvailable) {
      toast.success('You are now available for Quick Hire!', {
        description: 'Clients looking for immediate help can now see your profile',
        duration: 5000
      });
    }
    
    // Fetch emergency gigs
    fetchEmergencyGigs();
  }, [isAvailable]);

  const fetchEmergencyGigs = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockGigs = [
        {
          id: '1',
          title: 'Plumber Needed - Burst Pipe Emergency',
          location: '2.3 miles away',
          urgency: 'URGENT',
          pay: '$80/hr',
          duration: '2-3 hours',
          postedAt: '5 minutes ago',
          description: 'Need immediate help with burst pipe in kitchen'
        },
        {
          id: '2',
          title: 'Moving Help - Today Only',
          location: '1.8 miles away',
          urgency: 'TODAY',
          pay: '$25/hr',
          duration: '4 hours',
          postedAt: '12 minutes ago',
          description: 'Need 2 people to help move furniture today'
        },
        {
          id: '3',
          title: 'Emergency Electrician - No Power',
          location: '0.5 miles away',
          urgency: 'URGENT',
          pay: '$100/hr',
          duration: '1-2 hours',
          postedAt: '8 minutes ago',
          description: 'Power outage in home office, need immediate fix'
        },
        {
          id: '4',
          title: 'Event Staff Needed - Tonight',
          location: '3.1 miles away',
          urgency: 'TONIGHT',
          pay: '$30/hr',
          duration: '6 hours',
          postedAt: '15 minutes ago',
          description: 'Corporate event needs 3 more servers for tonight'
        }
      ];
      
      setTimeout(() => {
        setEmergencyGigs(mockGigs);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching emergency gigs:', error);
      setLoading(false);
      toast.error('Failed to load emergency gigs');
    }
  };

  const handleApply = (gigId) => {
    toast.success('Application sent!', {
      description: 'The client will be notified immediately'
    });
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'URGENT':
        return 'bg-red-500';
      case 'TODAY':
        return 'bg-orange-500';
      case 'TONIGHT':
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Emergency Gigs</h1>
              <p className="text-gray-600">Find a pro available right now</p>
            </div>
          </div>

          {/* Availability Status */}
          {isAvailable && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-2"></div>
              <div className="flex-1">
                <p className="text-green-900 font-semibold">You're Available for Quick Hire</p>
                <p className="text-green-700 text-sm">Clients can see you're ready for immediate work</p>
              </div>
              <button
                onClick={() => {
                  setIsAvailable(false);
                  toast.info('You are no longer available for Quick Hire');
                }}
                className="text-green-700 hover:text-green-900 text-sm font-medium"
              >
                Turn Off
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading emergency gigs...</p>
          </div>
        )}

        {/* Emergency Gigs List */}
        {!loading && (
          <div className="space-y-4">
            {emergencyGigs.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Emergency Gigs Right Now</h3>
                <p className="text-gray-600">Check back soon or explore other opportunities</p>
              </div>
            ) : (
              emergencyGigs.map((gig) => (
                <div
                  key={gig.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{gig.title}</h3>
                        <span className={`${getUrgencyColor(gig.urgency)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                          {gig.urgency}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{gig.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{gig.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold">{gig.pay}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span>{gig.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleApply(gig.id)}
                      className="ml-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex-shrink-0"
                    >
                      Quick Apply
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Posted {gig.postedAt}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
