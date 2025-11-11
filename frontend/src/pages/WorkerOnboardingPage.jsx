import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Briefcase, Settings, ChevronRight, ChevronLeft, 
  Check, MapPin, DollarSign, Clock, Award, Star, Zap 
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PREDEFINED_SKILLS = [
  { id: 'react', name: 'React', category: 'Technology' },
  { id: 'python', name: 'Python', category: 'Technology' },
  { id: 'javascript', name: 'JavaScript', category: 'Technology' },
  { id: 'nodejs', name: 'Node.js', category: 'Technology' },
  { id: 'design', name: 'UI/UX Design', category: 'Creative' },
  { id: 'writing', name: 'Content Writing', category: 'Creative' },
  { id: 'photography', name: 'Photography', category: 'Creative' },
  { id: 'marketing', name: 'Digital Marketing', category: 'Business' },
  { id: 'sales', name: 'Sales', category: 'Business' },
  { id: 'accounting', name: 'Accounting', category: 'Business' },
  { id: 'project-management', name: 'Project Management', category: 'Business' },
  { id: 'data-analysis', name: 'Data Analysis', category: 'Technology' },
];

export default function WorkerOnboardingPage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    name: user?.name || '',
    phone: '',
    location: '',
    bio: '',
  });

  // Step 2: Skills & Experience
  const [skillsData, setSkillsData] = useState({
    selectedSkills: [],
    customSkill: '',
    hourlyRate: '',
    experienceLevel: 'intermediate', // entry, intermediate, expert
  });

  // Step 3: Work Preferences
  const [preferences, setPreferences] = useState({
    availability: 'part-time', // full-time, part-time, contract
    workLocation: ['remote'], // remote, onsite, hybrid
    categories: [],
    availableNow: false,
    radius: 10,
  });

  const CATEGORIES = [
    'Web Development', 'Mobile Development', 'Design', 'Writing',
    'Marketing', 'Sales', 'Accounting', 'Project Management',
    'Data Analysis', 'Photography', 'Video Editing'
  ];

  // Handle skill selection
  const toggleSkill = (skillName) => {
    setSkillsData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skillName)
        ? prev.selectedSkills.filter(s => s !== skillName)
        : [...prev.selectedSkills, skillName]
    }));
  };

  const addCustomSkill = () => {
    const skill = skillsData.customSkill.trim();
    if (skill && !skillsData.selectedSkills.includes(skill)) {
      setSkillsData(prev => ({
        ...prev,
        selectedSkills: [...prev.selectedSkills, skill],
        customSkill: ''
      }));
      toast.success('Skill added!');
    }
  };

  const toggleWorkLocation = (location) => {
    setPreferences(prev => ({
      ...prev,
      workLocation: prev.workLocation.includes(location)
        ? prev.workLocation.filter(l => l !== location)
        : [...prev.workLocation, location]
    }));
  };

  const toggleCategory = (category) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // Validation
  const isStep1Valid = () => {
    return basicInfo.name.trim() && basicInfo.location.trim() && basicInfo.bio.trim();
  };

  const isStep2Valid = () => {
    return skillsData.selectedSkills.length > 0 && skillsData.hourlyRate;
  };

  const isStep3Valid = () => {
    return preferences.workLocation.length > 0 && preferences.categories.length > 0;
  };

  // Navigation
  const handleNext = () => {
    if (currentStep === 1 && !isStep1Valid()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (currentStep === 2 && !isStep2Valid()) {
      toast.error('Please select at least one skill and set your hourly rate');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit onboarding
  const handleSubmit = async () => {
    if (!isStep3Valid()) {
      toast.error('Please complete all preferences');
      return;
    }

    setLoading(true);
    try {
      const userId = user.id || user.email;
      
      // Create worker profile
      const profileData = {
        userId: userId,
        name: basicInfo.name,
        email: user.email,
        phone: basicInfo.phone,
        location: basicInfo.location,
        bio: basicInfo.bio,
        skills: skillsData.selectedSkills,
        hourlyRate: parseFloat(skillsData.hourlyRate),
        experienceLevel: skillsData.experienceLevel,
        availability: preferences.availability,
        workPreferences: {
          workLocation: preferences.workLocation,
          categories: preferences.categories,
          availableNow: preferences.availableNow,
          radius: preferences.radius
        },
        badges: [],
        portfolioLinks: [],
        rating: 0,
        completedGigs: 0,
        isAvailable: preferences.availableNow
      };

      const response = await fetch(`${BACKEND_URL}/api/worker-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create profile');
      }

      // Update auth context to mark profile as complete
      if (updateProfile) {
        await updateProfile({ 
          ...user, 
          name: basicInfo.name,
          roles: { 
            ...user.roles, 
            workerOnboardingComplete: true 
          } 
        });
      }

      toast.success('🎉 Welcome to Hapployed! Your profile is ready!');
      
      // Redirect to worker dashboard
      setTimeout(() => {
        navigate('/epic-worker-dashboard');
      }, 1500);

    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3].map(step => (
          <div key={step} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
              currentStep >= step 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > step ? <Check className="w-5 h-5" /> : step}
            </div>
            {step < 3 && (
              <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs font-medium text-gray-600">
        <span>Basic Info</span>
        <span>Skills & Rate</span>
        <span>Preferences</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            Quick Setup - 3 Steps
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Hapployed! 👋
          </h1>
          <p className="text-gray-600">
            Let's set up your worker profile and get you started on your first gig
          </p>
        </div>

        <ProgressBar />

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
          
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                  <p className="text-gray-600">Tell us about yourself</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={basicInfo.phone}
                  onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={basicInfo.location}
                    onChange={(e) => setBasicInfo({ ...basicInfo, location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={basicInfo.bio}
                  onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
                  placeholder="Tell clients about your experience and what makes you great..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {basicInfo.bio.length}/500 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Skills & Experience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Skills & Experience</h2>
                  <p className="text-gray-600">What are you good at?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Your Skills <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {PREDEFINED_SKILLS.map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.name)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        skillsData.selectedSkills.includes(skill.name)
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill.name}
                      {skillsData.selectedSkills.includes(skill.name) && (
                        <Check className="inline w-4 h-4 ml-1" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Add Custom Skill */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillsData.customSkill}
                    onChange={(e) => setSkillsData({ ...skillsData, customSkill: e.target.value })}
                    placeholder="Add custom skill..."
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                  />
                  <button
                    onClick={addCustomSkill}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hourly Rate (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={skillsData.hourlyRate}
                    onChange={(e) => setSkillsData({ ...skillsData, hourlyRate: e.target.value })}
                    placeholder="50"
                    min="0"
                    step="5"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'entry', label: 'Entry Level', icon: Star },
                    { value: 'intermediate', label: 'Intermediate', icon: Award },
                    { value: 'expert', label: 'Expert', icon: Zap }
                  ].map(level => {
                    const Icon = level.icon;
                    return (
                      <button
                        key={level.value}
                        onClick={() => setSkillsData({ ...skillsData, experienceLevel: level.value })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          skillsData.experienceLevel === level.value
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-semibold">{level.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Work Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Work Preferences</h2>
                  <p className="text-gray-600">How do you like to work?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Availability
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'full-time', label: 'Full-time' },
                    { value: 'part-time', label: 'Part-time' },
                    { value: 'contract', label: 'Contract' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPreferences({ ...preferences, availability: option.value })}
                      className={`p-3 rounded-xl border-2 font-semibold transition-all ${
                        preferences.availability === option.value
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Preferred Work Location <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['remote', 'onsite', 'hybrid'].map(location => (
                    <button
                      key={location}
                      onClick={() => toggleWorkLocation(location)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                        preferences.workLocation.includes(location)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {location}
                      {preferences.workLocation.includes(location) && (
                        <Check className="inline w-4 h-4 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Interested Categories <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        preferences.categories.includes(category)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                      {preferences.categories.includes(category) && (
                        <Check className="inline w-3 h-3 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.availableNow}
                    onChange={(e) => setPreferences({ ...preferences, availableNow: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Available for work now</div>
                    <div className="text-sm text-gray-600">Show recruiters you're ready to start immediately</div>
                  </div>
                </label>
              </div>

              {preferences.availableNow && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Radius: {preferences.radius} miles
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={preferences.radius}
                    onChange={(e) => setPreferences({ ...preferences, radius: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 mi</span>
                    <span>25 mi</span>
                    <span>50 mi</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-100">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Complete Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Skip Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/epic-worker-dashboard')}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  );
}
