import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Wrench, Mic, Edit, ArrowRight } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';

export default function JobTypeSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">What type of work do you need?</h1>
          <p className="text-lg text-gray-600">Choose the option that best fits your project</p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Professional Project Card */}
          <div className="bg-white rounded-3xl shadow-lg p-8 relative">
            {/* Top Icons */}
            <div className="absolute top-6 right-6 flex gap-3">
              <button className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center hover:scale-110 transition-transform">
                <Mic className="w-5 h-5 text-white" />
              </button>
              <button className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center hover:scale-110 transition-transform">
                <Edit className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Icon */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-6">
              <Briefcase className="w-12 h-12 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">A Professional Project</h2>

            {/* Description */}
            <p className="text-gray-600 text-lg mb-6">
              For complex, skilled work like design, development, marketing, or consulting. Often remote.
            </p>

            {/* Divider */}
            <hr className="my-6 border-gray-200" />

            {/* Ideal For Section */}
            <div className="mb-8">
              <h3 className="text-gray-700 font-semibold mb-4">Ideal for:</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Web Developers
                </span>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Graphic Designers
                </span>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Consultants
                </span>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Writers
                </span>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => navigate('/post-project')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold text-lg group transition-colors"
            >
              <span>Continue with Project</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Local Gig/Task Card */}
          <div className="bg-white rounded-3xl shadow-lg p-8 relative">
            {/* Top Icons */}
            <div className="absolute top-6 right-6 flex gap-3">
              <button className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center hover:scale-110 transition-transform">
                <Mic className="w-5 h-5 text-white" />
              </button>
              <button className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center hover:scale-110 transition-transform">
                <Edit className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Icon */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mb-6">
              <Wrench className="w-12 h-12 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">A Local Gig / Task</h2>

            {/* Description */}
            <p className="text-gray-600 text-lg mb-6">
              For immediate, local help with general labor, repairs, or tasks.
            </p>

            {/* Divider */}
            <hr className="my-6 border-gray-200" />

            {/* Ideal For Section */}
            <div className="mb-8">
              <h3 className="text-gray-700 font-semibold mb-4">Ideal for:</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Plumbers
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Cleaners
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Movers
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Handymen
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Event Staff
                </span>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => navigate('/quickhire/post')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-lg group transition-colors"
            >
              <span>Continue with Gig</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
