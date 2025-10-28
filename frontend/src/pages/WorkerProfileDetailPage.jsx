import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Star, MapPin, DollarSign, Briefcase, Clock, 
  Award, CheckCircle, MessageCircle, Heart, ExternalLink,
  Calendar, Mail, Phone, Globe, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '../components/DashboardHeader';
import BadgeDisplay from '../components/BadgeDisplay';

export default function WorkerProfileDetailPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/worker-profiles/${profileId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      navigate('/find-workers');
    } finally {
      setLoading(false);
    }
  };

  const handleContactWorker = () => {
    if (!user) {
      toast.error('Please sign in to contact workers');
      navigate('/auth/login');
      return;
    }

    // Navigate to messaging page
    navigate(`/messages?workerId=${profileId}`);
  };

  const handleSaveProfile = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Saved to favorites');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/find-workers')}
          className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-6 sticky top-8">
              {/* Profile Image */}
              <div className="text-center mb-6">
                <img
                  src={profile.profileImage || `https://i.pravatar.cc/200?u=${profile.id}`}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-cyan-500"
                />
                <h1 className="text-2xl font-bold text-white mb-1">{profile.name || 'Anonymous Worker'}</h1>
                <p className="text-gray-400 mb-3">{profile.location?.city}, {profile.location?.state}</p>
                
                {/* Rating */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-bold">{profile.rating || 'New'}</span>
                  </div>
                  {profile.reviewCount > 0 && (
                    <span className="text-gray-400 text-sm">({profile.reviewCount} reviews)</span>
                  )}
                </div>

                {/* Badges */}
                {profile.badges && profile.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {profile.badges.map((badge, index) => (
                      <BadgeDisplay key={index} badges={[{ badge_type: badge }]} size="sm" />
                    ))}
                  </div>
                )}

                {/* Availability */}
                <div className={`px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
                  profile.isAvailable 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {profile.isAvailable ? '✓ Available Now' : 'Not Available'}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div className="flex items-center gap-2 text-gray-400">
                    <DollarSign className="w-5 h-5" />
                    <span>Hourly Rate</span>
                  </div>
                  <span className="text-white font-bold">
                    ${profile.hourlyRate || 'Negotiable'}/hr
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Briefcase className="w-5 h-5" />
                    <span>Completed Jobs</span>
                  </div>
                  <span className="text-white font-bold">{profile.completedJobs || 0}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Award className="w-5 h-5" />
                    <span>Experience</span>
                  </div>
                  <span className="text-white font-bold capitalize">
                    {profile.experience || 'Mid-level'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-5 h-5" />
                    <span>Availability</span>
                  </div>
                  <span className="text-white font-bold capitalize">
                    {profile.availability || 'Flexible'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleContactWorker}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Worker
                </button>

                <button
                  onClick={handleSaveProfile}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    isSaved
                      ? 'bg-red-500/20 text-red-400 border-2 border-red-500/30 hover:bg-red-500/30'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-400' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-cyan-400" />
                About
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {profile.bio || 'No bio available.'}
              </p>
            </div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg font-semibold border border-cyan-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {profile.categories && profile.categories.length > 0 && (
              <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Work Categories</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-semibold border border-purple-500/30"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {profile.portfolio && profile.portfolio.length > 0 && (
              <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.portfolio.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-700/50 rounded-xl p-4 hover:bg-slate-700 transition-all"
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="text-white font-bold mb-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-sm"
                        >
                          View Project <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Education</h2>
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-cyan-500 pl-4">
                      <h3 className="text-white font-bold">{edu.degree}</h3>
                      <p className="text-gray-400">{edu.institution}</p>
                      {edu.year && <p className="text-gray-500 text-sm">{edu.year}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Certifications</h2>
                <div className="space-y-2">
                  {profile.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work History */}
            {profile.workHistory && profile.workHistory.length > 0 && (
              <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Work History</h2>
                <div className="space-y-6">
                  {profile.workHistory.map((work, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4">
                      <h3 className="text-white font-bold text-lg">{work.title}</h3>
                      <p className="text-cyan-400">{work.company}</p>
                      <p className="text-gray-500 text-sm mb-2">{work.duration}</p>
                      {work.description && (
                        <p className="text-gray-300">{work.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Languages</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg"
                    >
                      <Globe className="w-4 h-4 inline mr-2" />
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="w-5 h-5 text-cyan-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span>
                    {profile.location?.city}, {profile.location?.state} {profile.location?.zipCode}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
