import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mic, MapPin, DollarSign, Clock, Zap, Camera, CheckCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '../components/DashboardHeader';
import QuickHireWorkflow from '../utils/QuickHireWorkflow';
import QuickHireNotifications from '../utils/QuickHireNotifications';
import ClientWaitingInterface from '../utils/ClientWaitingInterface';
import '../styles/QuickHireWorkflow.css';
import '../styles/QuickHireNotifications.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const CATEGORIES = [
  'Plumber', 'Electrician', 'Cleaning', 'Handyman', 'Moving',
  'Locksmith', 'HVAC', 'Painting', 'Carpentry', 'Landscaping'
];

export default function QuickHirePostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const workflowRef = useRef(null);
  
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: {
      address: '',
      latitude: null,
      longitude: null
    },
    radius: 5,
    urgency: 'ASAP',
    budget: '',
    photos: [],
    // Multiple Hire fields
    gigType: 'Single',
    workersNeeded: 1,
    payPerPerson: '',
    groupMode: false
  });

  const notificationSystemRef = useRef(null);
  const clientWaitingRef = useRef(null);

  // Initialize workflow and notification system
  useEffect(() => {
    workflowRef.current = new QuickHireWorkflow();
    notificationSystemRef.current = new QuickHireNotifications();
    
    return () => {
      if (workflowRef.current) {
        workflowRef.current.cleanup();
      }
      if (notificationSystemRef.current) {
        notificationSystemRef.current.cleanup();
      }
      if (clientWaitingRef.current) {
        clientWaitingRef.current.cleanup();
      }
    };
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
          toast.success('Location detected');
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Could not detect location');
        }
      );
    }
  }, []);

  const handleVoiceInput = () => {
    if (!workflowRef.current) {
      toast.error('Voice input system not ready');
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input not supported in your browser');
      return;
    }

    // Use the workflow's voice recognition
    workflowRef.current.toggleVoiceRecognition();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.description) {
      toast.error('Please describe what you need');
      return;
    }
    
    if (!formData.location.latitude || !formData.location.longitude) {
      toast.error('Please enable location services');
      return;
    }

    setSubmitting(true);

    try {
      const gigData = {
        clientId: user.id || user.email,
        clientName: user.name || user.email,
        clientEmail: user.email,
        category: formData.category,
        description: formData.description,
        location: {
          type: 'Point',
          coordinates: [formData.location.longitude, formData.location.latitude],
          address: formData.location.address || 'Current Location'
        },
        radius: formData.radius,
        urgency: formData.urgency,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        photos: formData.photos,
        // Multiple Hire fields
        gigType: formData.gigType,
        workersNeeded: formData.gigType === 'Multiple' ? formData.workersNeeded : 1,
        payPerPerson: formData.gigType === 'Multiple' && formData.payPerPerson ? parseFloat(formData.payPerPerson) : null,
        groupMode: formData.gigType === 'Multiple' ? formData.groupMode : false
      };

      // Use the notification system for posting and matching
      if (notificationSystemRef.current) {
        const result = await notificationSystemRef.current.postAndNotifyGig(gigData);
        
        if (result.success) {
          toast.success(`Posted! ${result.workersNotified} workers notified`);
          
          // Show client waiting interface
          clientWaitingRef.current = new ClientWaitingInterface(result.gigId, user.id || user.email);
        } else {
          toast.warning(result.message || 'Expanding search for workers...');
          
          // Still show waiting interface
          if (result.gigId) {
            clientWaitingRef.current = new ClientWaitingInterface(result.gigId, user.id || user.email);
          }
        }
      } else {
        // Fallback to original method
        const response = await fetch(`${BACKEND_URL}/api/quickhire/gigs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gigData)
        });

        const responseClone = response.clone();

        if (!response.ok) {
          const errorText = await responseClone.text();
          throw new Error(errorText || 'Failed to post gig');
        }

        const result = await response.json();
        
        toast.success('QuickHire request posted! Finding nearby workers...');
        
        // Navigate to tracking page
        setTimeout(() => {
          navigate(`/quickhire/track/${result.id}`);
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error posting gig:', error);
      toast.error('Failed to post QuickHire request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <DashboardHeader />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">QuickHire</h1>
          <p className="text-lg text-gray-600">Get help fast - workers nearby in minutes!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Voice Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
            <div className="flex items-center gap-3">
              <Mic className="w-6 h-6 text-orange-600" />
              <div>
                <p className="font-semibold text-gray-900">Voice-First Mode</p>
                <p className="text-sm text-gray-600">Just speak what you need</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={isRecording}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {isRecording ? '🎤 Recording...' : '🎤 Speak Now'}
            </button>
          </div>

          {/* Gig Type Toggle */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
            <label className="block text-lg font-bold text-gray-900 mb-4">Hiring Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gigType: 'Single', workersNeeded: 1 }))}
                className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                  formData.gigType === 'Single'
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                🔘 Single Hire
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, gigType: 'Multiple', workersNeeded: 3 }))}
                className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                  formData.gigType === 'Multiple'
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                🔘 Multi-Hire
              </button>
            </div>
          </div>

          {/* Multiple Hire Options */}
          {formData.gigType === 'Multiple' && (
            <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200 space-y-4">
              <h3 className="text-lg font-bold text-purple-900 mb-4">👥 Multiple Hire Settings</h3>
              
              {/* Workers Needed */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  How many people do you need? *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.workersNeeded}
                  onChange={(e) => setFormData(prev => ({ ...prev, workersNeeded: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg font-bold"
                />
                <p className="mt-2 text-sm text-purple-700">
                  💡 You're hiring {formData.workersNeeded} worker{formData.workersNeeded > 1 ? 's' : ''} for this task
                </p>
              </div>

              {/* Pay Per Person */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Pay per person ($) *
                </label>
                <input
                  type="number"
                  value={formData.payPerPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, payPerPerson: e.target.value }))}
                  placeholder="e.g., 80"
                  min="0"
                  step="10"
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-lg"
                />
                {formData.payPerPerson && (
                  <p className="mt-2 text-sm font-bold text-purple-700">
                    💰 Total Payment: ${(parseFloat(formData.payPerPerson) * formData.workersNeeded).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Group Mode */}
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                <input
                  type="checkbox"
                  id="groupMode"
                  checked={formData.groupMode}
                  onChange={(e) => setFormData(prev => ({ ...prev, groupMode: e.target.checked }))}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="groupMode" className="flex-1">
                  <span className="font-semibold text-gray-900">Group Mode</span>
                  <p className="text-sm text-gray-600">All workers must work together at the same time</p>
                </label>
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              What do you need? *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
            >
              <option value="">Select category...</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Describe the job *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Example: I need a plumber to fix a leaking sink in my kitchen..."
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            {transcript && (
              <p className="mt-2 text-sm text-green-600">
                ✓ Voice captured: "{transcript.substring(0, 50)}..."
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              type="text"
              name="address"
              value={formData.location.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, address: e.target.value }
              }))}
              placeholder="Current Location (GPS)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {formData.location.latitude && (
              <p className="mt-2 text-sm text-green-600">
                ✓ GPS location detected
              </p>
            )}
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Search radius: {formData.radius} miles
            </label>
            <input
              type="range"
              name="radius"
              min="1"
              max="20"
              value={formData.radius}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              How urgent?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['ASAP', 'Today', 'Later'].map(urgency => (
                <button
                  key={urgency}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, urgency }))}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    formData.urgency === urgency
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {urgency === 'ASAP' && '🚨 '}
                  {urgency}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget (optional)
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="Estimated budget"
              min="0"
              step="10"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
          >
            {submitting ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Finding nearby workers...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                Post QuickHire Request
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            ⚡ Average response time: <span className="font-bold text-orange-600">8 minutes</span>
          </p>
        </form>
      </div>
    </div>
  );
}
