import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PostProjectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'regular';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState({
    type: initialType,
    title: '',
    description: '',
    category: '',
    customCategories: [],
    minBudget: '',
    maxBudget: '',
    budgetType: 'fixed',
    timeline: '',
    urgency: 'normal',
    skills: [],
    location: 'remote',
    specificLocation: ''
  });

  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const steps = [
    { id: 1, name: 'Project Details', icon: '📋' },
    { id: 2, name: 'Budget & Timeline', icon: '💰' },
    { id: 3, name: 'Skills Required', icon: '🎯' },
    { id: 4, name: 'Review & Post', icon: '✓' }
  ];

  const availableSkills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'UI/UX Design',
    'Mobile Development', 'Backend', 'Frontend', 'Full Stack',
    'Plumbing', 'Electrical', 'Carpentry', 'Moving', 'Cleaning'
  ];

  const updateField = (field, value) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSkill = (skill) => {
    setProjectData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast.success('Project posted successfully!', {
      description: 'Your project is now live and visible to workers'
    });
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Post a Project</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : step.icon}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium whitespace-nowrap ${
                      currentStep >= step.id ? 'text-primary' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 md:w-24 h-1 mx-2 md:mx-4 mb-6 transition-all ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Details</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => updateField('type', 'regular')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      projectData.type === 'regular'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">📅</div>
                    <div className="font-semibold">Regular Project</div>
                    <div className="text-sm text-gray-600">Standard timeline</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('type', 'emergency')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      projectData.type === 'emergency'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">🚨</div>
                    <div className="font-semibold">Emergency / QuickHire</div>
                    <div className="text-sm text-gray-600">Urgent help needed</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Build a React Dashboard"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description *
                </label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe what you need done, specific requirements, expected deliverables..."
                  rows="6"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category
                </label>
                <select
                  value={projectData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="design">Design & Creative</option>
                  <option value="home-services">Home Services</option>
                  <option value="moving">Moving & Delivery</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Timeline */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Budget & Timeline</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Budget Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => updateField('budgetType', 'fixed')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      projectData.budgetType === 'fixed'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">Fixed Price</div>
                    <div className="text-sm text-gray-600">One-time payment</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('budgetType', 'hourly')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      projectData.budgetType === 'hourly'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">Hourly Rate</div>
                    <div className="text-sm text-gray-600">Pay per hour</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Minimum Budget ($) *
                  </label>
                  <input
                    type="number"
                    value={projectData.minBudget}
                    onChange={(e) => updateField('minBudget', e.target.value)}
                    placeholder="500"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Maximum Budget ($) *
                  </label>
                  <input
                    type="number"
                    value={projectData.maxBudget}
                    onChange={(e) => updateField('maxBudget', e.target.value)}
                    placeholder="2000"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Timeline *
                </label>
                <select
                  value={projectData.timeline}
                  onChange={(e) => updateField('timeline', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select timeline</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="1-2-weeks">1-2 Weeks</option>
                  <option value="2-4-weeks">2-4 Weeks</option>
                  <option value="1-3-months">1-3 Months</option>
                  <option value="3-6-months">3-6 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Urgency Level
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['low', 'normal', 'high'].map(level => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => updateField('urgency', level)}
                      className={`p-3 rounded-lg border-2 capitalize transition-all ${
                        projectData.urgency === level
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Skills Required */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills Required</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Select skills needed for this project
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableSkills.map(skill => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        projectData.skills.includes(skill)
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Selected: {projectData.skills.length} skills
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Location Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => updateField('location', 'remote')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      projectData.location === 'remote'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">Remote</div>
                    <div className="text-sm text-gray-600">Work from anywhere</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('location', 'on-site')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      projectData.location === 'on-site'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">On-Site</div>
                    <div className="text-sm text-gray-600">At specific location</div>
                  </button>
                </div>
              </div>

              {projectData.location === 'on-site' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Specific Location *
                  </label>
                  <input
                    type="text"
                    value={projectData.specificLocation}
                    onChange={(e) => updateField('specificLocation', e.target.value)}
                    placeholder="Enter address or area"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Post */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Project</h2>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Project Type</h3>
                  <p className="text-gray-900 capitalize">{projectData.type === 'emergency' ? '🚨 Emergency / QuickHire' : '📅 Regular Project'}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Title</h3>
                  <p className="text-gray-900">{projectData.title || 'Not specified'}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-900">{projectData.description || 'Not specified'}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Budget</h3>
                  <p className="text-gray-900">
                    ${projectData.minBudget} - ${projectData.maxBudget} ({projectData.budgetType})
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Timeline</h3>
                  <p className="text-gray-900 capitalize">{projectData.timeline?.replace('-', ' ') || 'Not specified'}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {projectData.skills.length > 0 ? (
                      projectData.skills.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-blue-100 text-primary rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">None selected</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                  <p className="text-gray-900 capitalize">
                    {projectData.location === 'remote' ? 'Remote' : projectData.specificLocation || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="ml-auto px-8 py-3 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-colors"
              >
                Post Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
