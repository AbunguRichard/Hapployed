import React from 'react';
import ProfileLayout from '../components/ProfileLayout';
import { User, Mail, Phone, MapPin, Briefcase, Award } from 'lucide-react';

export default function ProfilePage() {
  return (
    <ProfileLayout currentSection="profile">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">View Profile</h1>
        <p className="text-gray-600 mb-8">Manage your public profile information</p>

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
            <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
            <input
              type="email"
              defaultValue="john@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
            <input
              type="tel"
              defaultValue="+1 (555) 123-4567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
            <input
              type="text"
              defaultValue="San Francisco, CA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
            <textarea
              rows="4"
              defaultValue="Experienced full-stack developer with 5+ years of experience..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}
