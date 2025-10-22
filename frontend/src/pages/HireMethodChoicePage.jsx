import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Search, FileText, ArrowRight } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';

export default function HireMethodChoicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <DashboardHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Welcome Message */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to <span className="text-cyan-400">Hapployed!</span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            How would you like to hire talent today?
          </p>
          <p className="text-lg text-gray-400">
            Choose the method that works best for your needs
          </p>
        </div>

        {/* Two Main Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Post a Job Card */}
          <div 
            onClick={() => navigate('/post-project')}
            className="bg-slate-800/60 backdrop-blur-md border-2 border-cyan-500/30 rounded-3xl p-10 hover:border-cyan-500/60 hover:scale-105 transition-all cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-12 h-12 text-cyan-400" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Post a Job</h2>
                <p className="text-gray-300 text-lg mb-6">
                  Describe what you need and let qualified professionals come to you
                </p>
              </div>

              {/* Features */}
              <div className="text-left space-y-3 w-full">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">AI-Powered Matching</p>
                    <p className="text-gray-400 text-sm">Get matched with the best candidates automatically</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Receive Proposals</p>
                    <p className="text-gray-400 text-sm">Review bids and choose your ideal worker</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Quick & Easy</p>
                    <p className="text-gray-400 text-sm">Post in minutes with AI voice input</p>
                  </div>
                </div>
              </div>

              {/* Button */}
              <button className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-cyan-500/50 flex items-center justify-center gap-2">
                <Briefcase className="w-5 h-5" />
                Post a Job
              </button>
              
              <p className="text-sm text-gray-400">
                Best for: Projects, contracts, remote work
              </p>
            </div>
          </div>

          {/* Browse Talent Pool Card */}
          <div 
            onClick={() => navigate('/find-workers')}
            className="bg-slate-800/60 backdrop-blur-md border-2 border-purple-500/30 rounded-3xl p-10 hover:border-purple-500/60 hover:scale-105 transition-all cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search className="w-12 h-12 text-purple-400" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Browse Talent Pool</h2>
                <p className="text-gray-300 text-lg mb-6">
                  Search and directly contact professionals who match your needs
                </p>
              </div>

              {/* Features */}
              <div className="text-left space-y-3 w-full">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Search & Filter</p>
                    <p className="text-gray-400 text-sm">Find workers by skills, location, and availability</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Verified Profiles</p>
                    <p className="text-gray-400 text-sm">All workers are background-checked and verified</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Direct Contact</p>
                    <p className="text-gray-400 text-sm">Message workers instantly and hire on the spot</p>
                  </div>
                </div>
              </div>

              {/* Button */}
              <button className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Browse Talent
              </button>
              
              <p className="text-sm text-gray-400">
                Best for: Quick hires, local gigs, specific skills
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Helper Text */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Not sure which to choose? You can always switch methods later from your dashboard.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline"
          >
            Skip for now and go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
