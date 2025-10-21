import React, { useState, useEffect, useContext } from 'react';
import ProfileLayout from '../components/ProfileLayout';
import { User, Mail, Phone, MapPin, Briefcase, Award } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function ProfilePage() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });

  useEffect(() => {
    // Load user profile data from backend
    const loadProfile = async () => {
      if (user && user.email) {
        try {
          setLoading(true);
          const response = await fetch(`${BACKEND_URL}/api/profile/${encodeURIComponent(user.email)}`);
          
          if (response.ok) {
            const profileFromDB = await response.json();
            console.log('Loaded profile from database:', profileFromDB);
            setProfileData({
              name: profileFromDB.name || user.name || 'John Doe',
              email: profileFromDB.email || user.email || 'john@example.com',
              phone: profileFromDB.phone || user.phone || '+1 (555) 123-4567',
              location: profileFromDB.location || user.location || 'San Francisco, CA',
              bio: profileFromDB.bio || user.bio || 'Experienced full-stack developer with 5+ years of experience...'
            });
          } else {
            // Profile not found in DB, use context data
            console.log('Profile not in database, using context data');
            setProfileData({
              name: user.name || 'John Doe',
              email: user.email || 'john@example.com',
              phone: user.phone || '+1 (555) 123-4567',
              location: user.location || 'San Francisco, CA',
              bio: user.bio || 'Experienced full-stack developer with 5+ years of experience...'
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          // Fallback to context data
          setProfileData({
            name: user.name || 'John Doe',
            email: user.email || 'john@example.com',
            phone: user.phone || '+1 (555) 123-4567',
            location: user.location || 'San Francisco, CA',
            bio: user.bio || 'Experienced full-stack developer with 5+ years of experience...'
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadProfile();
  }, [user]);

  const handleChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      console.log('Saving profile data:', profileData);
      console.log('Backend URL:', BACKEND_URL);
      
      // Call backend API to save profile
      const response = await fetch(`${BACKEND_URL}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Failed to save profile');
      }

      const result = await response.json();
      console.log('Save successful:', result);
      
      // Update user context
      if (setUser) {
        setUser(prev => ({
          ...prev,
          ...profileData
        }));
      }
      
      // Reload profile from database to confirm save
      if (profileData.email) {
        const verifyResponse = await fetch(`${BACKEND_URL}/api/profile/${encodeURIComponent(profileData.email)}`);
        if (verifyResponse.ok) {
          const savedProfile = await verifyResponse.json();
          console.log('Verified saved profile:', savedProfile);
          setProfileData(savedProfile);
        }
      }

      toast.success('✅ Profile updated successfully!', {
        description: 'Your changes have been saved.',
        duration: 3000
      });

    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('❌ Failed to save profile', {
        description: error.message || 'Please try again later.',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileLayout currentSection="profile">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">View Profile</h1>
        <p className="text-gray-600 mb-8">Manage your public profile information</p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        ) : (
        <div className="space-y-6">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-green-300 via-cyan-300 to-blue-300 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-b from-yellow-200 to-yellow-300 rounded-full flex flex-col items-center justify-end overflow-hidden">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full mb-2"></div>
                  <div className="w-20 h-12 bg-cyan-400 rounded-t-full"></div>
                </div>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Change Picture
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Richard Abungu"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="San Francisco, CA"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
            <textarea
              rows="4"
              value={profileData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Experienced full-stack developer with 5+ years of experience..."
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
        )}
      </div>
    </ProfileLayout>
  );
}
