import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRoles } from '../hooks/useUserRoles';
import { Briefcase, Users, Search, ArrowRight, UserPlus } from 'lucide-react';
import Header from '../components/Header';

export default function HireStartPage() {
  const navigate = useNavigate();
  const { user, isHirer, hirerOnboardingComplete, createGuestSession } = useUserRoles();
  const [showGuestOptions, setShowGuestOptions] = useState(false);

  useEffect(() => {
    // If user is already a hirer with complete onboarding, redirect to dashboard
    if (isHirer && hirerOnboardingComplete) {
      navigate('/hire/dashboard');
    }
  }, [isHirer, hirerOnboardingComplete, navigate]);

  // First-time user or guest - show signup/guest options
  if (!user || user.isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-16">
          {!showGuestOptions ? (
            <>
              {/* Sign Up or Guest Options */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4">
                  Start <span className="text-cyan-400">Hiring</span> Today
                </h1>
                <p className="text-xl text-gray-300">
                  Find the right professionals for your projects
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Sign Up Card */}
                <div className="bg-slate-800/60 backdrop-blur-md border-2 border-cyan-500/30 rounded-3xl p-10 hover:border-cyan-500/60 transition-all">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      <UserPlus className="w-10 h-10 text-cyan-400" />
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-3">Sign Up to Hire</h2>
                      <p className="text-gray-300">
                        Full access to all hiring features
                      </p>
                    </div>

                    <ul className="text-left space-y-2 w-full text-gray-300">
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-cyan-400" />
                        Contact professionals directly
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-cyan-400" />
                        Post unlimited jobs
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-cyan-400" />
                        AI-powered matching
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-cyan-400" />
                        Save favorite workers
                      </li>
                    </ul>

                    <button
                      onClick={() => navigate('/auth/signup?role=hirer')}
                      className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-full font-bold text-lg transition-all shadow-lg"
                    >
                      Sign Up Free
                    </button>
                  </div>
                </div>

                {/* Guest Card */}
                <div className="bg-slate-800/60 backdrop-blur-md border-2 border-slate-500/30 rounded-3xl p-10 hover:border-slate-500/60 transition-all">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-500/20 to-gray-500/20 flex items-center justify-center">
                      <Search className="w-10 h-10 text-slate-400" />
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-3">Continue as Guest</h2>
                      <p className="text-gray-300">
                        Explore without signing up
                      </p>
                    </div>

                    <ul className="text-left space-y-2 w-full text-gray-300">
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        Browse talent pool
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        View professional profiles
                      </li>
                      <li className="flex items-center gap-2 opacity-50">
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        Sign up required to contact
                      </li>
                      <li className="flex items-center gap-2 opacity-50">
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        Sign up required to post jobs
                      </li>
                    </ul>

                    <button
                      onClick={() => setShowGuestOptions(true)}
                      className="w-full px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold text-lg transition-all"
                    >
                      Explore as Guest
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Guest Options */}
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Explore Hiring Options
                </h2>
                <p className="text-lg text-gray-300">
                  Choose how you want to find talent
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div
                  onClick={() => {
                    createGuestSession();
                    navigate('/find-workers?guest=true');
                  }}
                  className="bg-slate-800/60 backdrop-blur-md border-2 border-purple-500/30 rounded-3xl p-10 hover:border-purple-500/60 hover:scale-105 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Users className="w-16 h-16 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white">Browse Talent</h3>
                    <p className="text-gray-300">
                      View professionals and their portfolios
                    </p>
                    <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                      Limited access - sign up to contact
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    createGuestSession();
                    navigate('/post-project?guest=true');
                  }}
                  className="bg-slate-800/60 backdrop-blur-md border-2 border-cyan-500/30 rounded-3xl p-10 hover:border-cyan-500/60 hover:scale-105 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Briefcase className="w-16 h-16 text-cyan-400" />
                    <h3 className="text-2xl font-bold text-white">Post a Job</h3>
                    <p className="text-gray-300">
                      Create project or gig listing
                    </p>
                    <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                      Sign up required to publish
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowGuestOptions(false)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline"
                >
                  ← Back to Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Returning user - needs hirer onboarding
  if (!isHirer || !hirerOnboardingComplete) {
    navigate('/hire/onboarding');
    return null;
  }

  return null;
}
