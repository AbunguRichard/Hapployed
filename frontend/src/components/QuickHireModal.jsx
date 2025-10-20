import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Zap, Briefcase, Search } from 'lucide-react';

export default function QuickHireModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleEmergencyGig = () => {
    onClose();
    navigate('/post-project?type=emergency');
  };

  const handlePostProject = () => {
    onClose();
    navigate('/post-project?type=regular');
  };

  const handleGoAvailable = () => {
    onClose();
    navigate('/emergency-gigs?available=true');
  };

  const handleFindGigs = () => {
    onClose();
    navigate('/gigs-near-me');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        <div className="p-8">
          {/* Client Section */}
          <section className="mb-12">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-6">
              I NEED TO HIRE SOMEONE...
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={handleEmergencyGig}
                className="w-full flex items-start gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Emergency Gig</h4>
                  <p className="text-gray-600">Find a pro available right now</p>
                </div>
              </button>

              <button
                onClick={handlePostProject}
                className="w-full flex items-start gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Post a Project</h4>
                  <p className="text-gray-600">For work later this week or month</p>
                </div>
              </button>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Freelancer Section */}
          <section>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-6">
              I'M READY TO WORK...
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={handleGoAvailable}
                className="w-full flex items-start gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Go Available</h4>
                  <p className="text-gray-600">Receive Quick Hire alerts</p>
                </div>
              </button>

              <button
                onClick={handleFindGigs}
                className="w-full flex items-start gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center flex-shrink-0">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Find Gigs</h4>
                  <p className="text-gray-600">Browse and apply for projects</p>
                </div>
              </button>
            </div>
          </section>

          {/* Close button at bottom */}
          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="px-8 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
