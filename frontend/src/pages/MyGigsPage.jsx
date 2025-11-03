import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/DashboardHeader';
import { Zap, MapPin, DollarSign, Clock, CheckCircle, AlertCircle, Star, User, Award } from 'lucide-react';
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
              {typeof gig.location === 'object' ? (gig.location?.type || gig.location?.address || 'N/A') : (gig.location || 'N/A')}
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
          <div className="space-y-6">
            {/* Main Empty State Hero */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200 p-8 text-center">
              <div className="text-6xl mb-4">🎪</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready for Quick Gigs?</h2>
              <p className="text-xl text-gray-700 mb-2">Earn fast cash with local, on-demand work</p>
              <p className="text-gray-600">Your gig adventure starts here!</p>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Why try gig work?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Same-day payment</h4>
                    <p className="text-sm text-gray-600">Get paid instantly after completing gigs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Flexible schedule</h4>
                    <p className="text-sm text-gray-600">Work when you want, no commitments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Local opportunities</h4>
                    <p className="text-sm text-gray-600">Gigs in your neighborhood</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Star className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Build reputation</h4>
                    <p className="text-sm text-gray-600">Great ratings lead to better gigs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Get Started Steps */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Get Started in 3 Easy Steps
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">Set Your Preferences</h4>
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      <li>• What types of gigs interest you?</li>
                      <li>• Set your available hours</li>
                      <li>• Choose your service radius</li>
                    </ul>
                    <button 
                      onClick={() => navigate('/worker/onboarding')}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Complete My Profile →
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">Go Live & Get Matched</h4>
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      <li>• Turn on "Available Now" status</li>
                      <li>• Receive instant gig notifications</li>
                      <li>• Accept gigs with one tap</li>
                    </ul>
                    <button 
                      onClick={() => navigate('/gigs-near-me')}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Find Gigs Near Me →
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">Start Earning</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Complete gigs, get paid</li>
                      <li>• Build your rating</li>
                      <li>• Unlock better opportunities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/gigs-near-me')}
                  className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl hover:brightness-110 transition-all shadow-lg"
                >
                  <MapPin className="w-8 h-8" />
                  <span className="font-bold text-center">Find Gigs Near Me</span>
                </button>
                <button
                  onClick={() => navigate('/gigs-near-me')}
                  className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-orange-500 text-orange-700 rounded-xl hover:bg-orange-50 transition-all"
                >
                  <Zap className="w-8 h-8" />
                  <span className="font-bold text-center">Go Live for 2 Hours</span>
                </button>
                <button
                  onClick={() => navigate('/worker/onboarding')}
                  className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-purple-500 text-purple-700 rounded-xl hover:bg-purple-50 transition-all"
                >
                  <User className="w-8 h-8" />
                  <span className="font-bold text-center">Complete My Profile</span>
                </button>
                <button
                  onClick={() => navigate('/my-skills')}
                  className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-blue-500 text-blue-700 rounded-xl hover:bg-blue-50 transition-all"
                >
                  <Award className="w-8 h-8" />
                  <span className="font-bold text-center">Add My Skills</span>
                </button>
              </div>
            </div>

            {/* Popular Gig Categories */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Popular Gig Categories Near You
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Dog Walking', pay: '$25-40', icon: '🐕', time: '1-2 hrs' },
                  { name: 'Furniture Assembly', pay: '$45-75', icon: '🛠️', time: '2-3 hrs' },
                  { name: 'Delivery', pay: '$18-35', icon: '📦', time: '1-2 hrs' },
                  { name: 'Tutoring', pay: '$35-60', icon: '📚', time: '1-2 hrs' },
                  { name: 'Cleaning', pay: '$30-50', icon: '🧹', time: '2-3 hrs' },
                  { name: 'Event Staff', pay: '$25-45', icon: '🎉', time: '3-5 hrs' },
                ].map((category) => (
                  <div key={category.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-orange-600">{category.pay}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/gigs-near-me')}
                className="mt-6 w-full py-3 bg-white border-2 border-orange-500 text-orange-700 font-bold rounded-lg hover:bg-orange-50 transition-all"
              >
                Browse All Categories
              </button>
            </div>

            {/* Testimonials */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">💬</span>
                What Gig Workers Say
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <p className="text-white/90 mb-3 italic">"I earned $200 in my first weekend just walking dogs!"</p>
                  <p className="text-sm text-white/70">— Sarah, College Student</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <p className="text-white/90 mb-3 italic">"Perfect side hustle around my 9-5 job"</p>
                  <p className="text-sm text-white/70">— Mike, Graphic Designer</p>
                </div>
              </div>
            </div>
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
