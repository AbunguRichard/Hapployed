import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRoles } from '../hooks/useUserRoles';
import { Briefcase, MapPin, Zap, Building, Users as UsersIcon, ArrowRight } from 'lucide-react';

export default function HirerOnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUserRole } = useUserRoles();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    companySize: '',
    industry: '',
    hiringNeeds: [] // ['projects', 'gigs', 'both']
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleHiringNeed = (need) => {
    const needs = formData.hiringNeeds.includes(need)
      ? formData.hiringNeeds.filter(n => n !== need)
      : [...formData.hiringNeeds, need];
    updateFormData('hiringNeeds', needs);
  };

  const handleComplete = async () => {
    // Save hirer profile to backend
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${user.id}/hirer-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Update user role
        await updateUserRole('isHirer', true);
        
        // Navigate to hire method choice
        navigate('/hire-method-choice');
      }
    } catch (error) {
      console.error('Error saving hirer profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${step >= 1 ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-gray-400'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-cyan-500' : 'bg-slate-700'}`} />
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${step >= 2 ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-gray-400'}`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Company Info */}
        {step === 1 && (
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-3xl p-10">
            <div className="text-center mb-8">
              <Building className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white mb-3">
                Tell us about your company
              </h2>
              <p className="text-gray-300 text-lg">
                This helps us match you with the right talent
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Company Size *
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) => updateFormData('companySize', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                  <option value="individual">Just me (Individual)</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="retail">Retail</option>
                  <option value="education">Education</option>
                  <option value="construction">Construction</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              disabled={!formData.companyName || !formData.companySize || !formData.industry}
              onClick={() => setStep(2)}
              className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-full font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Hiring Needs */}
        {step === 2 && (
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-3xl p-10">
            <div className="text-center mb-8">
              <UsersIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white mb-3">
                What type of help do you need?
              </h2>
              <p className="text-gray-300 text-lg">
                Select all that apply - we'll customize your experience
              </p>
            </div>

            <div className="space-y-4">
              {/* Professional Projects */}
              <div
                onClick={() => toggleHiringNeed('projects')}
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                  formData.hiringNeeds.includes('projects')
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 ${
                    formData.hiringNeeds.includes('projects')
                      ? 'border-cyan-500 bg-cyan-500'
                      : 'border-slate-500'
                  }`}>
                    {formData.hiringNeeds.includes('projects') && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-6 h-6 text-cyan-400" />
                      <h3 className="text-xl font-bold text-white">Professional Projects</h3>
                    </div>
                    <p className="text-gray-300 mb-2">
                      Web development, design, marketing, consulting, writing
                    </p>
                    <div className="text-sm text-gray-400">
                      Remote work • Skilled professionals • Contract-based
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Gigs */}
              <div
                onClick={() => toggleHiringNeed('gigs')}
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                  formData.hiringNeeds.includes('gigs')
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 ${
                    formData.hiringNeeds.includes('gigs')
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-slate-500'
                  }`}>
                    {formData.hiringNeeds.includes('gigs') && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-6 h-6 text-purple-400" />
                      <h3 className="text-xl font-bold text-white">Local Gigs & Tasks</h3>
                    </div>
                    <p className="text-gray-300 mb-2">
                      Plumbing, cleaning, repairs, moving, event staff, delivery
                    </p>
                    <div className="text-sm text-gray-400">
                      On-site work • Immediate help • Hourly or task-based
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency/QuickHire */}
              <div
                onClick={() => toggleHiringNeed('emergency')}
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                  formData.hiringNeeds.includes('emergency')
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 ${
                    formData.hiringNeeds.includes('emergency')
                      ? 'border-red-500 bg-red-500'
                      : 'border-slate-500'
                  }`}>
                    {formData.hiringNeeds.includes('emergency') && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-6 h-6 text-red-400" />
                      <h3 className="text-xl font-bold text-white">Emergency/QuickHire</h3>
                    </div>
                    <p className="text-gray-300 mb-2">
                      Urgent help needed within minutes or hours
                    </p>
                    <div className="text-sm text-gray-400">
                      Same-day service • Immediate response • Emergency support
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold text-lg transition-all"
              >
                Back
              </button>
              <button
                disabled={formData.hiringNeeds.length === 0}
                onClick={handleComplete}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-full font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Start Hiring
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
