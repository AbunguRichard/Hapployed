import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, TrendingUp, Target, Star, Lightbulb } from 'lucide-react';

export default function GrowPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <BookOpen className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📚 Grow</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Level up your skills, earn certifications, and unlock higher-paying opportunities
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Skill Development</h3>
            <p className="text-gray-600">Access curated courses and tutorials to expand your expertise</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Certifications</h3>
            <p className="text-gray-600">Earn recognized badges and certificates to showcase your skills</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Career Path</h3>
            <p className="text-gray-600">Get personalized recommendations for your career advancement</p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-xl mb-8 text-green-100">
            We're creating a comprehensive learning platform to help you grow your career
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/epic-worker-dashboard')}
              className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-semibold"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => navigate('/opportunities')}
              className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 font-semibold"
            >
              Find Jobs
            </button>
          </div>
        </div>

        {/* Learning Tracks Preview */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold">Popular Skills</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold mb-1">React Development</div>
                <div className="text-sm text-gray-600">Build modern web applications</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold mb-1">Digital Marketing</div>
                <div className="text-sm text-gray-600">Master social media & SEO</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold mb-1">Graphic Design</div>
                <div className="text-sm text-gray-600">Create stunning visuals</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-purple-500" />
              <h3 className="text-xl font-bold">Recommended for You</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="font-semibold mb-1">Advanced JavaScript</div>
                <div className="text-sm text-gray-600">Based on your current skills</div>
                <div className="mt-2 text-xs font-semibold text-purple-600">+15% earning potential</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold mb-1">UI/UX Design Basics</div>
                <div className="text-sm text-gray-600">Expand your service offerings</div>
                <div className="mt-2 text-xs font-semibold text-blue-600">+20% job matches</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-semibold mb-1">Project Management</div>
                <div className="text-sm text-gray-600">Lead larger projects</div>
                <div className="mt-2 text-xs font-semibold text-green-600">+30% earning potential</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
