import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Zap, Target, ArrowLeft } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import { toast } from 'sonner';

export default function ApplicationFlowPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const opportunity = location.state?.opportunity;

  const [selectedOption, setSelectedOption] = useState(null);
  const [proposalData, setProposalData] = useState({
    approach: '',
    experience: '',
    whyBestFit: '',
    rate: '',
    rateType: 'per hour',
    timeline: ''
  });

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Opportunity not found</h2>
          <button
            onClick={() => navigate('/find-work')}
            className="btn-primary"
          >
            Browse Opportunities
          </button>
        </div>
      </div>
    );
  }

  const handleQuickApply = () => {
    toast.success('Quick application submitted!', {
      description: 'Using your profile to apply instantly'
    });
    setTimeout(() => {
      navigate('/find-work');
    }, 1500);
  };

  const handleProposalSubmit = (e) => {
    e.preventDefault();
    toast.success('Custom proposal submitted successfully!', {
      description: 'The client will review your proposal'
    });
    setTimeout(() => {
      navigate('/find-work');
    }, 1500);
  };

  const updateField = (field, value) => {
    setProposalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl font-bold mb-3">Apply for {opportunity.title}</h1>
          <p className="text-lg opacity-90">Choose how you want to apply</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Application Options */}
        <div className="space-y-6 mb-8">
          {/* Quick Apply Option */}
          <div
            onClick={() => setSelectedOption('quick')}
            className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all ${
              selectedOption === 'quick'
                ? 'border-primary bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Apply</h3>
                <p className="text-gray-600 mb-4">Use your profile to apply instantly</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-600">✓</span>
                    Uses your pre-approved profile
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-600">✓</span>
                    Apply in 15 seconds
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-600">✓</span>
                    Best for emergency gigs
                  </li>
                </ul>
                {selectedOption === 'quick' && (
                  <button
                    onClick={handleQuickApply}
                    className="mt-4 w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Quick Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Custom Proposal Option */}
          <div
            onClick={() => setSelectedOption('proposal')}
            className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all ${
              selectedOption === 'proposal'
                ? 'border-primary bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Custom Proposal</h3>
                <p className="text-gray-600 mb-4">Stand out with a tailored approach</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-600">✓</span>
                    Explain your unique approach
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-600">✓</span>
                    Showcase relevant experience
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-600">✓</span>
                    Negotiate your ideal rate
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-600">✓</span>
                    3x higher acceptance rate
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Proposal Form */}
        {selectedOption === 'proposal' && (
          <form onSubmit={handleProposalSubmit} className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Custom Proposal</h3>
            
            <div className="space-y-6">
              {/* Approach */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Approach to This Project
                </label>
                <textarea
                  value={proposalData.approach}
                  onChange={(e) => updateField('approach', e.target.value)}
                  placeholder="How would you approach this project? What technologies and methodologies would you use?"
                  rows="4"
                  maxLength="500"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {proposalData.approach.length}/500 characters
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Relevant Experience
                </label>
                <textarea
                  value={proposalData.experience}
                  onChange={(e) => updateField('experience', e.target.value)}
                  placeholder="Share examples of similar projects you've completed. What were the results?"
                  rows="3"
                  maxLength="300"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {proposalData.experience.length}/300 characters
                </div>
              </div>

              {/* Why Best Fit */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Why You're the Best Fit
                </label>
                <textarea
                  value={proposalData.whyBestFit}
                  onChange={(e) => updateField('whyBestFit', e.target.value)}
                  placeholder="What specific skills or experience make you uniquely qualified for this project?"
                  rows="3"
                  maxLength="300"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {proposalData.whyBestFit.length}/300 characters
                </div>
              </div>

              {/* Rate and Timeline */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Project Details</h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Your Proposed Rate
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={proposalData.rate}
                        onChange={(e) => updateField('rate', e.target.value)}
                        placeholder="Amount"
                        required
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <select
                        value={proposalData.rateType}
                        onChange={(e) => updateField('rateType', e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option>per hour</option>
                        <option>fixed price</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Estimated Timeline
                    </label>
                    <input
                      type="text"
                      value={proposalData.timeline}
                      onChange={(e) => updateField('timeline', e.target.value)}
                      placeholder="e.g., 2-3 weeks"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-primary-dark transition-colors"
              >
                Submit Proposal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
