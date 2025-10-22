import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Briefcase, Wrench, Mic, Edit3, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import VoiceCaptureModal from '../components/VoiceCaptureModal';
import { useAuth } from '../context/AuthContext';

export default function PostProjectPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'regular';
  const isGuest = searchParams.get('guest') === 'true';
  
  const [workType, setWorkType] = useState(null); // 'project' or 'gig'
  const [currentStep, setCurrentStep] = useState(1);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    specificLocation: '',
    duration: ''
  });

  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const steps = [
    { id: 1, name: workType === 'gig' ? 'Gig Details' : 'Project Details', icon: '📋' },
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

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !projectData.skills.includes(customSkillInput.trim())) {
      setProjectData(prev => ({
        ...prev,
        skills: [...prev.skills, customSkillInput.trim()]
      }));
      setCustomSkillInput('');
      toast.success('Custom skill added!');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProjectData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const addCustomCategory = () => {
    if (customCategoryInput.trim() && !projectData.customCategories.includes(customCategoryInput.trim())) {
      setProjectData(prev => ({
        ...prev,
        customCategories: [...prev.customCategories, customCategoryInput.trim()]
      }));
      setCustomCategoryInput('');
      toast.success('Custom category added!');
    }
  };

  const removeCustomCategory = (categoryToRemove) => {
    setProjectData(prev => ({
      ...prev,
      customCategories: prev.customCategories.filter(c => c !== categoryToRemove)
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

  const handleSubmit = async (saveAsDraft = false) => {
    // Check if guest user
    if (isGuest) {
      toast.error('Sign up required to post jobs', {
        description: 'Create an account to publish your job posting'
      });
      navigate('/auth/signup?role=hirer');
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.error('Please sign in to post a job');
      navigate('/auth/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const jobType = workType === 'gig' ? 'gig' : 'project';
      
      // Prepare job data for backend
      const jobData = {
        userId: user.id || user.email,
        userEmail: user.email,
        jobType: jobType,
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        skills: projectData.skills,
        budget: {
          type: projectData.budgetType,
          amount: projectData.budgetType === 'fixed' 
            ? parseFloat(projectData.maxBudget) 
            : parseFloat(projectData.minBudget),
          currency: 'USD'
        },
        timeline: projectData.timeline || projectData.duration,
        location: {
          type: projectData.location,
          address: projectData.specificLocation || ''
        },
        urgency: projectData.urgency,
        status: saveAsDraft ? 'draft' : 'published',
        requirements: projectData.description
      };

      // Save to backend
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        throw new Error('Failed to post job');
      }

      const createdJob = await response.json();

      toast.success(
        saveAsDraft 
          ? 'Job saved as draft!' 
          : `${workType === 'gig' ? 'Gig' : 'Project'} posted successfully!`, 
        {
          description: saveAsDraft 
            ? 'You can publish it later from My Jobs' 
            : `Your ${jobType} is now live and visible to workers`
        }
      );

      setTimeout(() => {
        navigate('/my-jobs');
      }, 1500);

    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job', {
        description: 'Please try again or contact support'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open voice capture modal from initial cards - go directly to form
  const handleVoiceInputFromCard = (type) => {
    setWorkType(type);
    setCurrentStep(1);
    // Open modal after a short delay so user sees the transition
    setTimeout(() => {
      setIsVoiceModalOpen(true);
    }, 300);
  };
  
  // Open voice capture modal from form header
  const handleVoiceInputFromForm = () => {
    setIsVoiceModalOpen(true);
  };

  // AI Price Estimator
  const handleEstimatePrice = async () => {
    try {
      setIsEstimatingPrice(true);
      setPriceEstimate(null);
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/estimate-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: projectData.category || 'Other',
          description: projectData.description || '',
          location: projectData.location || 'remote',
          specificLocation: projectData.specificLocation || '',
          urgency: projectData.urgency || 'normal',
          workType: workType,
          duration: projectData.duration || ''
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to estimate price');
      }
      
      const estimate = await response.json();
      setPriceEstimate(estimate);
      
      // Optionally pre-fill the budget fields with AI suggestion
      toast.success('💡 AI price estimate ready!', {
        description: 'Review the suggestion below'
      });
      
    } catch (error) {
      console.error('Error estimating price:', error);
      toast.error('Failed to get price estimate', {
        description: 'Please try again or set budget manually'
      });
    } finally {
      setIsEstimatingPrice(false);
    }
  };

  const applyPriceEstimate = () => {
    if (priceEstimate) {
      updateField('minBudget', priceEstimate.minPrice.toString());
      updateField('maxBudget', priceEstimate.maxPrice.toString());
      toast.success('Price range applied!');
    }
  };

  // AI parsing of voice input to auto-fill form
  const handleTranscriptComplete = async (text, type) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('🤖 AI is processing your request...');
      
      // Call backend API for AI parsing
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/parse-voice-input`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: text,
          workType: type
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to parse voice input');
      }
      
      const parsedData = await response.json();
      
      // Update project data with AI-parsed fields
      setProjectData({
        ...projectData,
        title: parsedData.title || '',
        description: parsedData.description || text,
        category: parsedData.category || 'Other',
        duration: parsedData.duration || '',
        location: parsedData.location || 'remote',
        specificLocation: parsedData.specificLocation || '',
        minBudget: parsedData.minBudget || '',
        maxBudget: parsedData.maxBudget || '',
        urgency: parsedData.urgency || 'normal',
        type: parsedData.type || 'regular',
        skills: parsedData.skills || []
      });
      
      // Set work type and move to step 1
      setWorkType(type);
      setCurrentStep(1);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('✨ AI has filled your form!', {
        description: 'Review and adjust the details as needed'
      });
      
    } catch (error) {
      console.error('Error parsing voice input:', error);
      toast.error('Failed to process voice input', {
        description: 'Please try again or fill the form manually'
      });
      
      // Fallback: Set basic data manually
      setProjectData({
        ...projectData,
        description: text
      });
      setWorkType(type);
      setCurrentStep(1);
    }
  };

  // If work type is not selected, show selection screen
  if (!workType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>
        </header>

        {/* Work Type Selection */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              What kind of work do you need done?
            </h1>
            <p className="text-xl text-gray-600">
              Help us match you with the right professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Professional Project Card */}
            <div className="group relative bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-purple-500 hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-6 right-6 flex items-center gap-3">
                {/* Voice Input Button */}
                <div className="relative group/tooltip">
                  <button
                    onClick={() => handleVoiceInputFromCard('project')}
                    className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-all"
                    title="Voice input"
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <p>Speak your request and AI will fill the form automatically</p>
                    </div>
                    <div className="absolute top-full right-4 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
                
                {/* Manual Input Button */}
                <div className="relative group/tooltip2">
                  <button
                    onClick={() => setWorkType('project')}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all"
                    title="Manual input"
                  >
                    <Edit3 className="w-5 h-5 text-gray-700" />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover/tooltip2:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="flex items-start gap-2">
                      <Edit3 className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p>Tap to open a quick inline form. Type details without leaving this card.</p>
                    </div>
                    <div className="absolute top-full right-4 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  A Professional Project
                </h2>
                <p className="text-gray-600 mb-4">
                  For complex, skilled work like design, development, marketing, or consulting. Often remote.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Ideal for:</p>
                <div className="flex flex-wrap gap-2">
                  {['Web Developers', 'Graphic Designers', 'Consultants', 'Writers'].map((role) => (
                    <span key={role} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-4 transition-all">
                <span>Continue with Project</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Local Gig Card */}
            <div className="group relative bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-6 right-6 flex items-center gap-3">
                {/* Voice Input Button */}
                <div className="relative group/tooltip3">
                  <button
                    onClick={() => handleVoiceInputFromCard('gig')}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all"
                    title="Voice input"
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover/tooltip3:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <p>Speak your request and AI will fill the form automatically</p>
                    </div>
                    <div className="absolute top-full right-4 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
                
                {/* Manual Input Button */}
                <div className="relative group/tooltip4">
                  <button
                    onClick={() => setWorkType('gig')}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all"
                    title="Manual input"
                  >
                    <Edit3 className="w-5 h-5 text-gray-700" />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover/tooltip4:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="flex items-start gap-2">
                      <Edit3 className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p>Tap to open a quick inline form. Type details without leaving this card.</p>
                    </div>
                    <div className="absolute top-full right-4 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  A Local Gig / Task
                </h2>
                <p className="text-gray-600 mb-4">
                  For immediate, local help with general labor, repairs, or tasks.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Ideal for:</p>
                <div className="flex flex-wrap gap-2">
                  {['Plumbers', 'Cleaners', 'Movers', 'Handymen', 'Event Staff'].map((role) => (
                    <span key={role} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
                <span>Continue with Gig</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Voice Capture Modal */}
          <VoiceCaptureModal
            isOpen={isVoiceModalOpen}
            onClose={() => setIsVoiceModalOpen(false)}
            onTranscriptComplete={handleTranscriptComplete}
            workType={workType}
          />
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">
              {workType === 'gig' ? 'Post a Gig' : 'Post a Project'}
            </h1>
            
            {/* Voice-Only Mode Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Voice-Only Mode</span>
              </div>
              <button
                onClick={handleVoiceInputFromForm}
                className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:shadow-xl"
                title="Voice input"
              >
                <Mic className="w-6 h-6 text-white" />
              </button>
            </div>
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
        <div className="bg-gray-100 rounded-xl shadow-md p-8">
          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {workType === 'gig' ? 'Gig Details' : 'Project Details'}
              </h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {workType === 'gig' ? 'Gig' : 'Project'} Type *
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
                    <div className="font-semibold">{workType === 'gig' ? 'Regular Gig' : 'Regular Project'}</div>
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
                  {workType === 'gig' ? 'Gig Title' : 'Project Title'} *
                </label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder={workType === 'gig' ? 'e.g., Need Help Moving Furniture' : 'e.g., Build a React Dashboard'}
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

                {/* Custom Categories when "Other" is selected */}
                {projectData.category === 'other' && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Add Custom Categories
                      </label>
                      <div className="flex gap-2">
                        <textarea
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              addCustomCategory();
                            }
                          }}
                          placeholder="Type your custom category and press Enter or click Add"
                          rows="3"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                        <button
                          type="button"
                          onClick={addCustomCategory}
                          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors self-start"
                        >
                          Add
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Press Enter or click "Add" to add each category. You can add as many as you need.
                      </p>
                    </div>

                    {/* Display added custom categories */}
                    {projectData.customCategories.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Your Custom Categories ({projectData.customCategories.length})
                        </h4>
                        <div className="space-y-2">
                          {projectData.customCategories.map((category, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3"
                            >
                              <div className="flex-1 text-gray-900">{category}</div>
                              <button
                                type="button"
                                onClick={() => removeCustomCategory(category)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

              {/* AI Price Estimator */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Instant AI Price Estimator
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Fair pay for every gig. AI suggests pricing based on skill, distance, urgency & market trends.
                    </p>
                    <button
                      type="button"
                      onClick={handleEstimatePrice}
                      disabled={isEstimatingPrice || !projectData.category}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isEstimatingPrice ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Get AI Price Estimate
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Price Estimate Results */}
                {priceEstimate && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">AI Suggested Range</div>
                        <div className="text-2xl font-bold text-purple-600">
                          ${priceEstimate.minPrice} - ${priceEstimate.maxPrice}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                          Recommended: <span className="font-semibold text-green-600">${priceEstimate.suggestedPrice}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={applyPriceEstimate}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all"
                      >
                        Apply Range
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{priceEstimate.explanation}</p>
                    
                    {/* Price Factors */}
                    {priceEstimate.factors && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Price Factors:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(priceEstimate.factors).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-gray-600 capitalize">{key.replace('_', ' ')}: {value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!projectData.category && (
                  <p className="mt-3 text-xs text-amber-600">
                    ℹ️ Please fill in Project Details (Step 1) before getting a price estimate
                  </p>
                )}
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
                <div className="flex flex-wrap gap-3 mb-4">
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

                {/* Add Custom Skill */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Add Custom Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomSkill();
                        }
                      }}
                      placeholder="Type a skill and press Enter or click Add"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Can't find the skill you need? Add as many custom skills as you want!
                  </p>
                </div>

                {/* Display selected skills with remove option */}
                {projectData.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Selected Skills ({projectData.skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {projectData.skills.map(skill => (
                        <div
                          key={skill}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:bg-white/20 rounded-full p-1 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

                {projectData.category && (
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Category</h3>
                    <p className="text-gray-900 capitalize">{projectData.category.replace('-', ' ')}</p>
                    {projectData.category === 'other' && projectData.customCategories.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Custom Categories:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {projectData.customCategories.map((cat, index) => (
                            <li key={index} className="text-gray-900">{cat}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

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
              <div className="ml-auto flex gap-3">
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      {workType === 'gig' ? 'Post Gig' : 'Post Project'}
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voice Capture Modal for Form */}
      <VoiceCaptureModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptComplete={handleTranscriptComplete}
        workType={workType}
      />
    </div>
  );
}
