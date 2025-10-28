import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, DollarSign, User, Phone, MessageCircle, Star, CheckCircle, Navigation, Loader } from 'lucide-react';
import { toast } from 'sonner';
import NavigationBar from '../components/NavigationBar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function QuickHireTrackingPage() {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (gigId) {
      fetchGigDetails();
      // Poll for updates every 5 seconds
      const interval = setInterval(fetchGigDetails, 5000);
      return () => clearInterval(interval);
    }
  }, [gigId]);

  const fetchGigDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/quickhire/gigs/${gigId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch gig');
      }
      
      const data = await response.json();
      setGig(data);
      setLoading(false);
      
      // Show toast notifications on status changes
      if (data.status === 'Matched' && !sessionStorage.getItem(`matched-${gigId}`)) {
        toast.success('Worker matched! They are on their way!');
        sessionStorage.setItem(`matched-${gigId}`, 'true');
      } else if (data.status === 'Arrived' && !sessionStorage.getItem(`arrived-${gigId}`)) {
        toast.success('Worker has arrived at your location!');
        sessionStorage.setItem(`arrived-${gigId}`, 'true');
      } else if (data.status === 'In-Progress' && !sessionStorage.getItem(`progress-${gigId}`)) {
        toast.success('Work has started!');
        sessionStorage.setItem(`progress-${gigId}`, 'true');
      } else if (data.status === 'Complete' && !sessionStorage.getItem(`complete-${gigId}`)) {
        toast.success('Work completed! Payment processed.');
        sessionStorage.setItem(`complete-${gigId}`, 'true');
      }
    } catch (error) {
      console.error('Error fetching gig details:', error);
      if (loading) {
        toast.error('Failed to load gig details');
      }
    }
  };

  const handleConfirmComplete = async () => {
    setCompleting(true);
    try {
      // In real implementation, this would trigger payment capture
      toast.success('Thank you! Payment has been processed.');
      navigate(`/quickhire/rate/${gigId}`);
    } catch (error) {
      console.error('Error confirming completion:', error);
      toast.error('Failed to confirm completion');
    } finally {
      setCompleting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Posted': 'bg-blue-500',
      'Dispatching': 'bg-yellow-500',
      'Matched': 'bg-green-500',
      'On-Route': 'bg-orange-500',
      'Arrived': 'bg-purple-500',
      'In-Progress': 'bg-indigo-500',
      'Complete': 'bg-green-600',
      'Paid': 'bg-green-700'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusMessage = (status) => {
    const messages = {
      'Posted': 'Your request has been posted',
      'Dispatching': 'Finding nearby workers...',
      'Matched': 'Worker matched!',
      'On-Route': 'Worker is on the way',
      'Arrived': 'Worker has arrived',
      'In-Progress': 'Work in progress',
      'Complete': 'Work completed!',
      'Paid': 'Payment processed'
    };
    return messages[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading gig details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600">Gig not found</p>
          </div>
        </div>
      </div>
    );
  }

  const assignment = gig.assignment;
  const isClientView = gig.clientId === (user?.id || user?.email);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{gig.category}</h1>
              <p className="text-gray-600">{gig.description}</p>
            </div>
            <div className={`px-6 py-3 ${getStatusColor(gig.status)} text-white rounded-full font-bold flex items-center gap-2`}>
              {gig.status === 'Dispatching' && <Loader className="w-5 h-5 animate-spin" />}
              {gig.status === 'On-Route' && <Navigation className="w-5 h-5" />}
              {gig.status === 'Complete' && <CheckCircle className="w-5 h-5" />}
              {getStatusMessage(gig.status)}
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="flex items-center justify-between mt-6">
            {['Posted', 'Matched', 'On-Route', 'Arrived', 'In-Progress', 'Complete'].map((status, index) => {
              const statusOrder = ['Posted', 'Dispatching', 'Matched', 'On-Route', 'Arrived', 'In-Progress', 'Complete', 'Paid'];
              const currentIndex = statusOrder.indexOf(gig.status);
              const stepIndex = statusOrder.indexOf(status);
              const isComplete = stepIndex <= currentIndex;
              
              return (
                <div key={status} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isComplete ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  {index < 5 && (
                    <div className={`h-1 flex-1 mx-2 ${isComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mock Map */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Live Tracking</h2>
            
            {/* Mock Map Display */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
              {/* Mock map markers */}
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-12 bg-red-500 rounded-full animate-pulse flex items-center justify-center text-white font-bold">
                  📍
                </div>
                <p className="text-sm font-semibold text-center mt-2">Your Location</p>
              </div>
              
              {assignment && gig.status !== 'Dispatching' && (
                <div className="absolute bottom-1/4 left-1/4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full animate-bounce flex items-center justify-center text-white font-bold">
                    🚗
                  </div>
                  <p className="text-sm font-semibold text-center mt-2">Worker</p>
                </div>
              )}
              
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 font-semibold">Mock Live Map</p>
                <p className="text-sm text-gray-500">Real GPS tracking in production</p>
              </div>
            </div>

            {/* ETA Display */}
            {assignment && gig.status === 'On-Route' && (
              <div className="mt-4 bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Estimated Arrival</p>
                      <p className="text-2xl font-bold text-gray-900">{assignment.eta} min</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="text-lg font-bold text-gray-900">{assignment.distance} mi</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Worker Info / Gig Details */}
          <div className="space-y-6">
            {/* Worker Card */}
            {assignment && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Worker</h2>
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {assignment.workerProfile?.name ? assignment.workerProfile.name.charAt(0).toUpperCase() : 'W'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{assignment.workerName}</h3>
                    {assignment.workerProfile?.rating && (
                      <div className="flex items-center gap-1 text-yellow-500 mb-1">
                        <Star className="w-4 h-4 fill-yellow-500" />
                        <span className="font-semibold">{assignment.workerProfile.rating}</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600">
                      {assignment.distance} miles away • {assignment.eta} min ETA
                    </p>
                  </div>
                </div>

                {/* Mock Contact Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                  <button className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>
            )}

            {/* Gig Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Gig Details</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold text-gray-900">{gig.category}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Urgency</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    gig.urgency === 'ASAP' ? 'bg-red-100 text-red-700' :
                    gig.urgency === 'Today' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {gig.urgency}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Estimated Price</span>
                  <span className="text-2xl font-bold text-green-600">${gig.estimatedPrice}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(gig.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isClientView && gig.status === 'Complete' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Completion</h2>
                <p className="text-gray-600 mb-4">
                  The worker has marked this job as complete. Please confirm to process payment.
                </p>
                <button
                  onClick={handleConfirmComplete}
                  disabled={completing}
                  className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {completing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm & Pay ${gig.estimatedPrice}
                    </>
                  )}
                </button>
              </div>
            )}

            {gig.status === 'Paid' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Job Complete!</h3>
                  <p className="text-gray-600 mb-4">Payment of ${gig.estimatedPrice} has been processed.</p>
                  <button
                    onClick={() => navigate(`/quickhire/rate/${gigId}`)}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all"
                  >
                    Rate Your Experience
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
