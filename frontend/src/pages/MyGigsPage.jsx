import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import { Zap, MapPin, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function MyGigsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, pending

  useEffect(() => {
    if (user) {
      fetchMyGigs();
    }
  }, [user]);

  const fetchMyGigs = async () => {
    try {
      setLoading(true);
      const userId = user.id || user.email;
      
      // Fetch gigs where user applied or was hired (as worker)
      const response = await fetch(`${BACKEND_URL}/api/worker/${userId}/gigs`);
      
      if (response.ok) {
        const data = await response.json();
        setGigs(data);
      }
    } catch (error) {
      console.error('Error fetching gigs:', error);
      toast.error('Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = gigs.filter(gig => {
    if (filter === 'all') return true;
    if (filter === 'active') return gig.status === 'active';
    if (filter === 'completed') return gig.status === 'completed';
    if (filter === 'pending') return gig.status === 'pending';
    return true;
  });

  const GigCard = ({ gig }) => (
    <div 
      className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => navigate(`/gig/${gig.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{gig.title}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {gig.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {gig.duration}
            </span>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          gig.status === 'active' ? 'bg-green-100 text-green-700' :
          gig.status === 'completed' ? 'bg-blue-100 text-blue-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {gig.status}
        </span>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{gig.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-bold text-orange-600">
          <DollarSign className="w-5 h-5" />
          ${gig.pay}
        </div>
        
        <div className="flex items-center gap-2">
          {gig.status === 'completed' && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          {gig.status === 'pending' && (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          )}
          <span className="text-sm text-gray-600">
            {new Date(gig.date).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Gigs</h1>
          </div>
          <p className="text-gray-600">Track your quick hire jobs and on-demand work</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-2 mb-6 inline-flex gap-2">
          {['all', 'active', 'completed', 'pending'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                filter === f
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Gigs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your gigs...</p>
          </div>
        ) : filteredGigs.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No gigs yet</h3>
            <p className="text-gray-600 mb-6">Start applying to quick hire jobs to see them here</p>
            <button
              onClick={() => navigate('/gig/find')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:brightness-110 transition-all"
            >
              Find Gigs Near Me
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGigs.map(gig => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
