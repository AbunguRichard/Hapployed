import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Target, TrendingUp, Zap } from 'lucide-react';

export default function AIMatchPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🤖 AI Match</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let AI find the perfect jobs for you based on your skills, experience, and preferences
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Smart Matching</h3>
            <p className="text-gray-600">AI analyzes your profile to find jobs that perfectly match your skills</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Growth Insights</h3>
            <p className="text-gray-600">Get personalized recommendations to improve your match rate</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">Instant Apply</h3>
            <p className="text-gray-600">Apply to matched jobs with one click using your saved profile</p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-xl mb-8 text-purple-100">
            We're building an advanced AI matching system that will revolutionize how you find work
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/epic-worker-dashboard')}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-semibold"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => navigate('/opportunities')}
              className="px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-semibold"
            >
              Browse Jobs
            </button>
          </div>
        </div>

        {/* Expected Features */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold mb-6">What to Expect</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Personalized Job Recommendations</h4>
                <p className="text-gray-600">AI-powered suggestions based on your unique profile and work history</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Match Score Analysis</h4>
                <p className="text-gray-600">See detailed breakdowns of why each job is recommended for you</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Skill Gap Identification</h4>
                <p className="text-gray-600">Learn which skills to develop to access higher-paying opportunities</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Auto-Application Queue</h4>
                <p className="text-gray-600">Set up automatic applications to jobs that meet your criteria</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
