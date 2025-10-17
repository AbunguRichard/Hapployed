import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Briefcase, MapPin, Phone, AlertCircle, Mic, Sparkles,
  TrendingUp, Package, Car, Wrench, Home, Scissors, PawPrint,
  Code, PenTool, Calculator, BookOpen, Megaphone, Camera,
  CheckCircle2, ChevronRight, Zap, Award, Shield
} from 'lucide-react';
import { toast } from 'sonner';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_visual-evolution/artifacts/l0gczbs1_background_AI-removebg-preview%20%281%29.png';

export default function CreateProfilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState(null); // 'professional' or 'general'
  const [voiceMode, setVoiceMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    lookingFor: 'opportunities',
    // Professional fields
    portfolio: '',
    experience: '',
    // General worker fields
    physicalCapability: [],
    hasVehicle: false,
    maxDistance: '10',
    availability: [],
    workPreference: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { createProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  // Skill categories
  const professionalSkills = [
    { id: 'react', label: 'React', icon: Code, keywords: ['react', 'web', 'frontend', 'javascript'] },
    { id: 'design', label: 'Design', icon: PenTool, keywords: ['design', 'ui', 'ux', 'graphic', 'figma'] },
    { id: 'writing', label: 'Writing', icon: BookOpen, keywords: ['writing', 'content', 'copy', 'blog'] },
    { id: 'accounting', label: 'Accounting', icon: Calculator, keywords: ['accounting', 'bookkeeping', 'finance'] },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, keywords: ['marketing', 'seo', 'social media'] },
    { id: 'photography', label: 'Photography', icon: Camera, keywords: ['photo', 'photography', 'video'] },
  ];

  const generalSkills = [
    { id: 'moving', label: 'Moving & Lifting', icon: Package, keywords: ['moving', 'lifting', 'boxes', 'furniture'] },
    { id: 'delivery', label: 'Delivery', icon: Car, keywords: ['delivery', 'driving', 'transport', 'courier'] },
    { id: 'cleaning', label: 'Cleaning', icon: Home, keywords: ['cleaning', 'housekeeping', 'janitorial'] },
    { id: 'handyman', label: 'Handyman', icon: Wrench, keywords: ['repair', 'handyman', 'fixing', 'maintenance'] },
    { id: 'landscaping', label: 'Yard Work', icon: TrendingUp, keywords: ['yard', 'landscaping', 'gardening', 'lawn'] },
    { id: 'petcare', label: 'Pet Care', icon: PawPrint, keywords: ['pet', 'dog', 'cat', 'animal'] },
  ];

  const physicalCapabilities = [
    { id: 'lift50', label: 'Can lift up to 50 lbs', icon: Package },
    { id: 'vehicle', label: 'I have a car or van', icon: Car },
    { id: 'outdoors', label: 'I can work outdoors', icon: TrendingUp },
    { id: 'tools', label: 'I have my own tools', icon: Wrench },
  ];

  const availabilityOptions = [
    { id: 'mornings', label: 'Mornings' },
    { id: 'afternoons', label: 'Afternoons' },
    { id: 'evenings', label: 'Evenings' },
    { id: 'weekends', label: 'Weekends' },
    { id: 'anytime', label: 'Anytime' },
  ];

  // Auto-detect user type based on skills
  const detectUserType = (skillInput) => {
    const input = skillInput.toLowerCase();
    const isProfessional = professionalSkills.some(s => 
      s.keywords.some(k => input.includes(k))
    );
    const isGeneral = generalSkills.some(s => 
      s.keywords.some(k => input.includes(k))
    );

    if (isProfessional && !isGeneral) return 'professional';
    if (isGeneral && !isProfessional) return 'general';
    return null;
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(s => s !== skillId)
        : [...prev.skills, skillId]
    }));
  };

  const handleCapabilityToggle = (capId) => {
    setFormData(prev => ({
      ...prev,
      physicalCapability: prev.physicalCapability.includes(capId)
        ? prev.physicalCapability.filter(c => c !== capId)
        : [...prev.physicalCapability, capId]
    }));
  };

  const handleAvailabilityToggle = (availId) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(availId)
        ? prev.availability.filter(a => a !== availId)
        : [...prev.availability, availId]
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !userType) {
      toast.error('Please select at least one skill to continue');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createProfile({
        ...formData,
        userType,
        createdAt: new Date().toISOString(),
      });
      
      localStorage.setItem('showOnboarding', 'true');
      localStorage.setItem('userType', userType);
      
      toast.success(`Welcome aboard, ${formData.fullName.split(' ')[0]}!`, {
        description: userType === 'professional' 
          ? 'Your profile is ready. Let\'s find you great projects!' 
          : 'You\'re all set! Let\'s find gigs near you.',
        duration: 3000,
      });
      
      setTimeout(() => {
        navigate(next);
      }, 500);
    } catch (err) {
      setError('Failed to create profile. Please try again.');
      toast.error('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={LOGO_URL} alt="Hapployed" className="w-12 h-12 object-contain" />
            <span className="text-3xl font-bold text-foreground">Hapployed</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {currentStep === 1 && 'What kind of work do you do?'}
            {currentStep === 2 && 'Tell us about yourself'}
            {currentStep === 3 && userType === 'professional' && 'Professional Details'}
            {currentStep === 3 && userType === 'general' && 'Your Capabilities'}
          </h1>
          <p className="text-muted-foreground">
            {currentStep === 1 && 'Select your skills - we\'ll customize your experience'}
            {currentStep === 2 && 'Basic information to get you started'}
            {currentStep === 3 && userType === 'professional' && 'Show clients what makes you great'}
            {currentStep === 3 && userType === 'general' && 'Help us find the perfect gigs for you'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of 3</span>
            <span className="text-sm font-semibold text-primary">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          {/* Step 1: Skills Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Voice Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-accent/10 border border-accent/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Voice Setup</p>
                    <p className="text-sm text-muted-foreground">Tell us what you do</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceMode(!voiceMode)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    voiceMode ? 'bg-accent' : 'bg-muted'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    voiceMode ? 'translate-x-6' : ''
                  }`} />
                </button>
              </div>

              {/* Professional Skills */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Professional Skills
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {professionalSkills.map(skill => {
                    const Icon = skill.icon;
                    const isSelected = formData.skills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => {
                          handleSkillToggle(skill.id);
                          if (!userType) setUserType('professional');
                        }}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <p className={`text-sm font-semibold ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}>{skill.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* General Skills */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-accent" />
                  General & Labor
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {generalSkills.map(skill => {
                    const Icon = skill.icon;
                    const isSelected = formData.skills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => {
                          handleSkillToggle(skill.id);
                          if (!userType) setUserType('general');
                        }}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                          isSelected
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${
                          isSelected ? 'text-accent' : 'text-muted-foreground'
                        }`} />
                        <p className={`text-sm font-semibold ${
                          isSelected ? 'text-accent' : 'text-foreground'
                        }`}>{skill.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Detection Message */}
              {userType && (
                <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {userType === 'professional' 
                        ? 'Great! You\'re a skilled professional'
                        : 'Awesome! You\'re a hands-on worker'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {userType === 'professional'
                        ? 'We\'ll connect you with remote projects and contracts'
                        : 'We\'ll find local gigs that match your availability'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Basic Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="San Francisco, CA"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userType === 'general' 
                    ? 'We\'ll show you gigs nearby' 
                    : 'Helps us find relevant opportunities'}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Professional Details */}
          {currentStep === 3 && userType === 'professional' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bio / About You
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell clients about your experience, expertise, and what makes you unique..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Portfolio / Website (Optional)
                </label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Years of Experience
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select experience</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: General Worker Details */}
          {currentStep === 3 && userType === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  What can you do?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {physicalCapabilities.map(cap => {
                    const Icon = cap.icon;
                    const isSelected = formData.physicalCapability.includes(cap.id);
                    return (
                      <button
                        key={cap.id}
                        type="button"
                        onClick={() => handleCapabilityToggle(cap.id)}
                        className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${
                          isSelected ? 'text-accent' : 'text-muted-foreground'
                        }`} />
                        <span className={`text-sm font-medium ${
                          isSelected ? 'text-accent' : 'text-foreground'
                        }`}>{cap.label}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-accent ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  How far can you travel for gigs?
                </label>
                <select
                  name="maxDistance"
                  value={formData.maxDistance}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="5">Within 5 miles</option>
                  <option value="10">Within 10 miles</option>
                  <option value="15">Within 15 miles</option>
                  <option value="25">Within 25 miles</option>
                  <option value="50">Within 50 miles</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  When are you available?
                </label>
                <div className="flex flex-wrap gap-2">
                  {availabilityOptions.map(option => {
                    const isSelected = formData.availability.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleAvailabilityToggle(option.id)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-accent bg-accent text-white'
                            : 'border-border text-foreground hover:border-accent'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <strong>Quick tip:</strong> Turn on location to see nearby gigs instantly!
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:border-primary hover:text-primary transition-all"
              >
                Back
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Profile...' : 'Complete Profile'}
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span>Verified & Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            <span>Earn Badges</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>AI Matching</span>
          </div>
        </div>
      </div>
    </div>
  );
}